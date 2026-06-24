"use client";

import { cn } from "@/lib/utils";

export type Tab = { id: string; label: React.ReactNode; badge?: React.ReactNode };

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        // `scroll-dark` : barre de défilement discrète quand les onglets
        // débordent (mobile). `pt-0.5` laisse respirer le halo de focus
        // clavier, sinon rogné par l'overflow.
        "scroll-dark flex items-end gap-1 overflow-x-auto pt-0.5 border-b border-[var(--color-admin-divider)]",
        className,
      )}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative inline-flex h-10 items-center gap-2 whitespace-nowrap px-3 text-[13px] font-medium",
              "rounded-t-[var(--radius-admin-md)] transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-admin-accent-ring)]",
              isActive
                ? "text-[var(--color-admin-accent)]"
                : "text-[var(--color-admin-muted)] hover:bg-[var(--color-admin-sunken)] hover:text-[var(--color-admin-text)]",
            )}
          >
            {t.label}
            {t.badge ? (
              <span
                className={cn(
                  "tnum inline-flex min-w-4 items-center justify-center rounded-[var(--radius-admin-full)] px-1.5 text-[11px] font-medium leading-4",
                  isActive
                    ? "bg-[var(--color-admin-accent-soft)] text-[var(--color-admin-accent)]"
                    : "bg-[var(--color-admin-sunken)] text-[var(--color-admin-muted)]",
                )}
              >
                {t.badge}
              </span>
            ) : null}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 -bottom-px h-[2px] rounded-full transition-colors duration-150",
                isActive
                  ? "bg-[var(--color-admin-accent)]"
                  : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
