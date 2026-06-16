import { z } from "zod";
import { imageUrlSchema } from "@/lib/validations/common";

export const menuCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  type: z.enum(["FOOD", "DRINK"]),
  position: z.coerce.number().int().min(0).default(0),
});

export const menuItemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1000),
  price: z.coerce.number().positive().max(1000),
  imageUrl: imageUrlSchema.optional().or(z.literal("")),
  isAvailable: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  allergens: z.array(z.string().trim().min(1)).default([]),
});

export const menuItemUpdateSchema = menuItemSchema.partial();

export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;
