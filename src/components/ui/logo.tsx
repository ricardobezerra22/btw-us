import { cn } from "@/lib/utils";

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];

export function Sunflower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      {PETALS.map((deg) => (
        <ellipse key={deg} cx="16" cy="6" rx="3.2" ry="5.5" fill="#F4C542" transform={`rotate(${deg} 16 16)`} />
      ))}
      <circle cx="16" cy="16" r="6" fill="#35452D" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Sunflower />
      <span className="text-h3 tracking-tight">Between Us</span>
    </span>
  );
}
