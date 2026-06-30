import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out AI-powered notes.",
    features: [
      "Up to 3 notebooks",
      "50 notes total",
      "Upload PDFs, images & markdown",
      "20 AI questions / month",
      "Basic search",
    ],
    cta: "Get started",
    href: "/auth",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For students and power learners.",
    features: [
      "Unlimited notebooks",
      "Unlimited notes",
      "All file formats (Word, PPT, Excel)",
      "2,000 AI questions / month",
      "Multi-note AI chat with citations",
      "Priority indexing",
      "Email support",
    ],
    cta: "Start Pro trial",
    href: "/auth",
    highlight: true,
  },
  {
    name: "Business",
    price: "$39",
    period: "per user / month",
    description: "Built for teams and research groups.",
    features: [
      "Everything in Pro",
      "Unlimited AI questions",
      "Team workspaces & sharing",
      "Advanced permissions & SSO",
      "Audit logs",
      "Dedicated success manager",
      "99.9% uptime SLA",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <h2 className="text-[34px] font-bold tracking-[-0.025em] md:text-[44px]">Simple, transparent pricing</h2>
          <p className="mx-auto mt-4 max-w-[600px] text-[16px] text-muted-foreground md:text-[17px]">
            Start free. Upgrade when you need more AI horsepower.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl border p-7 ${
                t.highlight
                  ? "border-transparent bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-[0_20px_60px_-20px_rgba(16,185,129,0.5)]"
                  : "border-border/70 bg-card"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 shadow">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              )}
              <h3 className="text-lg font-bold">{t.name}</h3>
              <p className={`mt-1 text-sm ${t.highlight ? "text-white/85" : "text-muted-foreground"}`}>{t.description}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold">{t.price}</span>
                <span className={`text-sm ${t.highlight ? "text-white/80" : "text-muted-foreground"}`}>/ {t.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px]">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${t.highlight ? "text-white" : "text-emerald-600"}`} strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={t.href}
                className={`mt-7 inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-semibold transition-transform hover:scale-[1.02] ${
                  t.highlight
                    ? "bg-white text-emerald-700"
                    : "bg-foreground text-background"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
