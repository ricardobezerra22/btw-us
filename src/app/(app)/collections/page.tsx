import { Bookmark } from "lucide-react";
import { CollectionCard } from "@/components/collections/collection-card";
import { NewCollectionButton } from "@/components/collections/collection-form-dialog";
import { AppHeader } from "@/components/navigation/app-header";
import { requireViewer } from "@/modules/auth/session";
import { listCollections } from "@/modules/collections/service";

export default async function CollectionsPage() {
  const viewer = await requireViewer();
  const collections = await listCollections(viewer);
  return (
    <>
      <AppHeader title="Collections" action={<NewCollectionButton label="New collection" />} />
      <div className="mx-auto max-w-[640px] px-4 py-4 md:py-6">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-olive">
              <Bookmark className="size-7" />
            </span>
            <h2 className="text-h2">No collections yet</h2>
            <p className="mt-1 text-secondary">Group the things you share — songs for road trips, recipes to try…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {collections.map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
