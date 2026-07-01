// Client-side text extraction for common document types.
// Returned text is stored in notes.content so the AI can read every source
// without relying on multimodal attachments for non-PDF/image files.

const MAX_EXTRACT_CHARS = 200_000;

function clamp(s: string) {
  return s.length > MAX_EXTRACT_CHARS ? s.slice(0, MAX_EXTRACT_CHARS) + "\n\n[…truncated]" : s;
}

export async function extractTextFromFile(file: File, kind: string): Promise<string | null> {
  try {
    if (kind === "text" || kind === "markdown") {
      return clamp(await file.text());
    }
    if (kind === "excel") {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const out: string[] = [];
      for (const name of wb.SheetNames) {
        const sheet = wb.Sheets[name];
        out.push(`## Sheet: ${name}\n${XLSX.utils.sheet_to_csv(sheet)}`);
      }
      return clamp(out.join("\n\n"));
    }
    if (kind === "word") {
      const mammoth = await import("mammoth");
      const buf = await file.arrayBuffer();
      const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
      return clamp(value || "");
    }
    if (kind === "powerpoint") {
      const JSZip = (await import("jszip")).default;
      const buf = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      const slideFiles = Object.keys(zip.files)
        .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
        .sort();
      const parts: string[] = [];
      for (const path of slideFiles) {
        const xml = await zip.files[path].async("string");
        const text = xml
          .replace(/<a:br\s*\/>/g, "\n")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const idx = path.match(/slide(\d+)\.xml/)?.[1] ?? "?";
        if (text) parts.push(`## Slide ${idx}\n${text}`);
      }
      return clamp(parts.join("\n\n"));
    }
  } catch (e) {
    console.warn("extractTextFromFile failed", e);
  }
  return null;
}
