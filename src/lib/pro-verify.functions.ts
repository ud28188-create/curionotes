import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateProPaymentForUser } from "@/lib/server/pro-payments";

const VerifyProPaymentInput = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const verifyProPayment = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => VerifyProPaymentInput.parse(input))
  .handler(async ({ data, context }) => {
  return validateProPaymentForUser({
    userId: context.userId,
    orderId: data.razorpay_order_id,
    paymentId: data.razorpay_payment_id,
    signature: data.razorpay_signature,
  });
});