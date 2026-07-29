import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

type Mode = "signin" | "signup" | "forgot";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
      <path d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.95l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
    </svg>
  );
}

function PasswordField({ id, value, onChange, autoComplete, placeholder }: {
  id: string; value: string; onChange: (v: string) => void; autoComplete: string; placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={8}
        maxLength={72}
        className="h-11 rounded-xl pl-9 pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedEmail = emailSchema.parse(email);

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent. Check your inbox.");
        setMode("signin");
        return;
      }

      const parsedPassword = passwordSchema.parse(password);

      if (mode === "signup") {
        const name = displayName.trim().slice(0, 100);
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: parsedEmail,
          password: parsedPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: name ? { display_name: name } : undefined,
          },
        });
        if (error) throw error;
        // Supabase returns a user with an empty identities array when the email is already registered.
        if (signUpData.user && Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0) {
          toast.error("An account with this email already exists. Try signing in.");
          setMode("signin");
          return;
        }
        toast.success("Account created. Check your inbox for the confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail,
          password: parsedPassword,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  }


  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Try again.");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard", replace: true });
    } catch {
      toast.error("Google sign-in failed. Try again.");
      setGoogleLoading(false);
    }
  }

  const title =
    mode === "signin" ? "Welcome back"
      : mode === "signup" ? "Create your account"
      : "Reset your password";
  const subtitle =
    mode === "signin" ? "Sign in to continue to CurioNotes."
      : mode === "signup" ? "Start understanding anything with AI."
      : "We'll email you a secure link to set a new password.";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1100px] flex-col px-6 py-8">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 h-12 w-12">
              <svg viewBox="0 0 40 40" className="h-full w-full">
                <defs>
                  <linearGradient id="authLogoGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="18" fill="url(#authLogoGrad)" />
                <path d="M26 14a8 8 0 1 0 0 12" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
            {!isVerifying && mode !== "forgot" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-border/80 text-[14.5px] font-semibold"
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                >
                  {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  Continue with Google
                </Button>
                <div className="my-5 flex items-center gap-3 text-[12px] text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  OR
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            {!isVerifying && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[13px]">Name</Label>
                    <Input id="name" type="text" autoComplete="name" placeholder="Jane Doe"
                      value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={100} className="h-11 rounded-xl" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[13px]">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" autoComplete="email" required placeholder="you@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      maxLength={255} className="h-11 rounded-xl pl-9" />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-[13px]">Password</Label>
                      {mode === "signin" && (
                        <button type="button" onClick={() => setMode("forgot")}
                          className="text-[12.5px] font-medium text-foreground/70 hover:text-foreground">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <PasswordField id="password" value={password} onChange={setPassword}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder="At least 8 characters" />
                  </div>
                )}

                <Button type="submit" disabled={loading || googleLoading}
                  className="h-11 w-full rounded-xl bg-foreground text-[14.5px] font-semibold text-background hover:bg-foreground/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" />
                    : mode === "signin" ? "Sign in"
                    : mode === "signup" ? "Create account"
                    : "Send reset code"}
                </Button>
              </form>
            )}

            {isVerifying && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[13px]">6-digit code</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0,1,2,3,4,5].map((i) => (
                          <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="flex items-center justify-between text-[12.5px] text-muted-foreground">
                    <span>Code expires in 10 minutes.</span>
                    <button type="button" onClick={handleResend} disabled={cooldown > 0}
                      className="font-medium text-foreground disabled:text-muted-foreground disabled:no-underline hover:underline">
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                    </button>
                  </div>
                </div>

                {mode === "verify-reset" && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px]">New password</Label>
                      <PasswordField id="newpw" value={newPassword} onChange={setNewPassword}
                        autoComplete="new-password" placeholder="At least 8 characters" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px]">Confirm new password</Label>
                      <PasswordField id="confirmpw" value={confirmPassword} onChange={setConfirmPassword}
                        autoComplete="new-password" placeholder="Repeat password" />
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading || otp.length !== 6 || (mode === "verify-reset" && !newPassword)}
                  className="h-11 w-full rounded-xl bg-foreground text-[14.5px] font-semibold text-background hover:bg-foreground/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" />
                    : mode === "verify-signup" ? "Verify & continue" : "Update password"}
                </Button>

                <button type="button" onClick={() => { setMode("signin"); setOtp(""); }}
                  className="block w-full text-center text-[13px] text-muted-foreground hover:text-foreground">
                  Back to sign in
                </button>
              </form>
            )}

            {!isVerifying && (
              <div className="mt-6 text-center text-[13.5px] text-muted-foreground">
                {mode === "signin" && (
                  <>New to CurioNotes?{" "}
                    <button onClick={() => setMode("signup")} className="font-semibold text-foreground hover:underline">Create an account</button>
                  </>
                )}
                {mode === "signup" && (
                  <>Already have an account?{" "}
                    <button onClick={() => setMode("signin")} className="font-semibold text-foreground hover:underline">Sign in</button>
                  </>
                )}
                {mode === "forgot" && (
                  <button onClick={() => setMode("signin")} className="font-semibold text-foreground hover:underline">Back to sign in</button>
                )}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-[12px] leading-relaxed text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="font-medium text-foreground hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="font-medium text-foreground hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function errMsg(err: unknown) {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Invalid input";
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
