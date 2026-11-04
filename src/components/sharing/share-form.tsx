"use client";

import { Check, CheckCircle2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ContentPreview } from "@/components/feed/content-preview";
import { PlatformBadge } from "@/components/feed/platform-badge";
import type { CollectionOption } from "@/components/feed/shared-item-card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { api, cn } from "@/lib/utils";
import { resolvePlatform } from "@/modules/items/lib/resolve-platform";

export function ShareForm({ collections: initialCollections }: { collections: CollectionOption[] }) {
  const router = useRouter();
  const [collections, setCollections] = useState(initialCollections);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "publishing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const resolved = url.trim() ? resolvePlatform(url) : null;
  const urlError = touched && url.trim() && !resolved ? "Enter a valid https:// link" : undefined;

  async function createCollection() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await api<CollectionOption>("/api/collections", { method: "POST", json: { name } });
      setCollections((c) => [{ id: created.id, name: created.name }, ...c]);
      setSelected((s) => [...s, created.id]);
      setNewName("");
    } catch (err) {
      setCreateError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!resolved || inFlight.current) return; // ref guards double-taps before re-render
    inFlight.current = true;
    setStatus("publishing");
    setError(null);
    try {
      await api("/api/items", { method: "POST", json: { url: resolved.url, message, collectionIds: selected } });
      setStatus("done");
      router.refresh();
      setTimeout(() => router.push("/home"), 900);
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
      inFlight.current = false;
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="flex flex-col items-center py-16 text-center">
        <CheckCircle2 className="mb-3 size-10 text-success" />
        <h2 className="text-h2">Shared!</h2>
        <p className="mt-1 text-secondary">Taking you to the feed…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Input
        label="Link"
        type="url"
        inputMode="url"
        placeholder="https://"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => setTouched(true)}
        error={urlError}
        hint="Instagram, Spotify, YouTube or any https link"
        autoFocus
        required
      />

      {resolved && (
        <section aria-label="Preview" className="overflow-hidden rounded-card border border-border bg-surface">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-caption font-semibold uppercase tracking-wide text-secondary">Preview</span>
            <PlatformBadge platform={resolved.platform} />
          </div>
          <div className="pb-3">
            <ContentPreview key={resolved.url} url={resolved.url} />
          </div>
        </section>
      )}

      <Textarea
        label="Message (optional)"
        placeholder="Why did this make you think of them?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={1000}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-small font-semibold">Collections (optional)</legend>
        {collections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => {
              const on = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected((s) => (on ? s.filter((id) => id !== c.id) : [...s, c.id]))}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-small font-medium transition-colors",
                    on ? "border-olive bg-olive text-white" : "border-border bg-surface hover:bg-muted",
                  )}
                >
                  {on && <Check className="size-4" />}
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              label="New collection"
              hideLabel
              placeholder="New collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // don't submit the share form
                  createCollection();
                }
              }}
              maxLength={60}
              error={createError ?? undefined}
            />
          </div>
          <Button
            variant="secondary"
            onClick={createCollection}
            loading={creating}
            disabled={!newName.trim()}
            className="h-12"
          >
            <Plus className="size-4" /> Create
          </Button>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-control bg-error/10 px-3 py-2 text-small text-error">
          {error}
        </p>
      )}

      <Button type="submit" loading={status === "publishing"} disabled={!url.trim()} className="w-full">
        {status === "publishing" ? "Sharing…" : "Share"}
      </Button>
    </form>
  );
}
