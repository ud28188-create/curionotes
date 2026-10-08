import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, BookOpen, Pencil, Trash2, Search, Sparkles, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileMenu } from "@/components/ProfileMenu";

export const Route = createFileRoute("/_authenticated/notebooks/")({
  component: NotebooksPage,
});

type Notebook = {
  id: string; title: string; description: string | null; updated_at: string;
};

// Palette of "sticky note" colors — each card picks one deterministically from its id.
const PALETTE = [
  { bg: "#FEF3C7", tape: "rgba(251, 191, 36, 0.55)", ring: "#F59E0B" }, // amber
  { bg: "#DCFCE7", tape: "rgba(16, 185, 129, 0.5)", ring: "#10B981" },  // emerald
  { bg: "#DBEAFE", tape: "rgba(59, 130, 246, 0.5)", ring: "#3B82F6" },  // blue
  { bg: "#FCE7F3", tape: "rgba(244, 114, 182, 0.5)", ring: "#EC4899" }, // pink
  { bg: "#EDE9FE", tape: "rgba(139, 92, 246, 0.5)", ring: "#8B5CF6" },  // violet
  { bg: "#FFE4E6", tape: "rgba(244, 63, 94, 0.5)", ring: "#F43F5E" },   // rose
];

function palette(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function NotebooksPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notebook[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [renameOriginal, setRenameOriginal] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("notebooks")
      .select("id, title, description, updated_at")
      .order("updated_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function createNotebook() {
    if (!title.trim()) return;
    setCreating(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("notebooks")
      .insert({ title: title.trim(), user_id: u.user!.id })
      .select("id").single();
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    setOpen(false); setTitle("");
    toast.success("Notebook created");
    navigate({ to: "/notebooks/$id", params: { id: data!.id } });
  }

  async function rename(id: string) {
    if (!renameVal.trim() || renameVal.trim() === renameOriginal) { setRenameId(null); return; }
    const { error } = await supabase.from("notebooks").update({ title: renameVal.trim() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRenameId(null);
    toast.success("Renamed");
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this notebook and all its notes?")) return;
    const { error } = await supabase.from("notebooks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  }

  const filtered = (items ?? []).filter(n => n.title.toLowerCase().includes(q.toLowerCase()));
  const isRenameDirty = (nb: Notebook) => renameVal.trim() !== "" && renameVal.trim() !== nb.title;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/notebooks" className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 shrink-0">
              <img src="/curionotes-logo.png" alt="CurioNotes logo" className="h-full w-full object-contain" />
            </div>
            <span className="truncate text-base font-bold sm:text-lg">CurioNotes</span>
          </Link>
          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">Your notebooks</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create a notebook for each project, course, or topic.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full shrink-0"><Plus className="h-4 w-4" /><span>New notebook</span></Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>New notebook</DialogTitle></DialogHeader>
              <Input autoFocus placeholder="e.g. Machine Learning 101"
                value={title} onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createNotebook()} />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={createNotebook} disabled={creating || !title.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search notebooks"
            className="pl-9 rounded-full bg-secondary/60 border-transparent" />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items === null && Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
          {items !== null && filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No notebooks yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first notebook to start uploading sources.</p>
              <Button className="mt-5 rounded-full" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create notebook</Button>
            </div>
          )}
          {filtered.map((nb, i) => {
            const p = palette(nb.id);
            const rotate = (i % 3) - 1; // -1, 0, 1
            const editing = renameId === nb.id;
            return (
              <div key={nb.id}
                className="group relative pt-4"
                style={{ transform: `rotate(${rotate * 0.4}deg)` }}>
                {/* washi tape */}
                <div className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 -translate-y-2 rounded-sm shadow-sm"
                  style={{ background: p.tape, transform: `translate(-50%, -8px) rotate(${rotate * 2}deg)` }} />

                <Link to="/notebooks/$id" params={{ id: nb.id }}
                  className="block relative overflow-hidden rounded-[18px] p-5 pt-6 shadow-[0_10px_28px_-16px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-18px_rgba(0,0,0,0.28)]"
                  style={{ background: p.bg }}>
                  {/* Red margin line */}
                  <div className="pointer-events-none absolute inset-y-0 left-8 w-px bg-red-400/60" />
                  {/* Ruled lines */}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.18]"
                    style={{
                      backgroundImage: "linear-gradient(to bottom, transparent 26px, rgba(0,0,0,0.35) 27px, transparent 28px)",
                      backgroundSize: "100% 28px",
                    }} />

                  <div className="relative pl-6">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 ring-1 ring-black/5">
                        <BookOpen className="h-4 w-4" style={{ color: p.ring }} />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-black/50">Notebook</span>
                    </div>

                    <div className="mt-4 min-h-[64px]">
                      {editing ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
                          <Input autoFocus value={renameVal}
                            onChange={e => setRenameVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") { e.preventDefault(); rename(nb.id); }
                              if (e.key === "Escape") { e.preventDefault(); setRenameId(null); }
                            }}
                            className="h-9 rounded-lg bg-white/80" />
                          <Button size="icon" className="h-9 w-9 shrink-0 rounded-lg"
                            disabled={!isRenameDirty(nb)}
                            onClick={(e) => { e.preventDefault(); rename(nb.id); }}
                            title="Save">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 rounded-lg"
                            onClick={(e) => { e.preventDefault(); setRenameId(null); }}
                            title="Cancel">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <h3 className="line-clamp-2 text-[19px] font-semibold leading-snug text-black/85"
                          style={{ fontFamily: "'Caveat', 'Segoe Script', cursive" }}>
                          {nb.title}
                        </h3>
                      )}
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-black/45">
                        Updated {new Date(nb.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Pencil stub sticking out */}
                  <div className="pointer-events-none absolute -right-4 bottom-4 h-3 w-16 rotate-[-25deg] rounded-sm bg-yellow-400 shadow-sm">
                    <div className="absolute left-0 top-0 h-full w-2 rounded-l-sm bg-pink-400" />
                    <div className="absolute right-0 top-0 h-full w-0 border-y-[6px] border-l-[8px] border-y-transparent border-l-neutral-800" />
                  </div>
                </Link>

                <div className="mt-3 flex items-center justify-end gap-1">
                  <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-xs"
                    onClick={() => { setRenameId(nb.id); setRenameVal(nb.title); setRenameOriginal(nb.title); }}>
                    <Pencil className="h-3.5 w-3.5" /> Rename
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => remove(nb.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
