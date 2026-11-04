import { describe, expect, it } from "vitest";
import { createCollectionSchema, updateCollectionSchema } from "@/modules/collections/schemas";
import { createItemSchema, feedQuerySchema } from "@/modules/items/schemas";
import { updateProfileSchema } from "@/modules/profile/schemas";

describe("createItemSchema", () => {
  it("accepts a bare URL; message and collections are optional", () => {
    expect(createItemSchema.parse({ url: " https://youtu.be/dQw4w9WgXcQ " })).toEqual({
      url: "https://youtu.be/dQw4w9WgXcQ",
      message: undefined,
      collectionIds: [],
    });
  });
  it("treats a blank message as no message", () => {
    expect(createItemSchema.parse({ url: "https://a.com", message: "   " }).message).toBeUndefined();
  });
  it("rejects non-https and oversized messages", () => {
    expect(createItemSchema.safeParse({ url: "http://a.com" }).success).toBe(false);
    expect(createItemSchema.safeParse({ url: "https://a.com", message: "x".repeat(1001) }).success).toBe(false);
  });
  it("ignores client-supplied identity fields", () => {
    const parsed = createItemSchema.parse({ url: "https://a.com", userId: "x", spaceId: "y" });
    expect(parsed).not.toHaveProperty("userId");
    expect(parsed).not.toHaveProperty("spaceId");
  });
});

describe("feedQuerySchema", () => {
  it("defaults and clamps limit", () => {
    expect(feedQuerySchema.parse({}).limit).toBe(10);
    expect(feedQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
  });
});

describe("collection schemas", () => {
  it("requires a name on create", () => {
    expect(createCollectionSchema.safeParse({ name: "  " }).success).toBe(false);
    expect(createCollectionSchema.parse({ name: "Road trip", description: "" })).toEqual({
      name: "Road trip",
      description: null,
    });
  });
  it("partial update leaves untouched fields undefined", () => {
    expect(updateCollectionSchema.parse({ name: "New" })).toEqual({ name: "New", description: undefined });
    expect(updateCollectionSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("accepts https avatar or empty (clears it), rejects other schemes", () => {
    expect(updateProfileSchema.parse({ avatarUrl: "" }).avatarUrl).toBeNull();
    expect(updateProfileSchema.parse({ avatarUrl: "https://img.test/a.png" }).avatarUrl).toBe("https://img.test/a.png");
    expect(updateProfileSchema.safeParse({ avatarUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(updateProfileSchema.parse({ name: "Ana" }).avatarUrl).toBeUndefined();
  });
});
