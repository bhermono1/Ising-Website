import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash ? Redis.fromEnv() : null;

const limiters = {
  // Auth endpoints: tight limit to slow down credential stuffing / brute force.
  auth: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "rl:auth" }) : null,
  // Payment intent creation: generous but bounded.
  payment: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "rl:payment" }) : null,
  // General mutating API calls.
  api: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "60 s"), prefix: "rl:api" }) : null,
};

export type RateLimitBucket = keyof typeof limiters;

/**
 * No-op (always allow) when Upstash env vars aren't configured, so local
 * dev and tests don't require a Redis instance. In production, set
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN to enable enforcement.
 */
export async function rateLimit(bucket: RateLimitBucket, identifier: string) {
  const limiter = limiters[bucket];
  if (!limiter) return { success: true, limit: 0, remaining: 0, reset: 0 };
  return limiter.limit(identifier);
}

export function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
