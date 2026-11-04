import { redirect } from "next/navigation";
import { AppHeader } from "@/components/navigation/app-header";
import { ProfileForm } from "@/components/profile-form";
import { getSessionUser } from "@/modules/auth/session";
import { db } from "@/lib/db";

export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  // Read fresh from the DB so edits show immediately (session payload may be cached).
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.id },
    select: { name: true, username: true, avatarUrl: true },
  });
  return (
    <>
      <AppHeader title="Profile" />
      <div className="mx-auto max-w-[480px] px-4 py-6">
        <ProfileForm key={`${user.name}|${user.avatarUrl}`} user={user} />
      </div>
    </>
  );
}
