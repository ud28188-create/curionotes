import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { createProCheckoutOrder } from "@/lib/pro-checkout.functions";
import { verifyProPayment } from "@/lib/pro-verify.functions";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export const Route = createFileRoute("/checkout/pro")({
  component: ProCheckoutPage,
});

function ProCheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function startCheckout() {
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

      const order = await createProCheckoutOrder({
        data: {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Could not load Razorpay Checkout."));
          document.body.appendChild(script);
        });
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CurioNotes",
        description: `Pro access for ${order.durationDays} days`,
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

            setMessage("Payment verified and Pro activation completed.");

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
        error instanceof Error ? error.message : "Unable to start checkout.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-3xl font-bold">Upgrade to CurioNotes Pro</h1>

      <p className="mt-3 text-muted-foreground">
        One-time payment for 30 days of Pro access.
      </p>

      <button
        onClick={startCheckout}
        disabled={loading}
        className="mt-8 h-12 rounded-full bg-foreground px-8 font-semibold text-background disabled:opacity-50"
      >
        {loading ? "Please wait..." : "Continue to payment"}
      </button>

      {message && (
        <p className="mt-5 text-sm" role="status">
          {message}
        </p>
      )}
    </main>
  );
}