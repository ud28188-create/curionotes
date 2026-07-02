// Client + server text extraction for common document types.
// Works with either a File (browser) or an ArrayBuffer (server).

const MAX_EXTRACT_CHARS = 200_000;

function clamp(s: string) {
  return s.length > MAX_EXTRACT_CHARS ? s.slice(0, MAX_EXTRACT_CHARS) + "\n\n[…truncated]" : s;
}

async function toBuffer(input: File | ArrayBuffer): Promise<ArrayBuffer> {
  if (input instanceof ArrayBuffer) return input;
  return await input.arrayBuffer();
}

async function toText(input: File | ArrayBuffer): Promise<string> {
  if (input instanceof ArrayBuffer) return new TextDecoder().decode(new Uint8Array(input));
  return await input.text();
}

export async function extractTextFromFile(
  input: File | ArrayBuffer,
  kind: string,
): Promise<string | null> {
  try {
    if (kind === "text" || kind === "markdown") {
      return clamp(await toText(input));
    }
    if (kind === "excel") {
      const XLSX = await import("xlsx");
      const buf = await toBuffer(input);
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
      const buf = await toBuffer(input);
      const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
      return clamp(value || "");
    }
    if (kind === "powerpoint") {
      const JSZip = (await import("jszip")).default;
      const buf = await toBuffer(input);
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
