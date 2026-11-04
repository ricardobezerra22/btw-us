"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/utils";

type Props = { user: { name: string; username: string | null; avatarUrl: string | null } };

export function ProfileForm({ user }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const dirty = name.trim() !== user.name || avatarUrl.trim() !== (user.avatarUrl ?? "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      await api("/api/profile", { method: "PATCH", json: { name, avatarUrl } });
      setStatus("saved");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  async function logout() {
    setLeaving(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar name={name || user.name} src={avatarUrl.startsWith("https://") ? avatarUrl : null} size="lg" />
        <div>
          <p className="text-h2">{user.name}</p>
          <p className="text-secondary">@{user.username}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => (setName(e.target.value), setStatus("idle"))}
          maxLength={50}
          required
        />
        <Input
          label="Avatar image URL"
          type="url"
          placeholder="https://…"
          value={avatarUrl}
          onChange={(e) => (setAvatarUrl(e.target.value), setStatus("idle"))}
          hint="Paste a link to an image. Leave empty to use your initials."
        />
        {error && (
          <p role="alert" className="text-small text-error">
            {error}
          </p>
        )}
        <Button type="submit" loading={status === "saving"} disabled={!dirty}>
          {status === "saved" && !dirty ? "Saved" : "Save changes"}
        </Button>
      </form>

      <Button variant="secondary" onClick={logout} loading={leaving}>
        <LogOut className="size-4" /> Log out
      </Button>
    </div>
  );
}
