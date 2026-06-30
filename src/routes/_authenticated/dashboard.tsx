import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Profile = { display_name: string | null; email: string | null; avatar_url: string | null };

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (mounted) {
        setProfile(data ?? { display_name: null, email: user.email ?? null, avatar_url: null });
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const name = profile?.display_name || profile?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9">
              <svg viewBox="0 0 40 40" className="h-full w-full">
                <defs>
                  <linearGradient id="dashLogoGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="18" fill="url(#dashLogoGrad)" />
                <path d="M26 14a8 8 0 1 0 0 12" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span className="text-[20px] font-bold tracking-tight text-foreground">CurioNotes</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="rounded-3xl border border-border/70 bg-card p-10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <h1 className="mt-5 text-[34px] font-bold tracking-tight text-foreground">
            Welcome back, {loading ? "…" : name}.
          </h1>
          <p className="mt-3 max-w-[560px] text-[15.5px] leading-relaxed text-muted-foreground">
            Your AI notebook is ready. Upload sources, ask questions, and turn any document into knowledge.
          </p>
        </div>
      </main>
    </div>
  );
}
