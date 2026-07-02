import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileMenu } from "@/components/ProfileMenu";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase
        .from("profiles").select("display_name").eq("id", u.user.id).maybeSingle();
      setName(data?.display_name ?? "");
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() || null })
      .eq("id", u.user!.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
          <Link to="/notebooks" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="truncate text-base font-semibold sm:text-lg">Settings</h1>
          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Update how your name appears across CurioNotes.</p>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[13px]">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name" maxLength={100} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px]">Email</Label>
              <Input id="email" value={email} disabled className="h-11 rounded-xl bg-secondary/50" />
              <p className="text-[11.5px] text-muted-foreground">Contact support to change your email.</p>
            </div>
            <div className="pt-2">
              <Button onClick={save} disabled={saving} className="gap-2 rounded-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/60 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Free plan</h2>
              <p className="text-sm text-muted-foreground">Upgrade for higher limits and priority AI.</p>
            </div>
          </div>
          <a href="/#pricing" className="mt-5 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-[13.5px] font-semibold text-background hover:opacity-90">
            View plans
          </a>
        </section>

        <section className="mt-6 rounded-3xl border border-destructive/30 bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign out of this device.</p>
          <Button onClick={signOut} variant="outline" className="mt-4 rounded-full">
            Sign out
          </Button>
        </section>
      </main>
    </div>
  );
}
