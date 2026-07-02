import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Upload, FileText, FileImage, FileSpreadsheet, Presentation,
  FileType, FileCode, Notebook as NotebookIcon, Plus, Trash2, X, ExternalLink,
  Download, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AiChat } from "@/components/AiChat";
import { extractTextFromFile } from "@/lib/file-extract";
import { ProfileMenu } from "@/components/ProfileMenu";

export const Route = createFileRoute("/_authenticated/notebooks/$id")({
  component: NotebookDetail,
});

type Note = {
  id: string; title: string; kind: string; status: string;
  content: string | null; storage_path: string | null;
  mime_type: string | null; size_bytes: number | null; created_at: string;
};

type Job = { id: string; name: string; progress: number };

const KIND_ICON: Record<string, React.ElementType> = {
  pdf: FileText, word: FileType, powerpoint: Presentation, excel: FileSpreadsheet,
  image: FileImage, markdown: FileCode, text: FileText, link: ExternalLink,
};

// Client-side upload validation
const MAX_FILE_MB = 25;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ALLOWED_EXT = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".csv",
  ".md", ".markdown", ".txt",
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic", ".bmp", ".svg",
];

function kindFromFile(file: File): string {
  const t = file.type, n = file.name.toLowerCase();
  if (t.includes("pdf") || n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".doc") || n.endsWith(".docx")) return "word";
  if (n.endsWith(".ppt") || n.endsWith(".pptx")) return "powerpoint";
  if (n.endsWith(".xls") || n.endsWith(".xlsx") || n.endsWith(".csv")) return "excel";
  if (t.startsWith("image/")) return "image";
  if (n.endsWith(".md") || n.endsWith(".markdown")) return "markdown";
  return "text";
}

function validateFile(file: File): string | null {
  const n = file.name.toLowerCase();
  const okExt = ALLOWED_EXT.some((e) => n.endsWith(e)) || file.type.startsWith("image/");
  if (!okExt) return `"${file.name}" is not a supported format`;
  if (file.size > MAX_FILE_BYTES) return `"${file.name}" is larger than ${MAX_FILE_MB}MB`;
  if (file.size === 0) return `"${file.name}" is empty`;
  return null;
}

function NotebookDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [nbTitle, setNbTitle] = useState<string>("");
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<Note | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data: nb } = await supabase.from("notebooks").select("title").eq("id", id).maybeSingle();
    if (!nb) { toast.error("Notebook not found"); navigate({ to: "/notebooks" }); return; }
    setNbTitle(nb.title);
    const { data, error } = await supabase
      .from("notes").select("id,title,kind,status,content,storage_path,mime_type,size_bytes,created_at")
      .eq("notebook_id", id).order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setNotes(data ?? []);
  }, [id, navigate]);
  useEffect(() => { load(); }, [load]);

  async function uploadFiles(rawFiles: File[]) {
    const errs: string[] = [];
    const files: File[] = [];
    for (const f of rawFiles) {
      const err = validateFile(f);
      if (err) errs.push(err); else files.push(f);
    }
    setUploadErrors(errs);
    if (errs.length) errs.forEach((e) => toast.error(e));
    if (!files.length) return;

    const { data: u } = await supabase.auth.getUser();
    const uid = u.user!.id;
    for (const file of files) {
      const jobId = crypto.randomUUID();
      const kind = kindFromFile(file);
      setJobs(j => [...j, { id: jobId, name: file.name, progress: 6 }]);
      const path = `${uid}/${id}/${jobId}-${file.name}`;
      const tick = setInterval(() => {
        setJobs(j => j.map(x => x.id === jobId ? { ...x, progress: Math.min(70, x.progress + 6) } : x));
      }, 220);
      const { error: upErr } = await supabase.storage.from("notes").upload(path, file, { upsert: false });
      clearInterval(tick);
      if (upErr) {
        setJobs(j => j.filter(x => x.id !== jobId));
        toast.error(`${file.name}: ${upErr.message}`);
        continue;
      }
      setJobs(j => j.map(x => x.id === jobId ? { ...x, progress: 82 } : x));
      // Extract text content client-side so AI can read every format
      const content = await extractTextFromFile(file, kind);
      setJobs(j => j.map(x => x.id === jobId ? { ...x, progress: 94 } : x));
      const { error: insErr } = await supabase.from("notes").insert({
        user_id: uid, notebook_id: id, title: file.name, kind: kind as never,
        status: "ready", storage_path: path, mime_type: file.type || null, size_bytes: file.size,
        content,
      });
      setJobs(j => j.filter(x => x.id !== jobId));
      if (insErr) toast.error(insErr.message);
    }
    await load();
    toast.success("Sources added");
  }

  async function addManual(title: string, content: string, kind: "text" | "markdown") {
    if (!content.trim()) { toast.error("Write something first"); return; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("notes").insert({
      user_id: u.user!.id, notebook_id: id, title: title || "Untitled note",
      kind: kind as never, status: "ready", content,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Note saved");
    setOpen(false);
    load();
  }

  async function removeNote(n: Note) {
    if (!confirm(`Delete "${n.title}"?`)) return;
    if (n.storage_path) await supabase.storage.from("notes").remove([n.storage_path]);
    await supabase.from("notes").delete().eq("id", n.id);
    load();
  }

  async function openNote(n: Note) {
    setViewing(n); setViewUrl(null);
    if (n.storage_path) {
      const { data } = await supabase.storage.from("notes").createSignedUrl(n.storage_path, 60 * 30);
      setViewUrl(data?.signedUrl ?? null);

      // If no extracted content yet for a text-y kind, extract on the fly so the reader
      // shows the actual document text instead of just a download button.
      const needsExtract = !n.content && ["word", "excel", "powerpoint", "text", "markdown"].includes(n.kind);
      if (needsExtract) {
        try {
          const { data: blob } = await supabase.storage.from("notes").download(n.storage_path);
          if (blob) {
            const buf = await blob.arrayBuffer();
            const extracted = await extractTextFromFile(buf, n.kind);
            if (extracted && extracted.trim()) {
              await supabase.from("notes").update({ content: extracted }).eq("id", n.id);
              setViewing((cur) => (cur && cur.id === n.id ? { ...cur, content: extracted } : cur));
              setNotes((list) => list?.map((x) => x.id === n.id ? { ...x, content: extracted } : x) ?? list);
            }
          }
        } catch (e) {
          console.warn("re-extract failed", e);
        }
      }
    }
  }

  async function downloadNote(n: Note) {
    if (n.storage_path) {
      const { data } = await supabase.storage.from("notes").createSignedUrl(n.storage_path, 60, { download: n.title });
      if (data?.signedUrl) window.location.href = data.signedUrl;
      return;
    }
    if (n.content) {
      const blob = new Blob([n.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${n.title}.${n.kind === "markdown" ? "md" : "txt"}`;
      a.click(); URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
          <Link to="/notebooks" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="truncate text-base font-semibold sm:text-lg">{nbTitle || "…"}</h1>
          <Button onClick={() => setOpen(true)} className="gap-2 rounded-full">
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Add source</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
        <DropZone onFiles={uploadFiles} onClickUpload={() => fileRef.current?.click()} onWrite={() => setOpen(true)} />
        <input ref={fileRef} type="file" multiple hidden
          accept={ALLOWED_EXT.join(",") + ",image/*"}
          onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) uploadFiles(f); e.target.value = ""; }} />

        {uploadErrors.length > 0 && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <div className="mb-1 font-medium text-destructive">Some files were rejected</div>
            <ul className="list-inside list-disc text-destructive/90">
              {uploadErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">Allowed: PDF, Word, PowerPoint, Excel, images, Markdown. Max {MAX_FILE_MB}MB per file.</p>
          </div>
        )}

        {jobs.length > 0 && (
          <div className="mt-6 space-y-3">
            {jobs.map(j => (
              <div key={j.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{j.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">Indexing… {j.progress}%</span>
                </div>
                <Progress value={j.progress} className="mt-3 h-1.5" />
              </div>
            ))}
          </div>
        )}

        <section className="mt-10">
          <AiChat
            notebookId={id}
            notes={(notes ?? []).map(n => ({ id: n.id, title: n.title, kind: n.kind }))}
          />
        </section>

        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Sources</h2>
            <span className="text-xs text-muted-foreground">{notes?.length ?? 0} item{(notes?.length ?? 0) === 1 ? "" : "s"}</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes === null && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            {notes !== null && notes.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                  <NotebookIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold">No sources yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Upload a document or write a note to get started.</p>
              </div>
            )}
            {notes?.map(n => {
              const Icon = KIND_ICON[n.kind] ?? FileText;
              return (
                <div key={n.id} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 transition hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.18)]">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="h-5 w-5 text-foreground/80" />
                  </div>
                  <button onClick={() => openNote(n)} className="min-w-0 text-left">
                    <div className="truncate text-sm font-semibold">{n.title}</div>
                    <div className="mt-0.5 truncate text-xs uppercase tracking-wide text-muted-foreground">
                      {n.kind} · {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => openNote(n)}>Open</Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => downloadNote(n)} title="Download">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeNote(n)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <AddSourceDialog open={open} onOpenChange={setOpen}
        onPickFiles={() => fileRef.current?.click()}
        onSaveManual={addManual} />

      <Dialog open={!!viewing} onOpenChange={() => { setViewing(null); setViewUrl(null); }}>
        <DialogContent className="max-w-4xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b flex flex-row items-center justify-between gap-3">
            <DialogTitle className="truncate pr-8">{viewing?.title}</DialogTitle>
            {viewing && (
              <Button size="sm" variant="outline" className="shrink-0 gap-1.5 rounded-full" onClick={() => downloadNote(viewing)}>
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            )}
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto p-6">
            {/* Images and PDFs render natively from storage */}
            {viewing?.storage_path && viewing.kind === "image" && viewUrl && (
              <img src={viewUrl} alt={viewing.title} className="mx-auto max-h-[60vh] rounded-xl" />
            )}
            {viewing?.storage_path && viewing.kind === "pdf" && viewUrl && (
              <iframe src={viewUrl} className="h-[65vh] w-full rounded-xl border" title={viewing.title} />
            )}
            {/* Text-extracted content (docx, xlsx, pptx, csv, md, txt, or manual notes) */}
            {viewing && viewing.kind !== "image" && viewing.kind !== "pdf" && viewing.content && (
              <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-relaxed text-foreground/90">{viewing.content}</pre>
            )}
            {/* Fallback: binary file with no extracted text */}
            {viewing && viewing.storage_path && viewing.kind !== "image" && viewing.kind !== "pdf" && !viewing.content && (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
                Preview not available for this format. Use the Download button above to open it locally.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DropZone({ onFiles, onClickUpload, onWrite }: { onFiles: (f: File[]) => void; onClickUpload: () => void; onWrite: () => void }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const f = Array.from(e.dataTransfer.files); if (f.length) onFiles(f); }}
      className={`rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition ${over ? "border-emerald-400 bg-emerald-50/40" : "border-border bg-card"}`}
    >
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "linear-gradient(135deg,rgba(16,185,129,.15),rgba(59,130,246,.15))" }}>
        <Upload className="h-6 w-6 text-emerald-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Upload your sources</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Drop PDFs, Word, PowerPoint, Excel, images, or markdown here — or write a note yourself.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onClickUpload} className="gap-2 rounded-full"><Upload className="h-4 w-4" /> Choose files</Button>
        <Button onClick={onWrite} variant="outline" className="gap-2 rounded-full"><Pencil className="h-4 w-4" /> Write a note</Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">PDF · DOCX · PPTX · XLSX · CSV · MD · TXT · Images · Max {MAX_FILE_MB}MB</p>
    </div>
  );
}

function AddSourceDialog({
  open, onOpenChange, onPickFiles, onSaveManual,
}: {
  open: boolean; onOpenChange: (b: boolean) => void;
  onPickFiles: () => void;
  onSaveManual: (title: string, content: string, kind: "text" | "markdown") => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const reset = () => { setTitle(""); setBody(""); };
  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  return (
    <Dialog open={open} onOpenChange={(b) => { onOpenChange(b); if (!b) reset(); }}>
      <DialogContent className="max-w-xl rounded-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Add a source</DialogTitle>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </DialogHeader>
        <Tabs defaultValue="upload" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">Upload file</TabsTrigger>
            <TabsTrigger value="text" className="flex-1">Write note</TabsTrigger>
            <TabsTrigger value="markdown" className="flex-1">Markdown</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">PDF, Word, PowerPoint, Excel, images, or Markdown. Up to {MAX_FILE_MB}MB.</p>
              <Button className="mt-4 rounded-full" onClick={() => { onOpenChange(false); onPickFiles(); }}>
                <Upload className="h-4 w-4" /> Choose files
              </Button>
            </div>
          </TabsContent>
          {(["text", "markdown"] as const).map(k => (
            <TabsContent key={k} value={k} className="mt-4 space-y-3">
              <Input placeholder="Note title" value={title} onChange={e => setTitle(e.target.value)} />
              <Textarea rows={10} placeholder={k === "markdown" ? "# Heading\n\nWrite markdown here…" : "Start typing your note…"}
                value={body} onChange={e => setBody(e.target.value)} className="rounded-xl" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{wordCount} word{wordCount === 1 ? "" : "s"}</span>
                <span>Saved to this notebook · readable by AI</span>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={() => onSaveManual(title, body, k)} disabled={!body.trim()}>Save note</Button>
              </DialogFooter>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
