import { Brain, FileStack, MessagesSquare, Search, ShieldCheck, Zap } from "lucide-react";

const items = [
  {
    icon: FileStack,
    title: "Any file, any format",
    body: "PDFs, Word, PowerPoint, Excel, images, markdown — drop it in and we index it in seconds.",
    tag: "Ingest",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: Brain,
    title: "AI that reads your notes",
    body: "Answers are grounded in the exact sources you choose. No invented facts, ever.",
    tag: "Grounded",
    accent: "from-teal-500 to-blue-500",
  },
  {
    icon: MessagesSquare,
    title: "Multi-source chat",
    body: "Select one note or twenty, ask follow-ups, and get cited answers you can trust.",
    tag: "Chat",
    accent: "from-blue-500 to-indigo-500",
  },
  {
    icon: Search,
    title: "Lightning search",
    body: "Find any passage across every notebook with debounced, instant filtering.",
    tag: "Find",
    accent: "from-emerald-500 to-blue-500",
  },
  {
    icon: ShieldCheck,
    title: "Private & secure",
    body: "Row-level security and encrypted storage. Your notes never train external models.",
    tag: "Secure",
    accent: "from-indigo-500 to-emerald-500",
  },
  {
    icon: Zap,
    title: "Built for speed",
    body: "Instant navigation, skeleton loaders, and a layout that never overflows on mobile.",
    tag: "Fast",
    accent: "from-amber-500 to-emerald-500",
  },
];

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden border-t border-border/60 bg-secondary/30 px-4 py-20 sm:px-6 sm:py-24">
      {/* soft ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1180px]">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3.5 py-1.5 text-[12.5px] font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
            Why CurioNotes
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[38px] md:text-[46px]">
            Everything you need to <span className="text-gradient-brand">learn smarter</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-[15.5px] leading-relaxed text-muted-foreground md:text-[17px]">
            A premium AI notebook built around your real study workflow — from the first upload to the final revision.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-[20px] border border-border/70 bg-card/90 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_50px_-24px_rgba(16,185,129,0.45)]"
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${f.accent} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${f.accent} text-white shadow-sm`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.tag}
                </span>
              </div>
              <h3 className="relative mt-5 text-[17px] font-semibold tracking-[-0.01em]">{f.title}</h3>
              <p className="relative mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
