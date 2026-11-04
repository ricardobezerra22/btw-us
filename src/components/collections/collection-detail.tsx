"use client";

import { ArrowLeft, Check, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlatformBadge } from "@/components/feed/platform-badge";
import { SharedItemCard, type CollectionOption } from "@/components/feed/shared-item-card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { api, cn } from "@/lib/utils";
import type { FeedItem } from "@/modules/items/service";
import { CollectionFormDialog } from "./collection-form-dialog";

type Props = {
  collection: { id: string; name: string; description: string | null; items: FeedItem[] };
  candidates: FeedItem[];
  collections: CollectionOption[];
  viewerId: string;
};

export function CollectionDetail({ collection, candidates, collections, viewerId }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(collection.items);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inIds = new Set(items.map((i) => i.id));
  const addable = candidates.filter((c) => !inIds.has(c.id));

  async function deleteCollection() {
    setBusy("delete");
    setError(null);
    try {
      await api(`/api/collections/${collection.id}`, { method: "DELETE" });
      router.replace("/collections");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  async function add(item: FeedItem) {
    setBusy(item.id);
    setError(null);
    try {
      await api(`/api/collections/${collection.id}/items`, { method: "POST", json: { itemId: item.id } });
      setItems((prev) => [{ ...item, collectionIds: [...item.collectionIds, collection.id] }, ...prev]);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur md:border-none md:bg-background/95">
        <div className="mx-auto flex h-14 max-w-[640px] items-center gap-1 px-2">
          <Link href="/collections" aria-label="Back to collections" className="flex size-11 items-center justify-center rounded-control hover:bg-muted">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-h2">{collection.name}</h1>
          <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Edit collection">
            <Pencil className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)} aria-label="Delete collection">
            <Trash2 className="size-5" />
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-[640px] py-4 md:px-4 md:py-6">
        <div className="mb-4 flex items-start justify-between gap-3 px-4 md:px-0">
          <div>
            {collection.description && <p className="text-secondary">{collection.description}</p>}
            <p className="text-caption text-secondary">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setAdding(true)} className="shrink-0">
            <Plus className="size-4" /> Add items
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="px-4 py-16 text-center text-secondary">This collection is empty. Add something you&apos;ve shared.</p>
        ) : (
          <div className="flex flex-col gap-3 md:gap-6">
            {items.map((item) => (
              <SharedItemCard
                key={item.id}
                item={item}
                viewerId={viewerId}
                collections={collections}
                inCollectionId={collection.id}
                onRemoved={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
              />
            ))}
          </div>
        )}
      </div>

      <CollectionFormDialog open={editing} onClose={() => setEditing(false)} collection={collection} />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteCollection}
        loading={busy === "delete"}
        error={error}
        title={`Delete “${collection.name}”?`}
        description="The collection goes away, but everything in it stays in your feed."
        confirmLabel="Delete collection"
      />

      <Dialog open={adding} onClose={() => setAdding(false)} title="Add to collection">
        {addable.length === 0 ? (
          <p className="text-secondary">Everything recent is already here. Share something new first.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {addable.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => add(item)}
                  disabled={busy !== null}
                  className="flex min-h-14 w-full items-center gap-3 rounded-control px-2 py-2 text-left hover:bg-muted disabled:opacity-60"
                >
                  <PlatformBadge platform={item.platform} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-small font-medium">{item.message || item.url}</span>
                    <span className="block truncate text-caption text-secondary">
                      {item.user.name} · {new URL(item.url).hostname.replace(/^www\./, "")}
                    </span>
                  </span>
                  <span className={cn("flex size-8 items-center justify-center rounded-full bg-sunflower")}>
                    {busy === item.id ? <Check className="size-4 animate-pulse" /> : <Plus className="size-4" />}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-3 text-small text-error">
            {error}
          </p>
        )}
      </Dialog>
    </>
  );
}
