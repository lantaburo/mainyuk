"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({
  action,
  confirmText,
  label = "Hapus",
  className,
  variant = "destructive",
}: {
  action: () => Promise<void>;
  confirmText: string;
  label?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className={className ? "w-full" : ""}
    >
      <Button type="submit" variant={variant} size="sm" className={className}>
        {label}
      </Button>
    </form>
  );
}
