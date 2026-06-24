"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { IconButton } from "./Button";

const EASE = "cubic-bezier(0.22,1,0.36,1)";

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
  /** sm 380px · md 480px · lg 640px (desktop). En mobile : feuille basse pleine largeur. */
  width?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  // Détecte le point de rupture pour choisir l'axe d'animation (bas vs droite).
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onMq);

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

    const raf = requestAnimationFrame(() => {
      setEntered(true);
      focusFirst(panelRef.current);
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      cancelAnimationFrame(raf);
      prevActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  // Axe d'entrée : depuis le bas en mobile, depuis la droite en desktop.
  const hidden = isMobile ? "translateY(100%)" : "translateX(100%)";

  return createPortal(
    <div
      className="fixed inset-0"
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
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col bg-[var(--color-admin-panel)] focus:outline-none",
          "shadow-[var(--shadow-admin-lg)] ring-1 ring-[var(--color-admin-border)]",
          "transition-transform motion-reduce:transition-none",
          // Mobile : feuille basse pleine largeur, hauteur plafonnée, coins hauts arrondis.
          "inset-x-0 bottom-0 max-h-[88vh] rounded-t-[var(--radius-admin-xl)]",
          // Desktop : drawer pleine hauteur ancré à droite.
          "sm:inset-y-0 sm:left-auto sm:right-0 sm:bottom-auto sm:h-full sm:max-h-none sm:rounded-none sm:w-full",
          width === "sm" && "sm:max-w-[380px]",
          width === "md" && "sm:max-w-[480px]",
          width === "lg" && "sm:max-w-[640px]",
        )}
        style={{
          zIndex: "var(--z-admin-modal)",
          transform: entered ? "translate(0,0)" : hidden,
          transitionDuration: "220ms",
          transitionTimingFunction: EASE,
        }}
      >
        {/* Indicateur de préhension (feuille basse) */}
        <div
          aria-hidden
          className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-[var(--radius-admin-full)] bg-[var(--color-admin-border-strong)] sm:hidden"
        />
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-admin-divider)] px-5 pb-4 pt-4 sm:pt-5">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold leading-6 tracking-tight text-[var(--color-admin-text)] sm:text-[18px]">
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
        <div className="scroll-dark flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>
        {footer ? (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--color-admin-divider)] bg-[var(--color-admin-sunken)]/40 px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </aside>
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
