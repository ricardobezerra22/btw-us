import { db } from "@/lib/db";
import type { Viewer } from "@/modules/auth/session";
import { resolvePlatform } from "./lib/resolve-platform";
import { createItemSchema, type CreateItemInput } from "./schemas";

export const itemInclude = {
  user: { select: { id: true, name: true, avatarUrl: true } },
  collections: { select: { collectionId: true } },
} as const;

export type FeedItem = {
  id: string;
  url: string;
  platform: "INSTAGRAM" | "SPOTIFY" | "YOUTUBE" | "OTHER";
  message: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
  collectionIds: string[];
};

type ItemRow = Awaited<ReturnType<typeof findItems>>[number];
const findItems = (args: Parameters<typeof db.sharedItem.findMany>[0]) =>
  db.sharedItem.findMany({ ...args, include: itemInclude });

export function toFeedItem(row: ItemRow): FeedItem {
  return {
    id: row.id,
    url: row.url,
    platform: row.platform,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    user: row.user,
    collectionIds: row.collections.map((c) => c.collectionId),
  };
}

export async function listFeed(viewer: Viewer, opts: { cursor?: string; limit: number }) {
  const rows = await findItems({
    where: { spaceId: viewer.spaceId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: opts.limit + 1,
    // Cursor must also be in this space, otherwise Prisma would happily page from a foreign row.
    ...(opts.cursor ? { cursor: { id: opts.cursor, spaceId: viewer.spaceId }, skip: 1 } : {}),
  });
  const hasMore = rows.length > opts.limit;
  const items = rows.slice(0, opts.limit).map(toFeedItem);
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
}

export class ValidationError extends Error {}

export async function createItem(viewer: Viewer, input: CreateItemInput) {
  const data = createItemSchema.parse(input);
  const resolved = resolvePlatform(data.url)!; // guaranteed by schema refine
  const collectionIds = [...new Set(data.collectionIds)];

  if (collectionIds.length) {
    const owned = await db.collection.count({ where: { id: { in: collectionIds }, spaceId: viewer.spaceId } });
    if (owned !== collectionIds.length) throw new ValidationError("Unknown collection");
  }

  const row = await db.sharedItem.create({
    data: {
      url: resolved.url,
      platform: resolved.platform,
      message: data.message ?? null,
      userId: viewer.userId,
      spaceId: viewer.spaceId,
      collections: { create: collectionIds.map((collectionId) => ({ collectionId })) },
    },
    include: itemInclude,
  });
  return toFeedItem(row);
}

/** Only the author may delete their own share. Returns false when not found / not allowed. */
export async function deleteItem(viewer: Viewer, id: string) {
  const { count } = await db.sharedItem.deleteMany({
    where: { id, spaceId: viewer.spaceId, userId: viewer.userId },
  });
  return count > 0;
}
