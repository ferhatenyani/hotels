"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { IconButton } from "./Button";

export function Toolbar({
  search,
  onSearch,
  searchPlaceholder = "Rechercher…",
  filters,
  trailing,
  className,
}: {
  search?: string;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
  /** Chips / select de filtres au centre. */
  filters?: React.ReactNode;
  /** Bouton CTA primaire à droite (ex: « Nouvelle réservation »). */
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        "rounded-[var(--radius-admin-lg)] bg-[var(--color-admin-panel)] ring-1 ring-[var(--color-admin-border)] p-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onSearch ? (
          <div className="relative w-full md:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-admin-faint)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="search"
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "h-10 w-full rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] pl-9 pr-9 text-[16px] md:text-[13.5px]",
                "text-[var(--color-admin-text)] placeholder:text-[var(--color-admin-faint)]",
                "transition-shadow duration-150 motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-marine",
              )}
              aria-label="Rechercher"
            />
            {search ? (
              <IconButton
                aria-label="Effacer la recherche"
                size="sm"
                icon={<X className="size-4" strokeWidth={1.75} />}
                onClick={() => onSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7"
                type="button"
              />
            ) : null}
          </div>
        ) : null}
        {filters ? (
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">{filters}</div>
        ) : null}
      </div>
      {trailing ? (
        <div className="flex items-center gap-2 shrink-0">{trailing}</div>
      ) : null}
    </div>
  );
}

// ─── Filter chip (utilisable comme bouton de filtre actif) ─────────────

export function FilterChip({
  label,
  active,
  onClick,
  onClear,
}: {
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onClear?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-8 pl-3 rounded-[var(--radius-admin-full)] text-[12px] font-medium transition-colors duration-150",
        active
          ? "bg-[var(--color-admin-accent-soft)] text-[var(--color-admin-accent)] pr-1.5 ring-1 ring-inset ring-[var(--color-admin-accent)]/15"
          : "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)] hover:bg-[var(--color-admin-border)] pr-3",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="rounded-[var(--radius-admin-full)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
      >
        {label}
      </button>
      {active && onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Retirer ce filtre"
          className="ml-0.5 flex size-5 items-center justify-center rounded-full hover:bg-[var(--color-admin-accent)]/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-marine"
        >
          <X className="size-3.5" strokeWidth={1.75} />
        </button>
      ) : null}
    </span>
  );
}
