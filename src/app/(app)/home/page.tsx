import { FeedList } from "@/components/feed/feed-list";
import { AppHeader } from "@/components/navigation/app-header";
import { requireViewer } from "@/modules/auth/session";
import { listCollections } from "@/modules/collections/service";
import { listFeed } from "@/modules/items/service";
import { getSpaceMembers } from "@/modules/profile/service";

export default async function HomePage() {
  const viewer = await requireViewer();
  const [feed, collections, members] = await Promise.all([
    listFeed(viewer, { limit: 10 }),
    listCollections(viewer),
    getSpaceMembers(viewer),
  ]);
  return (
    <>
      <AppHeader members={members} />
      <div className="mx-auto max-w-[640px] py-3 md:px-4 md:py-6">
        <FeedList
          // Remount on server refresh so a new share shows up at the top.
          key={feed.items[0]?.id ?? "empty"}
          initial={feed}
          viewerId={viewer.userId}
          collections={collections.map(({ id, name }) => ({ id, name }))}
        />
      </div>
    </>
  );
}
