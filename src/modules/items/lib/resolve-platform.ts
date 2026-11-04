import type { Platform } from "@/generated/prisma/enums";

export type ResolvedUrl = { url: string; platform: Platform; hostname: string };

const HOSTS: Record<string, Platform> = {
  "instagram.com": "INSTAGRAM",
  "www.instagram.com": "INSTAGRAM",
  "open.spotify.com": "SPOTIFY",
  "youtube.com": "YOUTUBE",
  "www.youtube.com": "YOUTUBE",
  "m.youtube.com": "YOUTUBE",
  "youtu.be": "YOUTUBE",
};

/** Parses and validates a user-supplied URL. Returns null for anything that isn't a well-formed https URL. */
export function resolvePlatform(input: string): ResolvedUrl | null {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || !parsed.hostname.includes(".")) return null;
  if (parsed.username || parsed.password) return null;
  const hostname = parsed.hostname.toLowerCase();
  return { url: parsed.toString(), platform: HOSTS[hostname] ?? "OTHER", hostname };
}

export type Preview =
  | { kind: "youtube"; videoId: string; embedUrl: string; thumbnailUrl: string }
  | { kind: "spotify"; embedUrl: string; compact: boolean }
  | { kind: "instagram"; embedUrl: string }
  | { kind: "link"; hostname: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const IG_CODE = /^[A-Za-z0-9_-]+$/;
const SPOTIFY_TYPES = new Set(["track", "album", "playlist", "episode", "show", "artist"]);

/**
 * Builds embed info purely from the URL string — no network access, so no SSRF surface.
 * Anything unrecognised degrades to a plain link card.
 */
export function getPreview(rawUrl: string): Preview {
  const resolved = resolvePlatform(rawUrl);
  if (!resolved) return { kind: "link", hostname: "" };
  const u = new URL(resolved.url);
  const parts = u.pathname.split("/").filter(Boolean);
  const link: Preview = { kind: "link", hostname: resolved.hostname.replace(/^www\./, "") };

  switch (resolved.platform) {
    case "YOUTUBE": {
      let id: string | null = null;
      if (resolved.hostname === "youtu.be") id = parts[0] ?? null;
      else if (parts[0] === "watch") id = u.searchParams.get("v");
      else if (["shorts", "embed", "live"].includes(parts[0] ?? "")) id = parts[1] ?? null;
      if (!id || !YT_ID.test(id)) return link;
      return {
        kind: "youtube",
        videoId: id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }
    case "SPOTIFY": {
      // Handles optional locale prefix: /intl-pt/track/<id>
      const offset = parts[0]?.startsWith("intl-") ? 1 : 0;
      const type = parts[offset];
      const id = parts[offset + 1];
      if (!type || !id || !SPOTIFY_TYPES.has(type) || !/^[A-Za-z0-9]+$/.test(id)) return link;
      return {
        kind: "spotify",
        embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
        compact: type === "track" || type === "episode",
      };
    }
    case "INSTAGRAM": {
      // Public posts and reels have an official /embed page; stories and profiles don't.
      const type = parts[0];
      const code = parts[1];
      if (!type || !code || !["p", "reel", "reels", "tv"].includes(type) || !IG_CODE.test(code)) return link;
      const path = type === "reels" ? "reel" : type;
      return { kind: "instagram", embedUrl: `https://www.instagram.com/${path}/${code}/embed` };
    }
    default:
      return link;
  }
}

/** A small image for collection collages, when one can be derived without fetching. */
export function getThumbnail(url: string): string | null {
  const p = getPreview(url);
  return p.kind === "youtube" ? p.thumbnailUrl : null;
}
