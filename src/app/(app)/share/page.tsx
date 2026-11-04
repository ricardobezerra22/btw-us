import { AppHeader } from "@/components/navigation/app-header";
import { ShareForm } from "@/components/sharing/share-form";
import { requireViewer } from "@/modules/auth/session";
import { listCollections } from "@/modules/collections/service";

export default async function SharePage() {
  const viewer = await requireViewer();
  const collections = await listCollections(viewer);
  return (
    <>
      <AppHeader title="Share" />
      <div className="mx-auto max-w-[640px] px-4 py-4 md:py-6">
        <ShareForm collections={collections.map(({ id, name }) => ({ id, name }))} />
      </div>
    </>
  );
}
