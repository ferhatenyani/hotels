import { cn } from "@/lib/utils";

export type LoadingVariant = "rows" | "cards" | "kpis" | "block";

export function LoadingState({
  variant = "block",
  rows = 5,
  className,
}: {
  variant?: LoadingVariant;
  rows?: number;
  className?: string;
}) {
  if (variant === "rows") {
    return (
      <div className={cn("animate-pulse", className)} aria-label="Chargement…" role="status">
        <div className="h-10 bg-[var(--color-admin-sunken)] border-b border-[var(--color-admin-border)]" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[24%_18%_18%_18%_22%] gap-2 px-3.5 py-3 border-b border-[var(--color-admin-divider)] last:border-b-0"
          >
            <div className="h-3 rounded bg-[var(--color-admin-sunken)]" />
            <div className="h-3 rounded bg-[var(--color-admin-sunken)]" />
            <div className="h-3 rounded bg-[var(--color-admin-sunken)]" />
            <div className="h-3 rounded bg-[var(--color-admin-sunken)]" />
            <div className="h-3 rounded bg-[var(--color-admin-sunken)]" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "kpis") {
    return (
      <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse", className)} role="status" aria-label="Chargement…">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[104px] rounded-[var(--radius-admin-lg)] bg-[var(--color-admin-panel)] p-4 shadow-[var(--shadow-admin-sm)] ring-1 ring-[var(--color-admin-border)]">
            <div className="h-2.5 w-16 rounded bg-[var(--color-admin-sunken)]" />
            <div className="mt-3.5 h-7 w-24 rounded bg-[var(--color-admin-sunken)]" />
            <div className="mt-2.5 h-2.5 w-12 rounded bg-[var(--color-admin-sunken)]" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse", className)} role="status" aria-label="Chargement…">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-[var(--radius-admin-lg)] bg-[var(--color-admin-panel)] p-4 shadow-[var(--shadow-admin-sm)] ring-1 ring-[var(--color-admin-border)]">
            <div className="h-3 w-1/2 rounded bg-[var(--color-admin-sunken)]" />
            <div className="mt-3 h-2 w-3/4 rounded bg-[var(--color-admin-sunken)]" />
            <div className="mt-2 h-2 w-2/3 rounded bg-[var(--color-admin-sunken)]" />
            <div className="mt-2 h-2 w-3/5 rounded bg-[var(--color-admin-sunken)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse space-y-3 p-6", className)} role="status" aria-label="Chargement…">
      <div className="h-4 w-1/3 rounded bg-[var(--color-admin-sunken)]" />
      <div className="h-3 w-2/3 rounded bg-[var(--color-admin-sunken)]" />
      <div className="h-3 w-1/2 rounded bg-[var(--color-admin-sunken)]" />
    </div>
  );
}
