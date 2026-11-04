import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

/** Identity derived solely from the session cookie — never from request input. */
export type Viewer = { userId: string; spaceId: string };

export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

export async function getViewer(): Promise<Viewer | null> {
  const user = await getSessionUser();
  return user ? { userId: user.id, spaceId: user.spaceId } : null;
}

/** For pages: bounce to /login when signed out. */
export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}
