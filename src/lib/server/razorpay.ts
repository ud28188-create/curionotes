
const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay server credentials are not configured.");
  }

  return { keyId, keySecret };
}

async function razorpayRequest<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
  } = {},
): Promise<T> {
  const { keyId, keySecret } = getRazorpayCredentials();

  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(`${RAZORPAY_API_BASE}${endpoint}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Razorpay API request failed:", response.status);
    throw new Error("Unable to process the Razorpay request.");
  }

  return result as T;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
};

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
}): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>("/orders", {
    method: "POST",
    body: {
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      payment_capture: 1,
    },
  });
}

export async function fetchRazorpayPayment(
  paymentId: string,
): Promise<RazorpayPayment> {
  return razorpayRequest<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

export async function fetchRazorpayOrder(
  orderId: string,
): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>(`/orders/${encodeURIComponent(orderId)}`);
}
