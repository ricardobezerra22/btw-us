import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-sunflower text-foreground hover:bg-sunflower-hover",
  secondary: "bg-surface text-foreground border border-border hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  danger: "bg-error text-white hover:bg-error/90",
} as const;

type Props = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: "md" | "icon";
  loading?: boolean;
};

export const buttonClass = (variant: keyof typeof variants = "primary", size: "md" | "icon" = "md") =>
  cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-control text-body font-semibold transition-colors",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    size === "md" ? "min-h-11 px-4" : "size-11",
    variants[variant],
  );

export function Button({ variant, size, loading, disabled, className, children, ...props }: Props) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClass(variant, size), className)}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
