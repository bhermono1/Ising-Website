import { z } from "zod";
import { imageUrlSchema } from "@/lib/validations/common";

export const roomSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  capacity: z.coerce.number().int().min(1).max(100),
  pricePerHour: z.coerce.number().positive().max(10000),
  amenities: z.array(z.string().trim().min(1)).default([]),
  isActive: z.coerce.boolean().default(true),
  minDuration: z.coerce.number().int().min(30).max(480).default(60),
  maxDuration: z.coerce.number().int().min(30).max(480).default(240),
  openTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format")
    .default("11:00"),
  closeTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format")
    .default("23:30"),
  images: z
    .array(
      z.object({
        url: imageUrlSchema,
        alt: z.string().optional().default(""),
        position: z.number().int().optional().default(0),
      })
    )
    .optional(),
});

export const roomUpdateSchema = roomSchema.partial();

export type RoomInput = z.infer<typeof roomSchema>;
