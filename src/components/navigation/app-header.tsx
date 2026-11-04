import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";

type Member = { id: string; name: string; avatarUrl: string | null };

/** Mobile header with brand + both members. On desktop the sidebar carries the brand. */
export function AppHeader({ members, title, action }: { members?: Member[]; title?: string; action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur md:border-none md:bg-background/95">
      <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between gap-3 px-4">
        {title ? <h1 className="truncate text-h2">{title}</h1> : <Logo className="md:invisible" />}
        <div className="flex items-center gap-2">
          {action}
          {members && (
            <div className="flex -space-x-2" aria-label={`Shared by ${members.map((m) => m.name).join(" and ")}`}>
              {members.map((m) => (
                <Avatar key={m.id} name={m.name} src={m.avatarUrl} size="sm" className="ring-2 ring-surface" />
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
