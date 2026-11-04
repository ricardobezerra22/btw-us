import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-control border border-border bg-surface px-3.5 text-body text-foreground placeholder:text-secondary " +
  "transition-colors focus:border-forest focus:outline-none focus-visible:outline-none aria-invalid:border-error disabled:opacity-60";

type FieldProps = { label: string; error?: string; hint?: ReactNode; hideLabel?: boolean };

function Field({ label, error, hint, hideLabel, id, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn("text-small font-semibold", hideLabel && "sr-only")}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="text-caption text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-caption text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ label, error, hint, hideLabel, className, ...props }: ComponentProps<"input"> & FieldProps) {
  const id = useId();
  return (
    <Field {...{ label, error, hint, hideLabel, id }}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(control, "h-12", className)}
        {...props}
      />
    </Field>
  );
}

export function Textarea({ label, error, hint, hideLabel, className, ...props }: ComponentProps<"textarea"> & FieldProps) {
  const id = useId();
  return (
    <Field {...{ label, error, hint, hideLabel, id }}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(control, "min-h-24 resize-y py-3", className)}
        {...props}
      />
    </Field>
  );
}
