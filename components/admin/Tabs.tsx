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
        "flex items-end gap-0 border-b border-[var(--color-admin-divider)] overflow-x-auto",
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
            onClick={() => onChange(t.id)}
            className={cn(
              "relative h-10 px-3.5 inline-flex items-center gap-2 text-[13px] font-medium whitespace-nowrap",
              "transition-colors duration-150",
              isActive
                ? "text-[var(--color-admin-text)]"
                : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
            )}
          >
            {t.label}
            {t.badge ? <span className="text-[11px] text-[var(--color-admin-muted)] tnum">{t.badge}</span> : null}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 right-0 -bottom-px h-[2px]",
                isActive ? "bg-marine" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
