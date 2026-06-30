import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Mail, MessageSquare, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact · CurioNotes" },
      { name: "description", content: "Reach the CurioNotes team — we'd love to hear from you." },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      schema.parse({ name, email, message });
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Thanks! We'll get back to you within 1 business day.");
      setName(""); setEmail(""); setMessage("");
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0]?.message ?? "Invalid input" : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
          <p className="mt-3 text-muted-foreground">Have a question, feedback, or partnership idea? Drop us a line.</p>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-5 rounded-3xl border border-border/70 bg-card p-7 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="h-11 rounded-xl pl-9" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 rounded-xl pl-9" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="How can we help?" className="rounded-xl pl-9" required />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-[14.5px] font-semibold text-white hover:opacity-95">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Or email us directly at <a href="mailto:hello@curionotes.app" className="text-emerald-600 hover:underline">hello@curionotes.app</a>
        </p>
      </div>
      <Footer />
    </div>
  );
}
