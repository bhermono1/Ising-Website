import { z } from "zod";

export const createReservationSchema = z.object({
  roomId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format"),
  durationMinutes: z.coerce.number().int().min(30).max(480),
  guestCount: z.coerce.number().int().min(1).max(100),
  notes: z.string().trim().max(500).optional(),
});

export const cancelReservationSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const reservationStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
