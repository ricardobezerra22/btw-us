import { z } from "zod";
import { resolvePlatform } from "./lib/resolve-platform";

export const createItemSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Paste a link")
    .max(2048, "That link is too long")
    .refine((v) => resolvePlatform(v) !== null, "Enter a valid https:// link"),
  message: z.string().trim().max(1000, "Keep it under 1000 characters").optional().transform((v) => v || undefined),
  collectionIds: z.array(z.string().min(1)).max(50).default([]),
});

export const feedQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateItemInput = z.input<typeof createItemSchema>;
