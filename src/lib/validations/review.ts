import { z } from "zod";

export const createReviewSchema = z.object({
  roomId: z.string().min(1).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000),
});

export const settingsSchema = z.object({
  depositPercentage: z.coerce.number().min(0).max(100),
  minDepositAmount: z.coerce.number().min(0).max(10000),
  freeCancellationWindowHours: z.coerce.number().int().min(0).max(168),
  lateCancellationFeePercent: z.coerce.number().min(0).max(100),
  taxRatePercent: z.coerce.number().min(0).max(100),
  currency: z.string().trim().min(3).max(3).default("usd"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
