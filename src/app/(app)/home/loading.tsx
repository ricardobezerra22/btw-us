import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { AppHeader } from "@/components/navigation/app-header";

export default function Loading() {
  return (
    <>
      <AppHeader />
      <div className="mx-auto max-w-[640px] py-3 md:px-4 md:py-6">
        <FeedSkeleton />
      </div>
    </>
  );
}
