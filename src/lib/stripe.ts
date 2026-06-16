import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// Don't throw here: Next.js evaluates every route module at build time
// ("collecting page data"), so throwing at module scope when the env var
// is missing breaks the production build itself, not just requests. A
// missing/invalid key surfaces naturally at runtime when a Stripe call is
// actually made — every call site already handles that error and returns
// a clean response instead of crashing.
if (!secretKey && process.env.NODE_ENV === "production") {
  console.warn("STRIPE_SECRET_KEY is not set — Stripe API calls will fail at runtime.");
}

export const stripe = new Stripe(secretKey ?? "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

/** Stripe amounts are integers in the smallest currency unit (cents for usd). */
export function toStripeAmount(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return Math.round(value * 100);
}

export function fromStripeAmount(amount: number) {
  return amount / 100;
}
