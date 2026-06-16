import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY is not set");
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
