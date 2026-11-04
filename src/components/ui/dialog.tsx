"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode };

/** Native <dialog>: showModal() gives focus trapping, Esc to close and focus restore for free. */
export function Dialog({ open, onClose, title, children, footer }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // showModal() focuses the first focusable (the close button); prefer the first field when there is one.
      el.querySelector<HTMLElement>("input, textarea")?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className="m-auto w-[calc(100%-32px)] max-w-md rounded-card bg-surface p-0 text-foreground shadow-xl"
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <h2 id="dialog-title" className="text-h3">
              {title}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="size-5" />
            </Button>
          </div>
          <div className="overflow-y-auto p-4">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

type ConfirmProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  error?: string | null;
};

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, loading, error }: ConfirmProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-secondary">{description}</p>
      {error && (
        <p role="alert" className="mt-3 text-small text-error">
          {error}
        </p>
      )}
    </Dialog>
  );
}
