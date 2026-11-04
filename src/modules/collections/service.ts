import { db } from "@/lib/db";
import type { Viewer } from "@/modules/auth/session";
import { itemInclude, toFeedItem } from "@/modules/items/service";
import { createCollectionSchema, updateCollectionSchema } from "./schemas";
import type { z } from "zod";

export type CollectionSummary = {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  previewUrls: string[];
};

export async function listCollections(viewer: Viewer): Promise<CollectionSummary[]> {
  const rows = await db.collection.findMany({
    where: { spaceId: viewer.spaceId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: { orderBy: { addedAt: "desc" }, take: 4, select: { sharedItem: { select: { url: true } } } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    itemCount: c._count.items,
    previewUrls: c.items.map((i) => i.sharedItem.url),
  }));
}

export async function getCollection(viewer: Viewer, id: string) {
  const c = await db.collection.findFirst({
    where: { id, spaceId: viewer.spaceId },
    include: { items: { orderBy: { addedAt: "desc" }, include: { sharedItem: { include: itemInclude } } } },
  });
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    items: c.items.map((i) => toFeedItem(i.sharedItem)),
  };
}

export async function createCollection(viewer: Viewer, input: z.input<typeof createCollectionSchema>) {
  const data = createCollectionSchema.parse(input);
  return db.collection.create({
    data: { ...data, userId: viewer.userId, spaceId: viewer.spaceId },
    select: { id: true, name: true, description: true },
  });
}

export async function updateCollection(viewer: Viewer, id: string, input: z.input<typeof updateCollectionSchema>) {
  const data = updateCollectionSchema.parse(input);
  const { count } = await db.collection.updateMany({ where: { id, spaceId: viewer.spaceId }, data });
  return count > 0;
}

/** Removes the collection and its associations (FK cascade); shared items are untouched. */
export async function deleteCollection(viewer: Viewer, id: string) {
  const { count } = await db.collection.deleteMany({ where: { id, spaceId: viewer.spaceId } });
  return count > 0;
}

export async function addItemToCollection(viewer: Viewer, collectionId: string, itemId: string) {
  const [collection, item] = await Promise.all([
    db.collection.findFirst({ where: { id: collectionId, spaceId: viewer.spaceId }, select: { id: true } }),
    db.sharedItem.findFirst({ where: { id: itemId, spaceId: viewer.spaceId }, select: { id: true } }),
  ]);
  if (!collection || !item) return false;
  await db.collectionItem.createMany({ data: [{ collectionId, sharedItemId: itemId }], skipDuplicates: true });
  return true;
}

export async function removeItemFromCollection(viewer: Viewer, collectionId: string, itemId: string) {
  const { count } = await db.collectionItem.deleteMany({
    where: { collectionId, sharedItemId: itemId, collection: { spaceId: viewer.spaceId } },
  });
  return count > 0;
}
