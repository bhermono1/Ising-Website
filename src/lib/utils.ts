import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Accepts plain numbers/strings as well as Prisma `Decimal` instances. */
export function formatCurrency(amount: number | string | { toString(): string }, currency = "usd") {
  const value = typeof amount === "number" ? amount : Number(amount.toString());
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value);
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function formatTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function minutesToLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Combine a "HH:mm" string with a date, producing a Date in local time. */
export function timeStringToDate(date: Date, time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Restricts a post-login redirect target to a same-site relative path.
 * `callbackUrl` comes from the query string, so without this an attacker
 * could craft a link like /login?callbackUrl=https://evil.com (or the
 * protocol-relative //evil.com) and get a victim redirected off-site right
 * after they authenticate.
 */
export function safeRelativeUrl(url: string | null, fallback: string) {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return fallback;
  return url;
}
