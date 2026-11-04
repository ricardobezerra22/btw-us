import { db } from "@/lib/db";
import type { Viewer } from "@/modules/auth/session";
import { updateProfileSchema } from "./schemas";
import type { z } from "zod";

export async function updateProfile(viewer: Viewer, input: z.input<typeof updateProfileSchema>) {
  const data = updateProfileSchema.parse(input);
  return db.user.update({
    where: { id: viewer.userId },
    data,
    select: { id: true, name: true, email: true, avatarUrl: true },
  });
}

export function getSpaceMembers(viewer: Viewer) {
  return db.user.findMany({
    where: { spaceId: viewer.spaceId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, avatarUrl: true },
  });
}
