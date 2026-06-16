import { z } from "zod";

/**
 * Accepts a full URL (Vercel Blob / external host) or a root-relative path
 * (the local-dev /api/upload fallback writes to /public/uploads and returns
 * "/uploads/<file>", which z.string().url() would otherwise reject).
 */
export const imageUrlSchema = z
  .string()
  .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Must be a URL or a root-relative path");
