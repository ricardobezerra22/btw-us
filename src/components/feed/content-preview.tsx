"use client";

import { ExternalLink, Globe, Play } from "lucide-react";
import { useState } from "react";
import { getPreview } from "@/modules/items/lib/resolve-platform";

/** Renders the best available preview for a URL. Never blocks: unknown shapes become a link card. */
export function ContentPreview({ url }: { url: string }) {
  const preview = getPreview(url);
  const [playing, setPlaying] = useState(false);

  switch (preview.kind) {
    case "youtube":
      return (
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {playing ? (
            <iframe
              src={`${preview.embedUrl}?autoplay=1`}
              title="YouTube video"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label="Play video">
              {/* eslint-disable-next-line @next/next/no-img-element -- ytimg thumbnail, avoids image optimizer hop */}
              <img src={preview.thumbnailUrl} alt="" loading="lazy" className="size-full object-cover" />
              <span className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-105">
                <Play className="size-6 translate-x-0.5" fill="currentColor" />
              </span>
            </button>
          )}
        </div>
      );
    case "spotify":
      return (
        <iframe
          src={preview.embedUrl}
          title="Spotify player"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="block w-full border-0"
          style={{ height: preview.compact ? 152 : 352 }}
        />
      );
    case "instagram":
      return (
        <iframe
          src={preview.embedUrl}
          title="Instagram post"
          loading="lazy"
          scrolling="no"
          className="block h-[560px] w-full border-0 bg-surface"
        />
      );
    default:
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 flex items-center gap-3 rounded-control border border-border bg-background p-3 transition-colors hover:bg-muted"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-muted text-olive">
            <Globe className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-small font-semibold">{preview.hostname || "Link"}</span>
            <span className="block truncate text-caption text-secondary">{url}</span>
          </span>
          <ExternalLink className="size-4 shrink-0 text-secondary" />
        </a>
      );
  }
}
