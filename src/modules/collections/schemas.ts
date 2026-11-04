import { z } from "zod";

const name = z.string().trim().min(1, "Give it a name").max(60, "Keep it under 60 characters");
const description = z
  .string()
  .trim()
  .max(280, "Keep it under 280 characters")
  .nullish()
  .transform((v) => (v === undefined ? undefined : v || null));

export const createCollectionSchema = z.object({ name, description });
export const updateCollectionSchema = z
  .object({ name: name.optional(), description })
  .refine((v) => v.name !== undefined || v.description !== undefined, "Nothing to update");
export const collectionItemSchema = z.object({ itemId: z.string().min(1) });
