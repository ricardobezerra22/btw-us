import { Bookmark, Camera, Globe, Music2, SquarePlay } from "lucide-react";
import Link from "next/link";
import { getThumbnail, resolvePlatform } from "@/modules/items/lib/resolve-platform";
import type { CollectionSummary } from "@/modules/collections/service";

const ICONS = { INSTAGRAM: Camera, SPOTIFY: Music2, YOUTUBE: SquarePlay, OTHER: Globe };

function Tile({ url }: { url?: string }) {
  if (!url) return <div className="bg-muted" />;
  const thumb = getThumbnail(url);
  if (thumb) {
    // eslint-disable-next-line @next/next/no-img-element -- ytimg thumbnail
    return <img src={thumb} alt="" loading="lazy" className="size-full object-cover" />;
  }
  const Icon = ICONS[resolvePlatform(url)?.platform ?? "OTHER"];
  return (
    <div className="flex items-center justify-center bg-muted text-olive">
      <Icon className="size-5" aria-hidden />
    </div>
  );
}

export function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const { id, name, description, itemCount, previewUrls } = collection;
  return (
    <Link
      href={`/collections/${id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-secondary/40"
    >
      <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 bg-border">
        {previewUrls.length === 0 ? (
          <div className="col-span-2 row-span-2 flex items-center justify-center bg-muted text-secondary">
            <Bookmark className="size-8" aria-hidden />
          </div>
        ) : previewUrls.length === 1 ? (
          <div className="col-span-2 row-span-2 grid">
            <Tile url={previewUrls[0]} />
          </div>
        ) : (
          [0, 1, 2, 3].map((i) => <Tile key={i} url={previewUrls[i]} />)
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-h3">{name}</h3>
        <p className="text-caption text-secondary">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
        {description && <p className="mt-1 line-clamp-2 text-small text-secondary">{description}</p>}
      </div>
    </Link>
  );
}
