import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askNotes } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Note = { id: string; title: string; kind: string };
type Msg = { role: "user" | "assistant"; content: string };

export function AiChat({
  notebookId,
  notes,
}: {
  notebookId: string;
  notes: Note[];
}) {
  const ask = useServerFn(askNotes);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

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
      if (res.skippedMedia > 0) {
        toast.warning(
          `${res.skippedMedia} media source${res.skippedMedia === 1 ? "" : "s"} skipped — select up to 8 images/PDFs per question.`,
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-50/40 via-white to-blue-50/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight">Ask your notes</h2>
            <p className="text-xs text-muted-foreground">Grounded answers from the sources you pick.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={selectAll} className="rounded-full bg-secondary px-3 py-1 hover:bg-secondary/70">Select all</button>
          <button onClick={clearAll} className="rounded-full bg-secondary px-3 py-1 hover:bg-secondary/70">Clear</button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border bg-white/60 p-4 text-center text-sm text-muted-foreground">
          Add at least one source to start chatting with your notes.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
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
          </div>

          {messages.length > 0 && (
            <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto rounded-2xl bg-white/60 p-4 ring-1 ring-border/60">
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
            {selected.size} source{selected.size === 1 ? "" : "s"} selected · answers stay grounded in your notes
          </p>
        </>
      )}
    </div>
  );
}
