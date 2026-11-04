import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Route handlers read the session from next/headers; feed them whatever cookies the test sets.
const cookie = { value: "" };
vi.mock("next/headers", () => ({
  headers: async () => new Headers(cookie.value ? { cookie: cookie.value } : {}),
  cookies: async () => ({ get: () => undefined, set: () => {} }),
}));

const { auth } = await import("@/lib/auth");
const items = await import("@/app/api/items/route");
const collections = await import("@/app/api/collections/route");
const profile = await import("@/app/api/profile/route");
const { proxy } = await import("@/proxy");
const { makeSpace, resetDb } = await import("./helpers");

const PASSWORD = "correct-horse-battery";
let users: Awaited<ReturnType<typeof makeSpace>>;

async function signIn(username: string) {
  const res = await auth.api.signInUsername({ body: { username, password: PASSWORD }, asResponse: true });
  expect(res.status).toBe(200);
  cookie.value = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

const post = (url: string, body: unknown) =>
  new Request(`http://localhost:3000${url}`, { method: "POST", body: JSON.stringify(body) });

beforeEach(async () => {
  cookie.value = "";
  await resetDb();
  users = await makeSpace("auth", PASSWORD);
});

describe("authentication", () => {
  it("rejects unauthenticated API calls", async () => {
    expect((await items.GET(new Request("http://localhost:3000/api/items"), {})).status).toBe(401);
    expect((await items.POST(post("/api/items", { url: "https://a.com" }), {})).status).toBe(401);
    expect((await collections.GET(new Request("http://localhost:3000/api/collections"), {})).status).toBe(401);
  });

  it("rejects a forged session cookie", async () => {
    cookie.value = "better-auth.session_token=forged.value";
    expect((await items.GET(new Request("http://localhost:3000/api/items"), {})).status).toBe(401);
  });

  it("rejects wrong passwords", async () => {
    const res = await auth.api.signInUsername({ body: { username: users[0].username, password: "nope-nope" }, asResponse: true });
    expect(res.status).toBe(401);
  });

  it("has no public sign-up", async () => {
    const res = await auth.api.signUpEmail({
      body: { name: "Intruder", email: "intruder@example.test", password: "password123" },
      asResponse: true,
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("proxy redirects signed-out page requests to /login", () => {
    const res = proxy(new NextRequest("http://localhost:3000/home"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });
});

describe("sharing flow (HTTP)", () => {
  it("one member shares, the other sees it; identity comes from the session", async () => {
    await signIn(users[0].username);
    const created = await collections.POST(post("/api/collections", { name: "Songs" }), {});
    const { id: collectionId } = await created.json();

    const res = await items.POST(
      post("/api/items", {
        url: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
        message: "for you",
        collectionIds: [collectionId],
        userId: users[1].userId, // must be ignored
        spaceId: "someone-elses-space", // must be ignored
      }),
      {},
    );
    expect(res.status).toBe(201);
    const item = await res.json();
    expect(item).toMatchObject({ platform: "SPOTIFY", message: "for you", collectionIds: [collectionId] });
    expect(item.user.id).toBe(users[0].userId);

    await signIn(users[1].username);
    const feed = await (await items.GET(new Request("http://localhost:3000/api/items"), {})).json();
    expect(feed.items.map((i: { id: string }) => i.id)).toEqual([item.id]);
  });

  it("returns 400 for invalid URLs and bad JSON", async () => {
    await signIn(users[0].username);
    const bad = await items.POST(post("/api/items", { url: "http://insecure.com" }), {});
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toMatch(/https/);
    const garbage = new Request("http://localhost:3000/api/items", { method: "POST", body: "{nope" });
    expect((await items.POST(garbage, {})).status).toBe(400);
  });

  it("updates only the signed-in user's profile", async () => {
    await signIn(users[0].username);
    const req = new Request("http://localhost:3000/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Renamed", userId: users[1].userId }),
    });
    expect(await (await profile.PATCH(req, {})).json()).toMatchObject({ id: users[0].userId, name: "Renamed" });
  });
});
