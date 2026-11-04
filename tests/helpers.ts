import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";

export async function resetDb() {
  await db.$executeRawUnsafe(
    `TRUNCATE "CollectionItem", "Collection", "SharedItem", "Session", "Account", "Verification", "User", "Space" CASCADE`,
  );
}

/** A space with two members; returns their viewers. */
export async function makeSpace(label: string, password?: string) {
  const space = await db.space.create({ data: { name: label } });
  const users = await Promise.all(
    ["a", "b"].map((s) =>
      db.user.create({
        data: { name: `${label}-${s}`, username: `${label}_${s}`, email: `${label}_${s}@betweenus.local`, spaceId: space.id },
      }),
    ),
  );
  if (password) {
    const hash = await hashPassword(password);
    for (const u of users)
      await db.account.create({
        data: { id: randomUUID(), userId: u.id, accountId: u.id, providerId: "credential", password: hash },
      });
  }
  return users.map((u) => ({ userId: u.id, spaceId: space.id, username: u.username! }));
}
