import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  fetchRazorpayOrder,
  getRazorpayCredentials,
} from "./razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

export async function createProOrderForUser(userId: string) {
  if (!userId) {
    throw new Error("Authentication required.");
  }

  const keyId = process.env.RAZORPAY_KEY_ID;

  if (!keyId) {
    throw new Error("Razorpay Key ID is not configured.");
  }

  // Load the current Pro price from the database.
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );

  const { data: plan, error: planError } = await supabaseAdmin
    .from("pro_plan_settings")
    .select("amount_paise,currency,duration_days,is_active")
    .eq("plan_key", "pro")
    .maybeSingle();

  if (planError) {
    console.error("Could not load Pro plan settings:", planError.message);
    throw new Error("Unable to load Pro plan details.");
  }

  if (!plan || !plan.is_active) {
    throw new Error("The Pro plan is currently unavailable.");
  }

  if (
    !Number.isInteger(plan.amount_paise) ||
    plan.amount_paise <= 0 ||
    plan.currency !== "INR" ||
    !Number.isInteger(plan.duration_days) ||
    plan.duration_days <= 0
  ) {
    throw new Error("The Pro plan settings are invalid.");
  }

  // Razorpay receipts must be short and unique.
  const receipt = `pro_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;

  // Create the order using the database price, never a browser-supplied price.
  const razorpayOrder = await createRazorpayOrder({
    amount: plan.amount_paise,
    currency: plan.currency,
    receipt,
  });

  // Save the order against the authenticated user.
  const idempotencyKey = crypto.randomUUID();

  const { error: insertError } = await supabaseAdmin
    .from("pro_payment_orders")
    .insert({
      user_id: userId,
      plan_key: "pro",
      razorpay_order_id: razorpayOrder.id,
      amount_paise: plan.amount_paise,
      currency: plan.currency,
      status: "pending",
      idempotency_key: idempotencyKey,
    });

  if (insertError) {
    console.error("Could not save Pro payment order:", insertError.message);
    throw new Error("Unable to save the payment order.");
  }

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId,
    durationDays: plan.duration_days,
  };
}

export function verifyRazorpaySignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret } = getRazorpayCredentials();

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(input.signature, "hex");

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return false;
  }

  return true;
}

export async function validateProPaymentForUser(input: {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (!verifyRazorpaySignature({
    orderId: input.orderId,
    paymentId: input.paymentId,
    signature: input.signature,
  })) {
    throw new Error("Invalid payment signature.");
  }

  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );

  const { data: savedOrder, error } = await supabaseAdmin
    .from("pro_payment_orders")
    .select("user_id,amount_paise,currency,status,razorpay_payment_id")
    .eq("razorpay_order_id", input.orderId)
    .maybeSingle();

  if (error || !savedOrder) {
    throw new Error("Payment order not found.");
  }

  if (savedOrder.user_id !== input.userId) {
    throw new Error("Payment order does not belong to this user.");
  }

  if (
    savedOrder.status !== "pending" &&
    !(
      savedOrder.status === "paid" &&
      savedOrder.razorpay_payment_id === input.paymentId
    )
  ) {
    throw new Error("Payment order cannot be processed.");
  }

  const [payment, order] = await Promise.all([
    fetchRazorpayPayment(input.paymentId),
    fetchRazorpayOrder(input.orderId),
  ]);

  if (
    payment.order_id !== input.orderId ||
    payment.status !== "captured" ||
    payment.captured !== true ||
    payment.amount !== savedOrder.amount_paise ||
    payment.currency !== savedOrder.currency ||
    order.amount !== savedOrder.amount_paise ||
    order.currency !== savedOrder.currency ||
    order.status !== "paid"
  ) {
    throw new Error("Payment could not be verified.");
  }

  const { data: activation, error: activationError } =
    await supabaseAdmin.rpc("activate_pro_after_payment", {
      p_razorpay_order_id: input.orderId,
      p_razorpay_payment_id: input.paymentId,
    });

  if (activationError) {
    console.error("Pro activation failed:", activationError.message);
    throw new Error("Payment verified, but Pro activation failed. Please contact support.");
  }

  return activation;
}