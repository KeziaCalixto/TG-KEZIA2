import "server-only";
import { getPublicConfig } from "@/lib/supabase/config";
import { z } from "zod";

function loopback(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" &&
      ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname === "/"
      ? url.origin
      : null;
  } catch {
    return null;
  }
}
// Server configuration only. Never import this module into a client component.
export function getReminderConfig(probeOnly = false) {
  const supabase = getPublicConfig();
  const key = process.env.REMINDERS_SUPABASE_SECRET_KEY;
  const secret = process.env.REMINDERS_DISPATCH_SECRET;
  if (!key || !secret || secret.length < 32) return null;
  if (process.env.REMINDERS_MODE === "brevo") {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = z.email().safeParse(process.env.BREVO_SENDER_EMAIL);
    const senderName = z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[^\r\n]+$/)
      .safeParse(process.env.BREVO_SENDER_NAME ?? "Prazo Claro");
    if (
      process.env.VERCEL_ENV !== "production" ||
      !key.startsWith("sb_secret_") ||
      /[\r\n]/.test(key) ||
      (!probeOnly && process.env.REMINDERS_DELIVERY_ENABLED !== "true") ||
      process.env.REMINDERS_APP_URL !== "https://tg-kezia2.vercel.app" ||
      supabase?.url !== "https://yjukuzgowqtkxvhozhbm.supabase.co" ||
      !apiKey ||
      apiKey.length < 16 ||
      apiKey.startsWith("xsmtpsib-") ||
      /[\r\n]/.test(apiKey) ||
      !senderEmail.success ||
      !senderName.success
    )
      return null;
    return {
      mode: "brevo" as const,
      appUrl: process.env.REMINDERS_APP_URL,
      supabaseUrl: supabase.url,
      key,
      secret,
      apiKey,
      senderEmail: senderEmail.data,
      senderName: senderName.data,
      schedulerSecret: process.env.REMINDERS_SCHEDULER_SECRET,
    };
  }
  if (process.env.REMINDERS_MODE !== "local" || process.env.VERCEL_ENV)
    return null;
  const appUrl = loopback(process.env.REMINDERS_APP_URL);
  const mailpitUrl = loopback(process.env.REMINDERS_MAILPIT_URL);
  const supabaseUrl = loopback(supabase?.url);
  if (
    !appUrl ||
    !mailpitUrl ||
    !supabaseUrl ||
    !key ||
    !secret ||
    secret.length < 32
  )
    return null;
  return {
    mode: "local" as const,
    appUrl,
    mailpitUrl,
    supabaseUrl,
    key,
    secret,
  };
}
