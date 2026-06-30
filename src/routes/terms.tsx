import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service · CurioNotes" },
      { name: "description", content: "Read the CurioNotes Terms of Service governing use of our AI notebook platform." },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 30, 2026</p>

        <div className="prose prose-sm mt-10 max-w-none space-y-6 text-[15px] leading-relaxed text-foreground/85">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>By creating an account or using CurioNotes ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">2. Your Account</h2>
            <p>You are responsible for safeguarding your credentials and for all activity that occurs under your account. You must be at least 13 years old to use CurioNotes.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">3. Your Content</h2>
            <p>You retain ownership of all notes, files, and documents you upload. You grant CurioNotes a limited license to store, process, and analyze your content solely to provide the Service (including AI-powered features).</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
            <p>You may not use the Service to upload unlawful content, infringe third-party rights, attempt to reverse engineer the platform, or abuse our AI infrastructure.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">5. Subscriptions & Billing</h2>
            <p>Paid plans (Pro and Business) are billed monthly or annually. You may cancel at any time; access continues through the end of the paid period.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">6. Termination</h2>
            <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time from settings.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">7. Disclaimer</h2>
            <p>The Service is provided "as is" without warranties of any kind. AI-generated responses may be inaccurate; verify important information independently.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p>Questions? Email us at <a className="text-emerald-600 hover:underline" href="mailto:legal@curionotes.app">legal@curionotes.app</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
