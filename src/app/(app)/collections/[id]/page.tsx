import { notFound } from "next/navigation";
import { CollectionDetail } from "@/components/collections/collection-detail";
import { requireViewer } from "@/modules/auth/session";
import { getCollection, listCollections } from "@/modules/collections/service";
import { listFeed } from "@/modules/items/service";

export default async function CollectionPage({ params }: PageProps<"/collections/[id]">) {
  const { id } = await params;
  const viewer = await requireViewer();
  const [collection, collections, recent] = await Promise.all([
    getCollection(viewer, id),
    listCollections(viewer),
    // ponytail: "Add items" offers the 50 most recent shares; add search/paging if the feed outgrows that.
    listFeed(viewer, { limit: 50 }),
  ]);
  if (!collection) notFound();
  return (
    <CollectionDetail
      collection={collection}
      candidates={recent.items}
      collections={collections.map(({ id, name }) => ({ id, name }))}
      viewerId={viewer.userId}
    />
  );
}
