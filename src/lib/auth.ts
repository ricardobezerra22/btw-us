import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { db } from "./db";

// On Vercel, trust the deployment's own origins so preview URLs can sign in too.
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter(Boolean)
  .map((host) => `https://${host}`);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? vercelOrigins.at(-1),
  trustedOrigins: vercelOrigins,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Accounts are provisioned by scripts/provision.ts — no public registration.
  emailAndPassword: { enabled: true, disableSignUp: true },
  user: {
    fields: { image: "avatarUrl" },
    additionalFields: {
      spaceId: { type: "string", required: true, input: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30 },
  plugins: [username({ minUsernameLength: 3, maxUsernameLength: 30 }), nextCookies()],
});
