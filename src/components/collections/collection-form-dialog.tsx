"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { api } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Omit to create a new collection. */
  collection?: { id: string; name: string; description: string | null };
};

export function CollectionFormDialog({ open, onClose, collection }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const json = { name: String(form.get("name")), description: String(form.get("description")) };
    setSaving(true);
    setError(null);
    try {
      if (collection) await api(`/api/collections/${collection.id}`, { method: "PATCH", json });
      else await api("/api/collections", { method: "POST", json });
      router.refresh();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={collection ? "Edit collection" : "New collection"}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Name" name="name" defaultValue={collection?.name} maxLength={60} required autoFocus />
        <Textarea
          label="Description (optional)"
          name="description"
          defaultValue={collection?.description ?? ""}
          maxLength={280}
        />
        {error && (
          <p role="alert" className="text-small text-error">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {collection ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function NewCollectionButton({ label = "New" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className="min-h-9 px-3">
        {label}
      </Button>
      <CollectionFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
