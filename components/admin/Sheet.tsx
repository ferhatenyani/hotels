"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { IconButton } from "./Button";

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** sm 380px · md 480px · lg 640px */
  width?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 h-full bg-[var(--color-admin-panel)] shadow-lg",
          "ring-1 ring-[var(--color-admin-border)]",
          "flex flex-col",
          "animate-in slide-in-from-right duration-200",
          width === "sm" && "w-full max-w-[380px]",
          width === "md" && "w-full max-w-[480px]",
          width === "lg" && "w-full max-w-[640px]",
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-[var(--color-admin-divider)] shrink-0">
          <div className="min-w-0">
            <h2 className="font-display text-[18px] leading-6 tracking-tight text-[var(--color-admin-text)]">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-5 text-[var(--color-admin-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton
            aria-label="Fermer"
            icon={<X className="size-4" />}
            onClick={onClose}
            variant="ghost"
            size="sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 scroll-dark">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-admin-divider)] bg-[var(--color-admin-sunken)]/40 shrink-0">
            {footer}
          </div>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
