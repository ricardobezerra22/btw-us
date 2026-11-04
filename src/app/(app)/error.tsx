"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-[640px] flex-col items-center px-6 py-20 text-center">
      <AlertCircle className="mb-3 size-8 text-error" />
      <h2 className="text-h2">Something went wrong</h2>
      <p className="mt-1 text-secondary">We couldn&apos;t load this page. Check your connection and try again.</p>
      <Button variant="secondary" onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
