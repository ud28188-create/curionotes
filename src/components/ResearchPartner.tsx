import { Upload, Zap } from "lucide-react";

export function ResearchPartner() {
  return (
    <section id="research" className="border-t border-border/60 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-[1180px] px-6">
        <h2 className="text-center text-[30px] font-bold tracking-tight text-foreground sm:text-[42px]">
          Your AI-powered research partner
        </h2>

        <div className="mt-14 grid items-center gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-14">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Upload className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-[24px] font-bold tracking-tight text-foreground">Upload your sources</h3>
            <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
              Upload PDFs, Word documents, slide decks, spreadsheets, images and Markdown notes — CurioNotes
              reads every one of them, summarises the key ideas and connects the topics across your whole
              notebook.
            </p>
          </div>
          <div className="overflow-hidden rounded-[28px] bg-black shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] ring-1 ring-border/60">
            <video
              className="h-full w-full object-cover"
              src="/upload_your_sources.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        </div>

        <div className="mt-16 grid items-center gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-14">
          <div className="md:order-1">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Zap className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-[24px] font-bold tracking-tight text-foreground">Instant insights</h3>
            <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
              With all of your sources in place, turn them into a study guide, a briefing doc, an FAQ or a
              timeline in a single click — every answer grounded in the notes you uploaded, with citations
              back to the original source.
            </p>
          </div>
          <div className="overflow-hidden rounded-[28px] bg-black shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] ring-1 ring-border/60 md:order-2">
            <img
              src="/study_guide.png"
              alt="CurioNotes generating an instant study guide from uploaded sources"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
