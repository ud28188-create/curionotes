import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askNotes } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  History,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

type Note = { id: string; title: string; kind: string };
type Msg = { role: "user" | "assistant"; content: string };
type Thread = { id: string; title: string; updated_at: string };

function titleFrom(q: string) {
  const t = q.replace(/\s+/g, " ").trim();
  return t.length > 60 ? `${t.slice(0, 57)}…` : t || "New chat";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
}

export function AiChat({
  notebookId,
  notes,
}: {
  notebookId: string;
  notes: Note[];
}) {
  const ask = useServerFn(askNotes);
  const { user } = useSession();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const refreshThreads = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id,title,updated_at")
      .eq("notebook_id", notebookId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (!error && data) setThreads(data as Thread[]);
  }, [notebookId, user]);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  async function openThread(id: string) {
    setThreadId(id);
    setHistoryOpen(false);
    setLoadingThread(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role,content")
      .eq("thread_id", id)
      .order("created_at", { ascending: true });
    setLoadingThread(false);
    if (error) {
      toast.error("Could not load that chat");
      return;
    }
    setMessages((data ?? []).map((m) => ({ role: m.role as Msg["role"], content: m.content })));
  }

  function newChat() {
    setThreadId(null);
    setMessages([]);
    setHistoryOpen(false);
  }

  async function deleteThread(id: string) {
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete chat");
      return;
    }
    setThreads((t) => t.filter((x) => x.id !== id));
    if (threadId === id) newChat();
    toast.success("Chat deleted");
  }

  async function saveRename(id: string) {
    const title = renameValue.trim();
    if (!title) return;
    const { error } = await supabase.from("chat_threads").update({ title }).eq("id", id);
    if (error) {
      toast.error("Could not rename chat");
      return;
    }
    setThreads((t) => t.map((x) => (x.id === id ? { ...x, title } : x)));
    setRenaming(null);
  }

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function selectAll() {
    setSelected(new Set(notes.map((n) => n.id)));
  }
  function clearAll() {
    setSelected(new Set());
  }

  async function persist(tid: string, role: Msg["role"], content: string) {
    if (!user) return;
    const { error } = await supabase
      .from("chat_messages")
      .insert({ thread_id: tid, user_id: user.id, role, content });
    if (error) console.warn("chat persist failed", error.message);
  }

  async function send() {
    const q = question.trim();
    if (!q) return;
    if (selected.size === 0) {
      toast.error("Select at least one note for the AI to read");
      return;
    }
    const history = messages.slice(-10);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setQuestion("");
    setLoading(true);

    // Ensure a saved conversation exists so history survives reloads.
    let tid = threadId;
    if (!tid && user) {
      const { data: created, error: cErr } = await supabase
        .from("chat_threads")
        .insert({ notebook_id: notebookId, user_id: user.id, title: titleFrom(q) })
        .select("id,title,updated_at")
        .single();
      if (cErr) {
        console.warn("thread create failed", cErr.message);
      } else if (created) {
        tid = created.id;
        setThreadId(created.id);
        setThreads((t) => [created as Thread, ...t]);
      }
    }
    if (tid) await persist(tid, "user", q);

    try {
      const res = await ask({
        data: {
          notebookId,
          noteIds: Array.from(selected),
          question: q,
          history,
        },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.answer }]);
      if (tid) {
        await persist(tid, "assistant", res.answer);
        refreshThreads();
      }
      if (res.skippedMedia > 0) {
        toast.warning(
          `${res.skippedMedia} media source${res.skippedMedia === 1 ? "" : "s"} skipped — select up to 8 images/PDFs per question.`,
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${msg}` }]);
      if (tid) await persist(tid, "assistant", `⚠️ ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  const activeTitle = threads.find((t) => t.id === threadId)?.title;

  return (
    <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-50/40 via-white to-blue-50/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold leading-tight">
              {activeTitle ?? "Ask your notes"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {activeTitle ? "Saved chat in this notebook" : "Grounded answers from the sources you pick."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setHistoryOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 hover:bg-secondary/70"
          >
            <History className="h-3.5 w-3.5" /> History
            {threads.length > 0 && (
              <span className="rounded-full bg-foreground/10 px-1.5 text-[10px]">{threads.length}</span>
            )}
          </button>
          <button
            onClick={newChat}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 hover:bg-secondary/70"
          >
            <Plus className="h-3.5 w-3.5" /> New chat
          </button>
        </div>
      </div>

      {historyOpen && (
        <div className="mt-4 rounded-2xl border border-border/70 bg-white/80 p-2">
          {threads.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">
              No saved chats yet in this notebook. Ask something to start one.
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {threads.map((t) => (
                <li
                  key={t.id}
                  className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition ${
                    t.id === threadId ? "bg-emerald-50 ring-1 ring-emerald-200" : "hover:bg-secondary/60"
                  }`}
                >
                  {renaming === t.id ? (
                    <>
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveRename(t.id)}
                        className="h-8 flex-1 rounded-lg text-sm"
                        autoFocus
                      />
                      <button onClick={() => saveRename(t.id)} className="text-emerald-600" aria-label="Save title">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setRenaming(null)} className="text-muted-foreground" aria-label="Cancel">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openThread(t.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{t.title}</span>
                        <span className="ml-auto shrink-0 pl-2 text-[11px] text-muted-foreground">
                          {timeAgo(t.updated_at)}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setRenaming(t.id);
                          setRenameValue(t.title);
                        }}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Rename chat"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteThread(t.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {notes.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border bg-white/60 p-4 text-center text-sm text-muted-foreground">
          Add at least one source to start chatting with your notes.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {notes.map((n) => {
              const on = selected.has(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => toggle(n.id)}
                  className={`group inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                    on
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border bg-white hover:border-emerald-300"
                  }`}
                >
                  {on && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate max-w-[180px]">{n.title}</span>
                </button>
              );
            })}
            <span className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
              <button onClick={selectAll} className="rounded-full bg-secondary px-3 py-1 hover:bg-secondary/70">Select all</button>
              <button onClick={clearAll} className="rounded-full bg-secondary px-3 py-1 hover:bg-secondary/70">Clear</button>
            </span>
          </div>

          {(messages.length > 0 || loadingThread) && (
            <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto rounded-2xl bg-white/60 p-4 ring-1 ring-border/60">
              {loadingThread && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading chat…
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing your sources…
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything about the selected notes… (Cmd/Ctrl+Enter to send)"
              rows={2}
              className="flex-1 rounded-2xl bg-white"
            />
            <Button
              onClick={send}
              disabled={loading || !question.trim() || selected.size === 0}
              className="h-auto gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 px-5 text-white hover:opacity-95"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ask AI
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {selected.size} source{selected.size === 1 ? "" : "s"} selected · chats are saved to this notebook
          </p>
        </>
      )}
    </div>
  );
}
