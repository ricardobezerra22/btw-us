import { redirect } from "next/navigation";
import { Sunflower } from "@/components/ui/logo";
import { getViewer } from "@/modules/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getViewer()) redirect("/home");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-[max(24px,env(safe-area-inset-top))]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Sunflower className="mb-3 size-14" />
          <h1 className="text-display">Between Us</h1>
          <p className="mt-1 text-secondary">Your private little corner of the internet.</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-5">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
