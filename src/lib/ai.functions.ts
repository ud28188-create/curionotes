import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { extractTextFromFile } from "./file-extract";

const AskInput = z.object({
  notebookId: z.string().uuid(),
  noteIds: z.array(z.string().uuid()).min(1, "Select at least one note"),
  question: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .default([]),
});

const MAX_CHARS_PER_NOTE = 12_000;
const MAX_TOTAL_CHARS = 60_000;

export const askNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase, userId } = context;

    const { data: notes, error } = await supabase
      .from("notes")
      .select("id,title,kind,content,storage_path,mime_type")
      .eq("notebook_id", data.notebookId)
      .eq("user_id", userId)
      .in("id", data.noteIds);

    if (error) throw new Error(error.message);
    if (!notes || notes.length === 0) throw new Error("No accessible notes selected");

    let total = 0;
    const sections: string[] = [];
    const multimodalParts: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: string }
      | { type: "file"; data: string; mediaType: string }
    > = [];

    for (const n of notes) {
      let body = "";
      // Prefer inlined text content (already extracted client-side for most formats)
      if (n.content && n.content.trim().length > 0) {
        body = n.content.slice(0, MAX_CHARS_PER_NOTE);
      } else if (n.storage_path) {
        // Download and handle by kind
        const { data: blob, error: dErr } = await supabase.storage
          .from("notes")
          .download(n.storage_path);
        if (!dErr && blob) {
          if (n.kind === "image") {
            const buf = new Uint8Array(await blob.arrayBuffer());
            let bin = "";
            for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
            const b64 = btoa(bin);
            multimodalParts.push({
              type: "image",
              image: `data:${n.mime_type || "image/png"};base64,${b64}`,
            });
            body = `[Image attached: ${n.title}]`;
          } else if (n.kind === "pdf") {
            const buf = new Uint8Array(await blob.arrayBuffer());
            let bin = "";
            for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
            const b64 = btoa(bin);
            multimodalParts.push({
              type: "file",
              data: `data:application/pdf;base64,${b64}`,
              mediaType: "application/pdf",
            });
            body = `[PDF attached: ${n.title}]`;
          } else {
            // Server-side extract for word/excel/powerpoint/text/markdown
            const buffer = await blob.arrayBuffer();
            const extracted = await extractTextFromFile(buffer, n.kind);
            if (extracted && extracted.trim()) {
              body = extracted.slice(0, MAX_CHARS_PER_NOTE);
              // Persist for next time
              await supabase.from("notes").update({ content: extracted }).eq("id", n.id);
            } else {
              body = `[${n.kind.toUpperCase()} file "${n.title}" — no extractable text.]`;
            }
          }
        }
      } else {
        body = `[${n.kind.toUpperCase()} "${n.title}" — no content available.]`;
      }

      const section = `### Source: ${n.title} (${n.kind})\n${body}`;
      if (total + section.length > MAX_TOTAL_CHARS) break;
      total += section.length;
      sections.push(section);
    }

    const grounded = sections.join("\n\n---\n\n");

    const system = `You are CurioNotes, an AI study partner. Answer the user's question using ONLY the sources provided below. If the answer is not in the sources, say so plainly and suggest what additional source would help. Cite sources inline using their titles in [brackets] when relevant. Use clear, well-structured markdown with headings and bullet points when helpful.\n\nSOURCES:\n${grounded}`;

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const userParts: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: string }
      | { type: "file"; data: string; mediaType: string }
    > = [...multimodalParts, { type: "text", text: data.question }];

    const messages = [
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userParts },
    ];

    try {
      const result = await generateText({
        model,
        system,
        messages: messages as never,
        // Skip extended thinking for much faster answers.
        providerOptions: { lovable: { reasoning: { enabled: false } } },
      });
      return { answer: result.text };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("429")) throw new Error("AI is rate limited. Please try again shortly.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please upgrade your plan.");
      throw new Error(msg);
    }
  });
