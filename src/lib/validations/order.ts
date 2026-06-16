import { z } from "zod";

export const createOrderSchema = z.object({
  reservationId: z.string().min(1).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(50),
        notes: z.string().trim().max(200).optional(),
      })
    )
    .min(1, "Add at least one item"),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
