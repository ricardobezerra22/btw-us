import { describe, expect, it } from "vitest";
import { getPreview, resolvePlatform } from "@/modules/items/lib/resolve-platform";

describe("resolvePlatform", () => {
  it.each([
    ["https://www.instagram.com/p/C1abc_-9/", "INSTAGRAM"],
    ["https://instagram.com/reel/XYZ123/", "INSTAGRAM"],
    ["https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC", "SPOTIFY"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "YOUTUBE"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "YOUTUBE"],
    ["https://youtu.be/dQw4w9WgXcQ", "YOUTUBE"],
    ["https://example.com/article", "OTHER"],
    ["https://WWW.YOUTUBE.COM/watch?v=dQw4w9WgXcQ", "YOUTUBE"],
  ])("%s → %s", (url, platform) => {
    expect(resolvePlatform(url)?.platform).toBe(platform);
  });

  it("does not trust lookalike hosts", () => {
    expect(resolvePlatform("https://youtube.com.evil.test/watch?v=x")?.platform).toBe("OTHER");
    expect(resolvePlatform("https://notinstagram.com/p/abc")?.platform).toBe("OTHER");
    expect(resolvePlatform("https://spotify.com/track/abc")?.platform).toBe("OTHER");
  });

  it.each([
    "http://youtube.com/watch?v=dQw4w9WgXcQ",
    "javascript:alert(1)",
    "ftp://example.com/file",
    "not a url",
    "",
    "https://localhost/x",
    "https://user:pass@example.com/",
  ])("rejects %j", (url) => {
    expect(resolvePlatform(url)).toBeNull();
  });
});

describe("getPreview", () => {
  it("builds YouTube embeds with a thumbnail", () => {
    expect(getPreview("https://youtu.be/dQw4w9WgXcQ?t=10")).toMatchObject({
      kind: "youtube",
      videoId: "dQw4w9WgXcQ",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
  });

  it("builds Spotify embeds for tracks, albums, playlists (incl. locale prefix)", () => {
    expect(getPreview("https://open.spotify.com/intl-pt/track/4uLU6hMCjMI75M1A2tKUQC")).toEqual({
      kind: "spotify",
      embedUrl: "https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC",
      compact: true,
    });
    expect(getPreview("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")).toMatchObject({ compact: false });
  });

  it("embeds public Instagram posts and reels, falls back for stories/profiles", () => {
    expect(getPreview("https://www.instagram.com/reels/Cabc123/")).toEqual({
      kind: "instagram",
      embedUrl: "https://www.instagram.com/reel/Cabc123/embed",
    });
    expect(getPreview("https://www.instagram.com/stories/someone/123/").kind).toBe("link");
    expect(getPreview("https://www.instagram.com/someone/").kind).toBe("link");
  });

  it("falls back to a link card for malformed platform URLs and other sites", () => {
    expect(getPreview("https://www.youtube.com/watch?v=short")).toEqual({ kind: "link", hostname: "youtube.com" });
    expect(getPreview("https://www.example.com/a")).toEqual({ kind: "link", hostname: "example.com" });
  });
});
