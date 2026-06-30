import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

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

    // Fetch selected notes scoped to this user + notebook
    const { data: notes, error } = await supabase
      .from("notes")
      .select("id,title,kind,content,storage_path,mime_type")
      .eq("notebook_id", data.notebookId)
      .eq("user_id", userId)
      .in("id", data.noteIds);

    if (error) throw new Error(error.message);
    if (!notes || notes.length === 0) throw new Error("No accessible notes selected");

    // Build grounded context. For text/markdown, inline. For binary, include title only.
    let total = 0;
    const sections: string[] = [];
    const multimodalParts: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: string }
      | { type: "file"; data: string; mediaType: string }
    > = [];

    for (const n of notes) {
      let body = "";
      if (n.content && (n.kind === "text" || n.kind === "markdown" || n.kind === "link")) {
        body = n.content.slice(0, MAX_CHARS_PER_NOTE);
      } else if (n.storage_path && (n.kind === "image" || n.kind === "pdf")) {
        // Download and attach as multimodal
        const { data: blob, error: dErr } = await supabase.storage
          .from("notes")
          .download(n.storage_path);
        if (!dErr && blob) {
          const buf = new Uint8Array(await blob.arrayBuffer());
          // base64 encode
          let bin = "";
          for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
          const b64 = btoa(bin);
          if (n.kind === "image") {
            multimodalParts.push({
              type: "image",
              image: `data:${n.mime_type || "image/png"};base64,${b64}`,
            });
            body = `[Image attached: ${n.title}]`;
          } else {
            multimodalParts.push({
              type: "file",
              data: `data:application/pdf;base64,${b64}`,
              mediaType: "application/pdf",
            });
            body = `[PDF attached: ${n.title}]`;
          }
        }
      } else {
        body = `[Binary ${n.kind.toUpperCase()} file "${n.title}" — content not extracted on server. Ask the user to convert to PDF or paste key passages as a text note for deeper analysis.]`;
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
      { role: "system" as const, content: system },
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userParts },
    ];

    try {
      const result = await generateText({
        model,
        messages: messages as never,
      });
      return { answer: result.text };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("429")) throw new Error("AI is rate limited. Please try again shortly.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please upgrade your plan.");
      throw new Error(msg);
    }
  });
