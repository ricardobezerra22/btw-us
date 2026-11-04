import { AppNav } from "@/components/navigation/app-nav";
import { requireViewer } from "@/modules/auth/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireViewer();
  return (
    <>
      <AppNav />
      <main className="pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0 md:pl-60">{children}</main>
    </>
  );
}
