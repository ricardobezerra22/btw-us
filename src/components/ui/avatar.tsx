import { cn } from "@/lib/utils";

type Props = { name: string; src?: string | null; size?: "sm" | "md" | "lg"; className?: string };

const sizes = { sm: "size-8 text-caption", md: "size-10 text-small", lg: "size-20 text-h2" };

export function Avatar({ name, src, size = "md", className }: Props) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-forest ring-1 ring-border",
        sizes[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary https avatar hosts, no remotePatterns
        <img src={src} alt={name} className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span aria-label={name}>{initials || "?"}</span>
      )}
    </span>
  );
}
