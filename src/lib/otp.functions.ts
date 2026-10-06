import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(255);
const password = z.string().min(8).max(72);
const code = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const startSignup = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email, password, name: z.string().trim().max(100).optional() }).parse(d))
  .handler(async ({ data }) => {
    const m = await import("./otp.server");
    const db = await m.admin();
    const existing = await m.findUserId(data.email);
    if (existing) {
      const { data: u } = await db.auth.admin.getUserById(existing);
      if (u.user?.email_confirmed_at) return { ok: false as const, error: "An account with this email already exists. Try signing in." };
      await db.auth.admin.updateUserById(existing, { password: data.password, user_metadata: data.name ? { display_name: data.name } : undefined });
    } else {
      const { error } = await db.auth.admin.createUser({
        email: data.email, password: data.password, email_confirm: false,
        user_metadata: data.name ? { display_name: data.name } : {},
      });
      if (error) return { ok: false as const, error: error.message };
    }
    try { await m.issueOtp(data.email, "signup"); } catch (e) { return { ok: false as const, error: (e as Error).message }; }
    return { ok: true as const };
  });

export const resendOtp = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email, purpose: z.enum(["signup", "reset"]) }).parse(d))
  .handler(async ({ data }) => {
    const m = await import("./otp.server");
    const id = await m.findUserId(data.email);
    if (!id) return { ok: true as const }; // don't reveal
    try { await m.issueOtp(data.email, data.purpose); } catch (e) { return { ok: false as const, error: (e as Error).message }; }
    return { ok: true as const };
  });

export const verifySignup = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email, code, origin: z.string().url().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const m = await import("./otp.server");
    try { await m.verifyOtp(data.email, "signup", data.code); } catch (e) { return { ok: false as const, error: (e as Error).message }; }
    const id = await m.findUserId(data.email);
    if (!id) return { ok: false as const, error: "Account not found" };
    const db = await m.admin();
    const { data: u } = await db.auth.admin.updateUserById(id, { email_confirm: true });
    const name = (u.user?.user_metadata?.display_name as string) ?? "";
    m.sendEmail(data.email, "Your CurioNotes account is ready", m.welcomeHtml(name, data.origin)).catch((e) => console.error(e));
    return { ok: true as const };
  });

export const requestReset = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email }).parse(d))
  .handler(async ({ data }) => {
    const m = await import("./otp.server");
    const id = await m.findUserId(data.email);
    if (!id) return { ok: true as const };
    try { await m.issueOtp(data.email, "reset"); } catch (e) { return { ok: false as const, error: (e as Error).message }; }
    return { ok: true as const };
  });

export const confirmReset = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email, code, password }).parse(d))
  .handler(async ({ data }) => {
    const m = await import("./otp.server");
    try { await m.verifyOtp(data.email, "reset", data.code); } catch (e) { return { ok: false as const, error: (e as Error).message }; }
    const id = await m.findUserId(data.email);
    if (!id) return { ok: false as const, error: "Account not found" };
    const db = await m.admin();
    const { error } = await db.auth.admin.updateUserById(id, { password: data.password, email_confirm: true });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
