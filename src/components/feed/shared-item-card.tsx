"use client";

import { Bookmark, BookmarkMinus, Check, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClass } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { api, cn, formatPostDate } from "@/lib/utils";
import type { FeedItem } from "@/modules/items/service";
import { ContentPreview } from "./content-preview";
import { PlatformBadge } from "./platform-badge";

export type CollectionOption = { id: string; name: string };

type Props = {
  item: FeedItem;
  viewerId: string;
  collections: CollectionOption[];
  /** When rendered inside a collection: offers "remove from this collection". */
  inCollectionId?: string;
  onRemoved?: (id: string) => void;
};

export function SharedItemCard({ item, viewerId, collections, inCollectionId, onRemoved }: Props) {
  const router = useRouter();
  const [collectionIds, setCollectionIds] = useState(item.collectionIds);
  const [picking, setPicking] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function toggle(collectionId: string) {
    const isIn = collectionIds.includes(collectionId);
    setPending(collectionId);
    setError(null);
    try {
      if (isIn) await api(`/api/collections/${collectionId}/items/${item.id}`, { method: "DELETE" });
      else await api(`/api/collections/${collectionId}/items`, { method: "POST", json: { itemId: item.id } });
      setCollectionIds((ids) => (isIn ? ids.filter((id) => id !== collectionId) : [...ids, collectionId]));
      if (isIn && collectionId === inCollectionId) onRemoved?.(item.id);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      await api(`/api/items/${item.id}`, { method: "DELETE" });
      setConfirmDelete(false);
      onRemoved?.(item.id);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setDeleting(false);
    }
  }

  const saved = collectionIds.length > 0;

  return (
    <article className="overflow-hidden border-y border-border bg-surface md:rounded-card md:border">
      <header className="flex items-center gap-3 px-4 pb-3 pt-4">
        <Avatar name={item.user.name} src={item.user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold">{item.user.name}</p>
          <p className="text-caption text-secondary">
            <time dateTime={item.createdAt} suppressHydrationWarning>
              {formatPostDate(item.createdAt)}
            </time>
          </p>
        </div>
        <PlatformBadge platform={item.platform} />
      </header>

      {item.message && <p className="whitespace-pre-line break-words px-4 pb-3 text-body">{item.message}</p>}

      <ContentPreview url={item.url} />

      <footer className="flex items-center gap-1 px-2 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPicking(true)}
          aria-label={saved ? "Edit collections" : "Save to a collection"}
        >
          <Bookmark className={cn("size-6", saved && "fill-sunflower text-sunflower-hover")} />
        </Button>
        {inCollectionId && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggle(inCollectionId)}
            loading={pending === inCollectionId}
            aria-label="Remove from this collection"
          >
            {pending !== inCollectionId && <BookmarkMinus className="size-6" />}
          </Button>
        )}
        {item.user.id === viewerId && !inCollectionId && (
          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)} aria-label="Delete share">
            <Trash2 className="size-5 text-secondary" />
          </Button>
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonClass("ghost"), "ml-auto text-small text-secondary")}
        >
          Open original <ExternalLink className="size-4" />
        </a>
      </footer>
      {error && !picking && !confirmDelete && (
        <p role="alert" className="px-4 pb-3 text-caption text-error">
          {error}
        </p>
      )}

      <Dialog open={picking} onClose={() => setPicking(false)} title="Save to collections">
        {collections.length === 0 ? (
          <p className="text-secondary">
            No collections yet. Create one in{" "}
            <Link href="/collections" className="font-semibold text-forest underline">
              Collections
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {collections.map((c) => {
              const checked = collectionIds.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={pending !== null}
                    onClick={() => toggle(c.id)}
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-control px-3 text-left hover:bg-muted disabled:opacity-60"
                  >
                    <span className="truncate">{c.name}</span>
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md border",
                        checked ? "border-olive bg-olive text-white" : "border-border",
                      )}
                    >
                      {checked && <Check className="size-4" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-3 text-small text-error">
            {error}
          </p>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        loading={deleting}
        error={error}
        title="Delete this share?"
        description="It will disappear from the feed and from every collection. This can't be undone."
        confirmLabel="Delete"
      />
    </article>
  );
}
