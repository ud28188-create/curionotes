import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase recovery link establishes a session client-side; wait for it.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parsed = passwordSchema.parse(password);
      if (parsed !== confirm) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.updateUser({ password: parsed });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/dashboard", replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof z.ZodError
          ? err.issues[0]?.message ?? "Invalid input"
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-6 py-12">
        <h1 className="text-center text-[28px] font-bold tracking-tight text-foreground">Set a new password</h1>
        <p className="mt-2 text-center text-[15px] text-muted-foreground">
          Choose a strong password you don't use anywhere else.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-3xl border border-border/70 bg-card p-7 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px]">New password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={72}
                className="h-11 rounded-xl pl-9 pr-10"
                disabled={!ready}
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-[13px]">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                maxLength={72}
                className="h-11 rounded-xl pl-9 pr-10"
                disabled={!ready}
              />
              <button type="button" onClick={() => setShowConfirm((s) => !s)} aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !ready}
            className="h-11 w-full rounded-xl bg-foreground text-[14.5px] font-semibold text-background hover:bg-foreground/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>

          {!ready && (
            <p className="text-center text-[12.5px] text-muted-foreground">
              Waiting for recovery link... Open the latest email from us and click the link again if this stays stuck.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
