import { Brain, FileStack, MessagesSquare, Search, ShieldCheck, Zap } from "lucide-react";

const items = [
  { icon: FileStack, title: "Any file, any format", body: "PDFs, Word, PowerPoint, Excel, images, markdown — drop it in and we'll index it." },
  { icon: Brain, title: "AI that reads your notes", body: "Ground answers in the exact sources you choose. No hallucinated facts." },
  { icon: MessagesSquare, title: "Multi-source chat", body: "Select one note or twenty. Ask follow-ups. Get cited answers in seconds." },
  { icon: Search, title: "Lightning search", body: "Find any passage across every notebook with debounced, instant results." },
  { icon: ShieldCheck, title: "Private & secure", body: "Row-level security and encrypted storage. Your notes never train external models." },
  { icon: Zap, title: "Built for speed", body: "Premium UI with instant navigation, skeleton loaders, and zero overflow on mobile." },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border/60 bg-secondary/30 px-6 py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <h2 className="text-[34px] font-bold tracking-[-0.025em] md:text-[44px]">Everything you need to learn smarter</h2>
          <p className="mx-auto mt-4 max-w-[620px] text-[16px] text-muted-foreground md:text-[17px]">
            A premium AI notebook built around your real workflow.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border/70 bg-card p-6 transition-shadow hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)]">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-[17px] font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
