export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const df = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

/** "just now", "3 hours ago", "yesterday", then a plain date after a week. */
export function formatPostDate(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86400) return rtf.format(Math.round(seconds / 86400), "day");
  return df.format(new Date(iso));
}

/** fetch wrapper that throws the API's `{ error }` message on non-2xx. */
export async function api<T = void>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.json !== undefined ? { "content-type": "application/json" } : undefined,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Something went wrong. Try again.");
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
