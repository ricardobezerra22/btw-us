import { execSync } from "node:child_process";
import { Client } from "pg";

/** Creates the test database if needed and applies migrations to it. */
export default async function setup() {
  const url = new URL(
    process.env.TEST_DATABASE_URL ?? "postgresql://betweenus:betweenus@localhost:54329/betweenus_test",
  );
  const name = url.pathname.slice(1);
  const admin = new Client({ connectionString: Object.assign(new URL(url), { pathname: "/postgres" }).toString() });
  await admin.connect();
  const { rowCount } = await admin.query("select 1 from pg_database where datname = $1", [name]);
  if (!rowCount) await admin.query(`create database "${name}"`);
  await admin.end();
  execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: url.toString() }, stdio: "ignore" });
}
