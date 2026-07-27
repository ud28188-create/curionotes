import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS: { q: string; a: string[] }[] = [
  {
    q: "What exactly is CurioNotes?",
    a: [
      "CurioNotes is an AI notebook. You upload the material you're studying or researching — PDFs, Word documents, PowerPoint decks, Excel sheets, images and Markdown notes — and CurioNotes reads all of it.",
      "From there you can ask questions, generate summaries and revise, with every answer grounded in your own sources rather than the open internet.",
    ],
  },
  {
    q: "Which file types can I upload?",
    a: [
      "PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), Excel (.xls/.xlsx), images (PNG, JPG, WebP) and plain text or Markdown files. You can also type notes directly inside a notebook.",
      "Text is extracted automatically after upload, and images and PDFs are read by the multimodal model so diagrams and scans still work.",
    ],
  },
  {
    q: "How does the AI make sure answers are accurate?",
    a: [
      "You choose which sources the AI is allowed to read before every question. The model is instructed to answer only from those sources and to say plainly when something isn't covered.",
      "Answers cite the source titles inline, so you can always jump back and verify the original passage.",
    ],
  },
  {
    q: "Can I use multiple notes in a single question?",
    a: [
      "Yes. Select any combination of sources in a notebook — one, several or all of them — and the AI will reason across them together, comparing and combining what it finds.",
    ],
  },
  {
    q: "Can I read my uploaded files inside CurioNotes?",
    a: [
      "Yes. Every supported file opens in an in-app reader, so you can review a document or slide deck without downloading it to your device. A download button is always available if you want the original file.",
    ],
  },
  {
    q: "Is my data private?",
    a: [
      "Your notebooks and files are stored privately and are only accessible to your account. Nothing you upload is used to train models, and you can delete a note or an entire notebook at any time.",
    ],
  },
  {
    q: "What's the difference between the Free, Pro and Business plans?",
    a: [
      "Free is for trying CurioNotes with a small number of notebooks and sources. Pro raises those limits, unlocks larger uploads and faster AI responses. Business adds team workspaces, shared notebooks and priority support.",
      "You can change plan at any time — your notebooks stay exactly as they are.",
    ],
  },
  {
    q: "Does CurioNotes work on mobile?",
    a: [
      "Yes. Every page is fully responsive, so you can upload sources, read documents and chat with your notes from a phone or tablet with the same experience as on desktop.",
    ],
  },
];

function Item({ q, a }: { q: string; a: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/70">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-[17px] font-medium leading-snug text-emerald-700 sm:text-[19px]">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-emerald-700 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pb-7 pr-8">
            {a.map((p) => (
              <p key={p} className="text-[15px] leading-[1.7] text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="border-t border-border/60 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-[980px] px-6">
        <h2 className="text-[32px] font-bold tracking-tight text-foreground sm:text-[44px]">
          Want to learn more?
        </h2>
        <p className="mt-3 text-[15px] text-muted-foreground">Here are some answers to common questions.</p>

        <div className="mt-10">
          {FAQS.map((f) => (
            <Item key={f.q} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
