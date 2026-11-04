/**
 * Creates the Space and its two members (martinha, ricardo) with random passwords.
 *
 *   npm run provision             # creates missing users; existing users keep their password
 *   npm run provision -- --reset  # also issues new passwords for existing users
 *
 * Passwords are generated here, hashed (scrypt, via Better Auth) before they touch the database,
 * and printed ONCE to this terminal. To choose your own, set MARTINHA_PASSWORD / RICARDO_PASSWORD.
 */
import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { db } from "../src/lib/db";

const MEMBERS = [
  { username: "martinha", name: "Martinha" },
  { username: "ricardo", name: "Ricardo" },
];

async function main() {
  const reset = process.argv.includes("--reset");
  const space =
    (await db.space.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await db.space.create({ data: { name: process.env.SPACE_NAME?.trim() || "Between Us" } }));

  const strangers = await db.user.count({
    where: { spaceId: space.id, username: { notIn: MEMBERS.map((m) => m.username) } },
  });
  if (strangers > 0) throw new Error("Space has members other than martinha/ricardo; refusing to continue.");

  const issued: string[] = [];
  for (const m of MEMBERS) {
    const existing = await db.user.findUnique({ where: { username: m.username } });
    const fromEnv = process.env[`${m.username.toUpperCase()}_PASSWORD`]?.trim();
    const password = fromEnv || (!existing || reset ? randomBytes(12).toString("base64url") : null);

    const user =
      existing ??
      (await db.user.create({
        data: {
          name: m.name,
          username: m.username,
          displayUsername: m.username,
          // Better Auth requires an email; it is internal and never shown or used for login.
          email: `${m.username}@betweenus.local`,
          emailVerified: true,
          spaceId: space.id,
        },
      }));

    if (!password) {
      console.log(`• ${m.username}: already exists (password unchanged)`);
      continue;
    }
    const hash = await hashPassword(password);
    const account = await db.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
    if (account) await db.account.update({ where: { id: account.id }, data: { password: hash } });
    else
      await db.account.create({
        data: { id: randomUUID(), userId: user.id, accountId: user.id, providerId: "credential", password: hash },
      });
    if (!fromEnv) issued.push(`  ${m.username.padEnd(10)} ${password}`);
    else console.log(`✓ ${m.username}: password set from env`);
  }

  if (issued.length) {
    console.log("\nGenerated passwords (shown once — store them in a password manager):");
    console.log(issued.join("\n"));
  }
  console.log(`\nSpace "${space.name}" ready.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
