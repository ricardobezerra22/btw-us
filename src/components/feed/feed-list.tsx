"use client";

import { Plus, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { api } from "@/lib/utils";
import type { FeedItem } from "@/modules/items/service";
import { FeedSkeleton } from "./feed-skeleton";
import { SharedItemCard, type CollectionOption } from "./shared-item-card";

type Page = { items: FeedItem[]; nextCursor: string | null };
type Props = { initial: Page; viewerId: string; collections: CollectionOption[] };

export function FeedList({ initial, viewerId, collections }: Props) {
  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const page = await api<Page>(`/api/items?cursor=${encodeURIComponent(cursor)}`);
      setItems((prev) => [...prev, ...page.items.filter((p) => !prev.some((i) => i.id === p.id))]);
      setCursor(page.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load when the sentinel scrolls into view; the button below stays as a keyboard/fallback path.
  const onVisible = useEffectEvent(loadMore);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !cursor) return;
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && onVisible(), {
      rootMargin: "600px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [cursor]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-olive">
          <Sun className="size-7" />
        </span>
        <h2 className="text-h2">Nothing here yet!</h2>
        <p className="mt-1 text-secondary">Share something that made you smile.</p>
        <Link href="/share" className={buttonClass("primary") + " mt-6"}>
          <Plus className="size-5" /> Share something
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:gap-6">
      {items.map((item) => (
        <SharedItemCard
          key={item.id}
          item={item}
          viewerId={viewerId}
          collections={collections}
          onRemoved={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
        />
      ))}
      <div ref={sentinel} />
      {loading && <FeedSkeleton count={1} />}
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2 py-4 text-small text-error">
          {error}
          <Button variant="secondary" onClick={loadMore}>
            Try again
          </Button>
        </div>
      )}
      {cursor && !loading && !error && (
        <Button variant="ghost" onClick={loadMore} className="mx-auto text-secondary">
          Load more
        </Button>
      )}
      {!cursor && <p className="py-6 text-center text-caption text-secondary">You&apos;re all caught up</p>}
    </div>
  );
}
