import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, ShieldCheck, Zap, Users } from "lucide-react";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About · CurioNotes" },
      { name: "description", content: "CurioNotes is the AI-powered notebook that turns documents, slides, and notes into knowledge you can chat with." },
    ],
  }),
});

const values = [
  { icon: Sparkles, title: "AI-first", body: "Every feature is designed around AI that actually understands your material." },
  { icon: ShieldCheck, title: "Private by default", body: "Your notes are encrypted and never used to train external models." },
  { icon: Zap, title: "Fast & focused", body: "A premium reading and writing experience without the bloat." },
  { icon: Users, title: "Built for learners", body: "From students to research teams, we obsess over comprehension." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mt-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight">About <span className="text-gradient-brand">CurioNotes</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            We're building the AI notebook we always wished existed — a place where every PDF, lecture slide, screenshot, and scribbled idea becomes part of one searchable, conversational knowledge base.
          </p>
        </div>

        <div className="mt-16 rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/50 p-8 sm:p-10">
          <h2 className="text-2xl font-bold">Our mission</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-foreground/85">
            Knowledge is locked up in PDFs, Notion docs, screenshots, and scattered notebooks. CurioNotes uses state-of-the-art AI to unify everything you read, save, and write — and lets you ask questions that get answered with citations from your own sources. No more guessing. No more lost ideas.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border/70 bg-card p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold">Get in touch</h2>
          <p className="mt-2 text-muted-foreground">We'd love to hear from you.</p>
          <Link to="/contact" className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background hover:opacity-90">
            Contact us
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
