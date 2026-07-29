import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { ResearchPartner } from "@/components/ResearchPartner";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How CurioNotes Works — Your AI Research Partner" },
      {
        name: "description",
        content:
          "See how CurioNotes turns PDFs, slides, spreadsheets and notes into study guides, briefings and cited answers in one click.",
      },
      { property: "og:title", content: "How CurioNotes Works — Your AI Research Partner" },
      {
        property: "og:description",
        content:
          "Upload your sources and get instant, cited insights — study guides, briefing docs, FAQs and timelines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1180px] px-6 pt-8">
        <Link
          to="/"
          preload="intent"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <main>
        <section className="px-6 pt-12 pb-4 text-center">
          <h1 className="mx-auto max-w-[820px] text-[38px] font-bold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-[56px]">
            See how <span className="text-gradient-brand">CurioNotes</span> works
          </h1>
          <p className="mx-auto mt-5 max-w-[600px] text-[16px] leading-[1.65] text-muted-foreground md:text-[18px]">
            Upload anything, ask anything. Every answer is grounded in your own sources, with citations
            back to the original file.
          </p>
        </section>

        <ResearchPartner />
      </main>

      <Footer />
    </div>
  );
}
