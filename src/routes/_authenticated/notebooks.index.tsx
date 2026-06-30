import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, BookOpen, Pencil, Trash2, LogOut, Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/notebooks/")({
  component: NotebooksPage,
});

type Notebook = {
  id: string; title: string; description: string | null; updated_at: string;
};

function NotebooksPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notebook[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

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
    if (!renameVal.trim()) return;
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
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const filtered = (items ?? []).filter(n => n.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/notebooks" className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 shrink-0">
              <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="url(#nbLogo)" />
                <defs><linearGradient id="nbLogo" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" /><stop offset="50%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#3b82f6" />
                </linearGradient></defs>
                <path d="M26 14a8 8 0 1 0 0 12" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span className="truncate text-base font-bold sm:text-lg">CurioNotes</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 shrink-0">
            <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span>
          </Button>
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
              <Button className="gap-2 rounded-full shrink-0"><Plus className="h-4 w-4" /><span className="hidden sm:inline">New</span><span className="sm:hidden">New</span></Button>
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items === null && Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
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
          {filtered.map(nb => (
            <div key={nb.id} className="group relative rounded-2xl border border-border/70 bg-card p-5 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.08)] transition hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.18)]">
              <Link to="/notebooks/$id" params={{ id: nb.id }} className="block">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {renameId === nb.id ? (
                      <Input autoFocus value={renameVal}
                        onClick={e => e.preventDefault()}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") { e.preventDefault(); rename(nb.id); }
                          if (e.key === "Escape") { e.preventDefault(); setRenameId(null); }
                        }} />
                    ) : (
                      <h3 className="truncate text-[15px] font-semibold">{nb.title}</h3>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">Updated {new Date(nb.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{nb.description ?? "Tap to open and add sources."}</p>
              </Link>
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-xs"
                  onClick={(e) => { e.preventDefault(); setRenameId(nb.id); setRenameVal(nb.title); }}>
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => { e.preventDefault(); remove(nb.id); }}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
