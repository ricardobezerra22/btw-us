import { AppHeader } from "@/components/navigation/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <AppHeader title="Collections" />
      <div className="mx-auto grid max-w-[640px] grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-3 md:py-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-border bg-surface">
            <Skeleton className="aspect-square rounded-none" />
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
