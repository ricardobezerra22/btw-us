import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3 md:gap-6" aria-busy aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border-y border-border bg-surface md:rounded-card md:border">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="mx-4 mb-3 h-3.5 w-3/4" />
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="p-3">
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
