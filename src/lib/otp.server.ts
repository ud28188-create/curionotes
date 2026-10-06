import { createHash, randomInt } from "crypto";

const FROM = "CurioNotes <no-reply@aiforlaboratory.com>";
export const OTP_TTL_MIN = 10;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SEC = 60;

export type Purpose = "signup" | "reset";

export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function hashCode(email: string, purpose: Purpose, code: string) {
  return createHash("sha256").update(`${email.toLowerCase()}|${purpose}|${code}`).digest("hex");
}

export async function findUserId(email: string): Promise<string | null> {
  const db = await admin();
  const { data, error } = await db.rpc("get_user_id_by_email", { _email: email });
  if (error) throw new Error("Lookup failed");
  return (data as string | null) ?? null;
}

export async function issueOtp(email: string, purpose: Purpose) {
  const db = await admin();
  const { data: last } = await db
    .from("email_otps")
    .select("created_at")
    .eq("email", email)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last && Date.now() - new Date(last.created_at).getTime() < RESEND_COOLDOWN_SEC * 1000) {
    throw new Error(`Please wait a minute before requesting another code.`);
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.from("email_otps").update({ consumed_at: new Date().toISOString() })
    .eq("email", email).eq("purpose", purpose).is("consumed_at", null);
  const { error } = await db.from("email_otps").insert({
    email, purpose,
    code_hash: hashCode(email, purpose, code),
    expires_at: new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString(),
  });
  if (error) throw new Error("Could not create code");
  const subject = purpose === "signup" ? "Verify your CurioNotes email" : "Reset your CurioNotes password";
  await sendEmail(email, subject, otpHtml(code, purpose));
}

export async function verifyOtp(email: string, purpose: Purpose, code: string) {
  const db = await admin();
  const { data: row } = await db
    .from("email_otps")
    .select("*")
    .eq("email", email).eq("purpose", purpose).is("consumed_at", null)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!row) throw new Error("No active code. Request a new one.");
  if (new Date(row.expires_at).getTime() < Date.now()) throw new Error("Code expired. Request a new one.");
  if (row.attempts >= MAX_ATTEMPTS) throw new Error("Too many attempts. Request a new code.");
  if (row.code_hash !== hashCode(email, purpose, code)) {
    await db.from("email_otps").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    const left = MAX_ATTEMPTS - row.attempts - 1;
    throw new Error(left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` : "Too many attempts. Request a new code.");
  }
  await db.from("email_otps").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
}

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env["RESEND_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!key || !lovableKey) throw new Error("Email service not configured");
  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Resend failed [${res.status}]: ${body}`);
    let msg = "Could not send email. Please try again.";
    if (/domain/i.test(body) && /verif/i.test(body)) msg = "Email domain is not verified yet. Please try again later.";
    throw new Error(msg);
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0a0a0a">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 16px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;border:1px solid #e5e5e5;border-radius:16px">
<tr><td style="padding:28px 32px;border-bottom:1px solid #eeeeee;font-size:18px;font-weight:700;letter-spacing:-0.3px">CurioNotes</td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 12px;font-size:24px;font-weight:700;letter-spacing:-0.5px">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #eeeeee;font-size:12px;color:#737373">© ${new Date().getFullYear()} CurioNotes · Your AI-powered notebook</td></tr>
</table></td></tr></table></body></html>`;
}

function otpHtml(code: string, purpose: Purpose) {
  const intro = purpose === "signup"
    ? "Use the code below to verify your email and finish creating your CurioNotes account."
    : "Use the code below to reset your CurioNotes password.";
  return shell(purpose === "signup" ? "Verify your email" : "Reset your password", `
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#404040">${intro}</p>
<div style="background:#0a0a0a;color:#ffffff;border-radius:12px;padding:22px;text-align:center;font-size:34px;font-weight:700;letter-spacing:12px;font-family:Menlo,Consolas,monospace">${code}</div>
<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#737373">This code expires in ${OTP_TTL_MIN} minutes. If you didn't request it, you can safely ignore this email.</p>`);
}

export function welcomeHtml(name: string, appUrl: string) {
  return shell(`Welcome to CurioNotes${name ? `, ${esc(name)}` : ""}`, `
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#404040">Your account has been created successfully. Upload PDFs, docs, slides and images, and let AI help you understand them.</p>
<a href="${esc(appUrl)}/auth" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600">Sign in to CurioNotes</a>`);
}
