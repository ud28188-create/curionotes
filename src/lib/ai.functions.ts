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
// Providers cap how many media links a single request may carry, and worker memory
// caps how much we can inline. Keep media bounded so big selections never 500.
const MAX_MEDIA_ITEMS = 8;

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
    let mediaCount = 0;
    let skippedMedia = 0;
    const sections: string[] = [];
    const multimodalParts: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: URL }
      | { type: "file"; data: URL; mediaType: string }
    > = [];

    // Signed URLs let the model fetch media directly — no multi-MB base64 in worker memory.
    async function signedUrl(path: string): Promise<URL | null> {
      const { data: signed } = await supabase.storage
        .from("notes")
        .createSignedUrl(path, 60 * 30);
      if (!signed?.signedUrl) return null;
      try {
        return new URL(signed.signedUrl);
      } catch {
        return null;
      }
    }

    for (const n of notes) {
      let body = "";
      try {
        // Prefer inlined text content (already extracted for most formats)
        if (n.content && n.content.trim().length > 0) {
          body = n.content.slice(0, MAX_CHARS_PER_NOTE);
        } else if (n.storage_path && (n.kind === "image" || n.kind === "pdf")) {
          if (mediaCount >= MAX_MEDIA_ITEMS) {
            skippedMedia++;
            body = `[${n.kind === "image" ? "Image" : "PDF"} "${n.title}" was not analyzed in this message — too many media sources selected at once.]`;
          } else {
            const url = await signedUrl(n.storage_path);
            if (url) {
              if (n.kind === "image") {
                multimodalParts.push({ type: "image", image: url });
              } else {
                multimodalParts.push({
                  type: "file",
                  data: url,
                  mediaType: n.mime_type || "application/pdf",
                });
              }
              mediaCount++;
              body = `[${n.kind === "image" ? "Image" : "PDF"} attached: ${n.title}]`;
            } else {
              body = `[Could not open "${n.title}".]`;
            }
          }
        } else if (n.storage_path) {
          const { data: blob, error: dErr } = await supabase.storage
            .from("notes")
            .download(n.storage_path);
          if (!dErr && blob) {
            const buffer = await blob.arrayBuffer();
            const extracted = await extractTextFromFile(buffer, n.kind);
            if (extracted && extracted.trim()) {
              body = extracted.slice(0, MAX_CHARS_PER_NOTE);
              await supabase.from("notes").update({ content: extracted }).eq("id", n.id);
            } else {
              body = `[${n.kind.toUpperCase()} file "${n.title}" — no extractable text.]`;
            }
          } else {
            body = `[Could not read "${n.title}".]`;
          }
        } else {
          body = `[${n.kind.toUpperCase()} "${n.title}" — no content available.]`;
        }
      } catch (e) {
        console.warn("source prep failed", n.id, e);
        body = `[Could not process "${n.title}".]`;
      }

      const section = `### Source: ${n.title} (${n.kind})\n${body}`;
      if (total + section.length > MAX_TOTAL_CHARS) break;
      total += section.length;
      sections.push(section);
    }

    const grounded = sections.join("\n\n---\n\n");
    const inventory = notes
      .map((n, i) => `${i + 1}. ${n.title} (${n.kind})`)
      .join("\n");

    const system = `You are CurioNotes, an AI study partner. Answer the user's question using ONLY the sources provided below. If the answer is not in the sources, say so plainly and suggest what additional source would help. Cite sources inline using their titles in [brackets] when relevant. Use clear, well-structured markdown with headings and bullet points when helpful.

The user selected ${notes.length} source(s):
${inventory}
${skippedMedia > 0 ? `\nNote: ${skippedMedia} media source(s) could not be analyzed in this message due to per-request limits. Mention this if it affects the answer.` : ""}

SOURCES:
${grounded}`;

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const userParts: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: URL }
      | { type: "file"; data: URL; mediaType: string }
    > = [...multimodalParts, { type: "text", text: data.question }];

    const messages = [
      ...data.history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userParts },
    ];

    try {
      const result = streamText({
        model,
        system,
        messages: messages as never,
        maxRetries: 1,
        // Skip extended thinking for much faster answers.
        providerOptions: { lovable: { reasoning: { enabled: false } } },
      });
      // Stream on the wire, resolve to text: long analyses no longer hit request timeouts.
      const text = await result.text;
      if (!text || !text.trim()) {
        throw new Error("The AI returned an empty answer. Try fewer sources or a simpler question.");
      }
      return {
        answer: text,
        skippedMedia,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("askNotes failed", msg);
      if (msg.includes("429")) throw new Error("AI is busy right now. Please retry in a few seconds.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please upgrade your plan.");
      if (msg.includes("400"))
        throw new Error("This selection was too large or unsupported. Try selecting fewer sources.");
      throw new Error("The AI could not complete this request. Try fewer sources or rephrasing.");
    }
  });

