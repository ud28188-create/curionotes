
import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  UserRound,
  Mail,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { createProCheckoutOrder } from "@/lib/pro-checkout.functions";
import { verifyProPayment } from "@/lib/pro-verify.functions";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useSession } from "@/hooks/use-session";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type ProfileDetails = {
  display_name: string | null;
  email: string | null;
};

export const Route = createFileRoute("/checkout/pro")({
  component: ProCheckoutPage,
});

function ProCheckoutPage() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();

  const [accountName, setAccountName] = useState("Loading...");
  const [accountEmail, setAccountEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Load the same profile information used by ProfileMenu
  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (sessionLoading) return;

      if (!session?.user) {
        if (mounted) {
          setProfileLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name,email")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;

        const profile = data as ProfileDetails | null;

        if (mounted) {
          setAccountName(
            profile?.display_name ||
              profile?.email?.split("@")[0] ||
              "You",
          );

          setAccountEmail(profile?.email || session.user.email || "");
        }
      } catch {
        if (mounted) {
          setAccountName(
            (session.user.user_metadata?.display_name as string) ||
              session.user.email?.split("@")[0] ||
              "You",
          );

          setAccountEmail(session.user.email || "");
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [session, sessionLoading]);

  // Load Razorpay Checkout script
  async function loadRazorpayScript() {
    if (window.Razorpay) return;

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      await new Promise<void>((resolve, reject) => {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Could not load Razorpay Checkout.")),
          { once: true },
        );
      });
    } else {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Could not load Razorpay Checkout."));
        document.body.appendChild(script);
      });
    }

    if (!window.Razorpay) {
      throw new Error("Razorpay Checkout is unavailable.");
    }
  }

  // Start payment
  async function startCheckout() {
    if (loading || paymentVerified) return;

    setLoading(true);
    setMessage("");

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        navigate({
          to: "/auth",
          search: { redirect: "/checkout/pro" },
        });
        return;
      }

      const token = sessionData.session.access_token;

      // Create order securely on the server
      const order = await createProCheckoutOrder({
        data: {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CurioNotes",
        description: `CurioNotes Pro access for ${order.durationDays} days`,
        order_id: order.orderId,

        handler: async (response: Record<string, string>) => {
          try {
            await verifyProPayment({
              data: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            setPaymentVerified(true);
            setMessage(
              "Payment verified successfully! Your Pro access has been activated.",
            );
          } catch {
            setMessage(
              "Payment received, but verification failed. Please contact support before attempting another payment.",
            );
          }
        },

        modal: {
          ondismiss: () => {
            setMessage("Checkout was closed. No Pro access was granted.");
          },
        },
      });

      checkout.open();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-5 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">

          {/* Heading */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Billing Details
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Review your account and plan information before completing
              your payment.
            </p>
          </div>

          {/* Billing Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

            {/* Account Information */}
            <section className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">Account Information</h2>
                  <p className="text-xs text-muted-foreground">
                    Your registered account details
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Account Name
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <p className="break-words font-semibold">
                      {profileLoading ? "Loading..." : accountName}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="break-all font-semibold">
                      {profileLoading ? "Loading..." : accountEmail || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-border" />

            {/* Plan Details */}
            <section className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Selected Plan</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your CurioNotes subscription
                  </p>
                </div>

                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary">
                  PRO
                </span>
              </div>

              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.03] p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-bold">
                        CurioNotes Pro
                      </h3>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Unlock your full learning and productivity experience.
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-3xl font-bold">₹199</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      One-time payment
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border/70 pt-5">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    30 days of Pro access
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-border" />

            {/* Payment Summary */}
            <section className="p-6 sm:p-8">
              <h2 className="font-semibold">Payment Summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    CurioNotes Pro
                  </span>
                  <span className="font-medium">₹199</span>
                </div>

                <div className="flex justify-between border-t border-border pt-5">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold">₹199</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={startCheckout}
                disabled={
                  loading ||
                  sessionLoading ||
                  profileLoading ||
                  !session ||
                  paymentVerified
                }
                className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentVerified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Payment Successful
                  </>
                ) : loading ? (
                  "Preparing Secure Checkout..."
                ) : (
                  "Proceed to Payment — ₹199"
                )}
              </button>

              {/* Payment Status */}
              {message && (
                <div
                  className={`mt-5 rounded-xl border p-4 text-sm ${
                    paymentVerified
                      ? "border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400"
                      : "border-border bg-secondary/50 text-muted-foreground"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </div>
              )}

              {/* Razorpay Logo */}
              <div className="mt-7 flex flex-col items-center gap-3 border-t border-border pt-6">
                <p className="text-xs text-muted-foreground">
                  Secure payments powered by
                </p>

                <img
                  src="/razorpay-logo.png"
                  alt="Razorpay"
                  className="h-10 w-auto max-w-[190px] object-contain"
                />

                <div className="flex items-center gap-2 text-center">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Your payment is securely processed and verified before
                    Pro access is activated.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            By proceeding with payment, you agree to the CurioNotes Terms of
            Service and Privacy Policy.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
