"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { IconButton } from "./Button";

const EASE = "cubic-bezier(0.22,1,0.36,1)";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // `mounted` gère le cycle d'entrée/sortie pour piloter la transition CSS
  // (220ms) sans dépendre des utilitaires animate-in à durée fixe.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    const prevActive = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") trapFocus(e, panelRef.current);
    };
    window.addEventListener("keydown", onKey);

    // Déclenche la transition d'entrée au frame suivant + focus initial.
    const raf = requestAnimationFrame(() => {
      setEntered(true);
      focusFirst(panelRef.current);
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      prevActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 motion-reduce:transition-none"
      style={{ zIndex: "var(--z-admin-modal)" }}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : undefined}
    >
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-admin-scrim)] backdrop-blur-[2px] transition-opacity motion-reduce:transition-none"
        style={{
          zIndex: "var(--z-admin-overlay)",
          opacity: entered ? 1 : 0,
          transitionDuration: "220ms",
          transitionTimingFunction: EASE,
        }}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative w-full overflow-hidden rounded-[var(--radius-admin-xl)] bg-[var(--color-admin-panel)] focus:outline-none",
          "shadow-[var(--shadow-admin-lg)] ring-1 ring-[var(--color-admin-border)]",
          "transition-[opacity,transform] motion-reduce:transition-none",
          size === "sm" && "max-w-md",
          size === "md" && "max-w-lg",
          size === "lg" && "max-w-2xl",
        )}
        style={{
          zIndex: "var(--z-admin-modal)",
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.96)",
          transitionDuration: "220ms",
          transitionTimingFunction: EASE,
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-admin-divider)] px-5 pb-4 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold leading-6 tracking-tight text-[var(--color-admin-text)]">
              {title}
            </h2>
            {description ? (
              <p className="mt-1.5 text-[13px] leading-5 text-[var(--color-admin-muted)]">
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
        <div className="px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 rounded-b-[var(--radius-admin-xl)] border-t border-[var(--color-admin-divider)] bg-[var(--color-admin-sunken)]/40 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

// ─── Gestion du focus (piège + focus initial) ──────────────────────────

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

function focusFirst(root: HTMLElement | null) {
  const els = focusables(root);
  (els[0] ?? root)?.focus?.();
}

function trapFocus(e: KeyboardEvent, root: HTMLElement | null) {
  const els = focusables(root);
  if (els.length === 0) {
    e.preventDefault();
    root?.focus?.();
    return;
  }
  const first = els[0];
  const last = els[els.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}
