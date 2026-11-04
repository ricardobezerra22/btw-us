"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.username({
      username: String(form.get("username")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(error.status === 401 ? "Wrong email or password." : (error.message ?? "Couldn't sign in. Try again."));
      setLoading(false);
      return;
    }
    router.replace("/home");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={false}>
      <Input label="Username" name="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" required autoFocus />
      <Input label="Password" name="password" type="password" autoComplete="current-password" required />
      {error && (
        <p role="alert" className="rounded-control bg-error/10 px-3 py-2 text-small text-error">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading} className="mt-1 w-full">
        Log in
      </Button>
    </form>
  );
}
