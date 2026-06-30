import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy · CurioNotes" },
      { name: "description", content: "Learn how CurioNotes collects, uses, and protects your personal data." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 30, 2026</p>

        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-foreground/85">
          <section>
            <h2 className="text-xl font-semibold">Information We Collect</h2>
            <p>We collect account info (email, name), the notes and files you upload, and basic usage telemetry to operate and improve the Service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">How We Use Your Data</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>To provide notebook storage, search, and AI features grounded in your sources.</li>
              <li>To authenticate you and prevent abuse.</li>
              <li>To communicate important account and product updates.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold">AI Processing</h2>
            <p>When you use AI features, the selected notes are sent to our AI provider for inference. Your content is never used to train third-party models.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Data Storage & Security</h2>
            <p>Files are stored in encrypted object storage. Row-Level Security ensures only you can access your notebooks. We use industry-standard TLS for all data in transit.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Your Rights</h2>
            <p>You can export or delete your data at any time. Contact <a className="text-emerald-600 hover:underline" href="mailto:privacy@curionotes.app">privacy@curionotes.app</a> with privacy requests.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Cookies</h2>
            <p>We use essential cookies for authentication. We do not sell your data.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p>Email <a className="text-emerald-600 hover:underline" href="mailto:privacy@curionotes.app">privacy@curionotes.app</a> for any privacy questions.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
