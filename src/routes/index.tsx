import { createFileRoute } from "@tanstack/react-router";
import { Check, Play, FileText, ChevronDown, Github, Twitter } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-9 w-9">
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#logoGrad)" />
          <path d="M26 14a8 8 0 1 0 0 12" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <span className="text-[20px] font-bold tracking-tight text-foreground">CurioNotes</span>
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-9 md:flex">
          <a href="#overview" className="relative text-[15px] font-semibold text-foreground">
            Overview
            <span className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-foreground" />
          </a>
          <a href="#features" className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-5">
          <a href="#" aria-label="Discord" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          </a>
          <a href="#" aria-label="GitHub" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block">
            <Github className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Twitter" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block">
            <Twitter className="h-[18px] w-[18px]" />
          </a>
          <a href="#get-started" className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-[14px] font-semibold text-background transition-transform hover:scale-[1.02]">
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-[1100px] text-center">
        <h1 className="text-[52px] font-bold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-[72px] md:text-[96px]">
          Understand <span className="text-gradient-brand">Anything</span>
        </h1>
        <p className="mx-auto mt-7 max-w-[620px] text-[17px] leading-[1.6] text-muted-foreground md:text-[19px]">
          Your AI notebook that turns your notes into knowledge.
          <br className="hidden sm:block" />
          Upload, organize, and chat with your documents.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a href="#get-started" className="inline-flex h-[52px] items-center justify-center rounded-full bg-foreground px-8 text-[15px] font-semibold text-background shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.02]">
            Get Started Free
          </a>
          <a href="#demo" className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-border bg-background px-7 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary">
            <Play className="h-4 w-4 fill-current" />
            See How It Works
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px] text-muted-foreground">
          <TrustItem label="Secure & Private" />
          <TrustItem label="AI-Powered" />
          <TrustItem label="Works with any file" />
        </div>
      </div>
    </section>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-[16px] w-[16px] text-emerald-500" strokeWidth={3} />
      {label}
    </span>
  );
}

const SLIDES = [
  {
    icon: <FileText className="h-5 w-5 text-emerald-600" />,
    title: "Upload your sources",
    body: "Upload PDFs, images, PowerPoints, Excel files, webpages, and more. CurioNotes will understand them all.",
    bullets: ["PDF, DOCX, PPTX, XLSX", "Images & Scanned Notes (OCR)", "Web Links & YouTube Videos", "Unlimited Notes & Folders"],
  },
];

function FeatureCarousel() {
  const [idx] = useState(0);
  const slide = SLIDES[idx];
  return (
    <section id="features" className="px-6 pb-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <h2 className="text-[34px] font-bold tracking-[-0.025em] text-foreground md:text-[44px]">
            Your AI-Powered Study Partner
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
            CurioNotes helps you learn faster, remember more, and get smarter answers
            <br className="hidden sm:block" />
            from your own notes and documents.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-10 md:mt-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-16">
          {/* Left */}
          <div className="md:pt-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
              {slide.icon}
            </div>
            <h3 className="mt-6 text-[24px] font-bold tracking-tight text-foreground">{slide.title}</h3>
            <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">{slide.body}</p>
            <ul className="mt-7 space-y-3.5">
              {slide.bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-[14.5px] text-foreground/85">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <Check className="h-3 w-3 text-emerald-600" strokeWidth={3.5} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Right preview card */}
          <div className="relative">
            <div
              className="relative rounded-[28px] p-6 md:p-8"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(59,130,246,0.10) 55%, rgba(139,92,246,0.10))",
              }}
            >
              {/* user bubble */}
              <div className="flex justify-end">
                <div className="rounded-full border border-emerald-300/70 bg-white px-5 py-2.5 text-[14px] font-medium text-foreground shadow-sm">
                  Can you summarize this chapter?
                </div>
              </div>

              {/* analyzing */}
              <div className="mt-6 flex items-center gap-2.5 text-[14px] text-muted-foreground">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "var(--gradient-brand)" }}>
                  <span className="block h-2 w-2 rounded-full bg-white" />
                </span>
                Analyzing your documents...
              </div>

              {/* summary card */}
              <div className="mt-4 rounded-2xl border border-border/70 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
                <div className="text-[15px] font-semibold text-foreground">Summary</div>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-muted-foreground">
                  This chapter explains the fundamental concepts of machine learning including supervised learning, unsupervised learning, model training, and evaluation metrics. The key takeaway is understanding how algorithms learn patterns from data and make predictions...
                </p>
                <button className="mt-4 flex w-full items-center justify-between rounded-xl border border-border/70 px-3.5 py-2.5 text-[13.5px] text-foreground/80 transition-colors hover:bg-secondary">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Sources (3)
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* pagination dots */}
            <div className="mt-6 flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === 0 ? "w-6 bg-emerald-500" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="overview">
        <Hero />
        <FeatureCarousel />
      </main>
    </div>
  );
}
