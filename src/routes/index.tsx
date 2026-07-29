import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Play, FileText, ChevronDown, Github, Twitter, Sparkles, MessageSquare, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Faq } from "@/components/Faq";


import { ProfileMenu } from "@/components/ProfileMenu";
import { useSession } from "@/hooks/use-session";

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
  const { session, loading } = useSession();
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
          {loading ? (
            <span className="h-10 w-[112px] animate-pulse rounded-full bg-secondary" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link
                to="/notebooks"
                preload="intent"
                className="hidden h-10 items-center rounded-full bg-foreground px-5 text-[14px] font-semibold text-background transition-transform hover:scale-[1.02] sm:inline-flex"
              >
                My notebooks
              </Link>
              <ProfileMenu />
            </div>
          ) : (
            <Link to="/auth" preload="intent" className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-[14px] font-semibold text-background transition-transform hover:scale-[1.02]">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { session } = useSession();
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
          <Link to={session ? "/notebooks" : "/auth"} preload="intent" className="inline-flex h-[52px] items-center justify-center rounded-full bg-foreground px-8 text-[15px] font-semibold text-background shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.02]">
            {session ? "Open my notebooks" : "Get Started Free"}
          </Link>
          <Link to="/how-it-works" preload="intent" className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-border bg-background px-7 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary">
            <Play className="h-4 w-4 fill-current" />
            See How It Works
          </Link>
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

type Slide = {
  icon: React.ReactNode;
  title: string;
  body: string;
  bullets: string[];
  demo: { question: string; heading: string; text: string; sources: number };
};

const SLIDES: Slide[] = [
  {
    icon: <FileText className="h-5 w-5 text-emerald-600" />,
    title: "Upload your sources",
    body: "Upload PDFs, images, PowerPoints, Excel files, webpages, and more. CurioNotes will understand them all.",
    bullets: ["PDF, DOCX, PPTX, XLSX", "Images & Scanned Notes (OCR)", "Markdown & Plain Text", "Unlimited Notes & Folders"],
    demo: { question: "Can you summarize this chapter?", heading: "Summary",
      text: "This chapter explains the fundamental concepts of machine learning including supervised, unsupervised learning, model training, and evaluation metrics…", sources: 3 },
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-emerald-600" />,
    title: "Chat with your notes",
    body: "Ask any question in plain English. CurioNotes cites the exact sources it used so you can trust every answer.",
    bullets: ["Grounded, cited answers", "Multi-source reasoning", "Follow-up conversations", "Study-partner tone"],
    demo: { question: "What was the key takeaway from lecture 4?", heading: "Key takeaway",
      text: "Lecture 4 argued that gradient descent converges reliably only when the learning rate is annealed as loss plateaus…", sources: 2 },
  },
  {
    icon: <Sparkles className="h-5 w-5 text-emerald-600" />,
    title: "Instant study aids",
    body: "Generate flashcards, quizzes, and study guides directly from your uploaded material — in seconds.",
    bullets: ["Auto flashcards", "Quick quizzes", "One-page study guides", "Export & share"],
    demo: { question: "Make 3 quiz questions from these slides.", heading: "Practice quiz",
      text: "1. What are the four V's of big data?\n2. Define overfitting in two sentences.\n3. When would you choose PCA over t-SNE?", sources: 4 },
  },
  {
    icon: <Layers className="h-5 w-5 text-emerald-600" />,
    title: "Organized for revision",
    body: "Everything you upload is grouped in beautiful, searchable notebooks — perfect for exam season.",
    bullets: ["Per-course notebooks", "Fast search & filters", "Recently updated first", "Works on any device"],
    demo: { question: "Which sources cover backpropagation?", heading: "Matching sources",
      text: "Backpropagation appears in [Deep Learning Chapter 6.pdf], [Lecture-04-slides.pptx], and your handwritten note 'Neural nets basics'.", sources: 3 },
  },
];

function FeatureCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, [paused]);

  const slide = SLIDES[idx];
  return (
    <section id="features" className="px-6 pb-28">
      <div className="mx-auto max-w-[1180px]"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
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
          <div key={`left-${idx}`} className="md:pt-4 animate-in fade-in slide-in-from-left-4 duration-500">
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
            <div key={`right-${idx}`} className="relative rounded-[28px] p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(59,130,246,0.10) 55%, rgba(139,92,246,0.10))",
              }}
            >
              <div className="flex justify-end">
                <div className="max-w-full rounded-full border border-emerald-300/70 bg-white px-5 py-2.5 text-[14px] font-medium text-foreground shadow-sm">
                  {slide.demo.question}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2.5 text-[14px] text-muted-foreground">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "var(--gradient-brand)" }}>
                  <span className="block h-2 w-2 rounded-full bg-white" />
                </span>
                Analyzing your documents...
              </div>

              <div className="mt-4 rounded-2xl border border-border/70 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
                <div className="text-[15px] font-semibold text-foreground">{slide.demo.heading}</div>
                <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.65] text-muted-foreground">
                  {slide.demo.text}
                </p>
                <button className="mt-4 flex w-full items-center justify-between rounded-xl border border-border/70 px-3.5 py-2.5 text-[13.5px] text-foreground/80 transition-colors hover:bg-secondary">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Sources ({slide.demo.sources})
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* clickable pagination dots */}
            <div className="mt-6 flex justify-center gap-2">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-emerald-500" : "w-1.5 bg-border hover:bg-muted-foreground/40"}`} />
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
        <ResearchPartner />
        <Features />
        <Pricing />
        <Faq />
      </main>


      <Footer />
    </div>
  );
}

