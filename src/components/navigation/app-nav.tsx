"use client";

import { Bookmark, Home, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/share", label: "Share", icon: Plus, primary: true },
  { href: "/collections", label: "Collections", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

/** Fixed bottom bar on mobile; left sidebar from md up. */
export function AppNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]",
        "md:inset-y-0 md:left-0 md:right-auto md:w-60 md:border-r md:border-t-0 md:p-4",
      )}
    >
      <Link href="/home" className="mb-6 hidden px-3 py-2 md:block">
        <Logo />
      </Link>
      <ul className="flex h-[60px] items-center justify-around md:h-auto md:flex-col md:items-stretch md:gap-1">
        {LINKS.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-control transition-colors md:justify-start md:px-3",
                  primary
                    ? "md:bg-sunflower md:font-semibold md:hover:bg-sunflower-hover"
                    : active
                      ? "font-semibold text-foreground"
                      : "text-secondary hover:bg-muted hover:text-foreground",
                )}
              >
                {primary ? (
                  <span className="flex size-10 items-center justify-center rounded-[12px] bg-sunflower text-foreground md:size-auto md:bg-transparent">
                    <Plus className="size-6 md:size-5" strokeWidth={2.4} />
                  </span>
                ) : (
                  <Icon className="size-6 md:size-5" strokeWidth={active ? 2.4 : 1.8} />
                )}
                <span className="hidden md:inline">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
