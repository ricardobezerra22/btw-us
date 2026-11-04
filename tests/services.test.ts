import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  addItemToCollection,
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  removeItemFromCollection,
  updateCollection,
} from "@/modules/collections/service";
import { createItem, deleteItem, listFeed, ValidationError } from "@/modules/items/service";
import { makeSpace, resetDb } from "./helpers";

let ours: Awaited<ReturnType<typeof makeSpace>>;
let theirs: Awaited<ReturnType<typeof makeSpace>>;

beforeEach(async () => {
  await resetDb();
  ours = await makeSpace("ours");
  theirs = await makeSpace("theirs");
});

describe("feed", () => {
  it("is shared by both members, newest first, and cursor-paginated", async () => {
    const [a, b] = ours;
    for (let i = 0; i < 5; i++) await createItem(i % 2 ? b : a, { url: `https://example.com/${i}` });

    const page1 = await listFeed(b, { limit: 3 });
    expect(page1.items.map((i) => i.url)).toEqual([4, 3, 2].map((i) => `https://example.com/${i}`));
    expect(page1.items[0].user.id).toBe(a.userId);
    expect(page1.nextCursor).toBe(page1.items[2].id);

    const page2 = await listFeed(a, { limit: 3, cursor: page1.nextCursor! });
    expect(page2.items.map((i) => i.url)).toEqual([1, 0].map((i) => `https://example.com/${i}`));
    expect(page2.nextCursor).toBeNull();
  });

  it("detects platform and stores the normalized url", async () => {
    const item = await createItem(ours[0], { url: "https://youtu.be/dQw4w9WgXcQ", message: "  this!  " });
    expect(item).toMatchObject({ platform: "YOUTUBE", message: "this!" });
  });
});

describe("space isolation", () => {
  it("never shows another space's items", async () => {
    await createItem(theirs[0], { url: "https://example.com/secret" });
    expect((await listFeed(ours[0], { limit: 10 })).items).toHaveLength(0);
  });

  it("ignores a cursor that belongs to another space", async () => {
    const foreign = await createItem(theirs[0], { url: "https://example.com/secret" });
    await createItem(ours[0], { url: "https://example.com/mine" });
    const res = await listFeed(ours[0], { limit: 10, cursor: foreign.id });
    expect(res.items.every((i) => i.url !== "https://example.com/secret")).toBe(true);
  });

  it("blocks cross-space collection access and association", async () => {
    const theirCollection = await createCollection(theirs[0], { name: "Theirs" });
    const theirItem = await createItem(theirs[0], { url: "https://example.com/t" });
    const myItem = await createItem(ours[0], { url: "https://example.com/m" });
    const myCollection = await createCollection(ours[0], { name: "Mine" });

    expect(await getCollection(ours[0], theirCollection.id)).toBeNull();
    expect(await listCollections(ours[0])).toHaveLength(1);
    expect(await updateCollection(ours[0], theirCollection.id, { name: "pwned" })).toBe(false);
    expect(await deleteCollection(ours[0], theirCollection.id)).toBe(false);
    expect(await addItemToCollection(ours[0], theirCollection.id, myItem.id)).toBe(false);
    expect(await addItemToCollection(ours[0], myCollection.id, theirItem.id)).toBe(false);
    expect(await removeItemFromCollection(ours[0], theirCollection.id, theirItem.id)).toBe(false);
    expect(await deleteItem(ours[0], theirItem.id)).toBe(false);

    await expect(createItem(ours[0], { url: "https://a.com", collectionIds: [theirCollection.id] })).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(await db.collection.findUnique({ where: { id: theirCollection.id } })).toMatchObject({ name: "Theirs" });
  });

  it("only lets the author delete a share", async () => {
    const [a, b] = ours;
    const item = await createItem(a, { url: "https://example.com/x" });
    expect(await deleteItem(b, item.id)).toBe(false);
    expect(await deleteItem(a, item.id)).toBe(true);
  });
});

describe("collections", () => {
  it("an item can belong to several collections; removing one association keeps the rest", async () => {
    const [a, b] = ours;
    const road = await createCollection(a, { name: "Road trip" });
    const chill = await createCollection(b, { name: "Chill" });
    const item = await createItem(a, { url: "https://open.spotify.com/track/abc", collectionIds: [road.id] });
    expect(await addItemToCollection(b, chill.id, item.id)).toBe(true);
    expect(await addItemToCollection(b, chill.id, item.id)).toBe(true); // idempotent

    const summaries = await listCollections(a);
    expect(summaries.map((c) => [c.name, c.itemCount]).sort()).toEqual([
      ["Chill", 1],
      ["Road trip", 1],
    ]);

    expect(await removeItemFromCollection(a, road.id, item.id)).toBe(true);
    expect((await getCollection(a, road.id))!.items).toHaveLength(0);
    expect((await getCollection(a, chill.id))!.items.map((i) => i.id)).toEqual([item.id]);
    expect(await db.sharedItem.count()).toBe(1);
  });

  it("deleting a collection keeps its shared items", async () => {
    const c = await createCollection(ours[0], { name: "Gone soon" });
    const item = await createItem(ours[0], { url: "https://example.com/keep", collectionIds: [c.id] });
    expect(await deleteCollection(ours[1], c.id)).toBe(true);
    expect(await db.collectionItem.count()).toBe(0);
    const feed = await listFeed(ours[0], { limit: 10 });
    expect(feed.items.map((i) => i.id)).toEqual([item.id]);
    expect(feed.items[0].collectionIds).toEqual([]);
  });

  it("partial update keeps the description", async () => {
    const c = await createCollection(ours[0], { name: "A", description: "desc" });
    await updateCollection(ours[0], c.id, { name: "B" });
    expect(await getCollection(ours[0], c.id)).toMatchObject({ name: "B", description: "desc" });
  });
});
