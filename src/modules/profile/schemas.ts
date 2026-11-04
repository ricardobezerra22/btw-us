import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50).optional(),
  // No blob storage in the MVP — avatars are https image URLs.
  avatarUrl: z
    .union([z.literal(""), z.url({ protocol: /^https$/, error: "Use an https:// image link" }).max(2048)])
    .nullish()
    .transform((v) => (v === undefined ? undefined : v || null)),
});
