"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

// Halo de focus clavier (miroir de l'utilitaire `.admin-ring` de globals.css,
// appliqué via focus-visible — visible au clavier uniquement, jamais à la souris).
const focusRing =
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)]";

export type Column<T> = {
  /** Identifiant unique de colonne — utilisé pour le tri. */
  key: string;
  /** En-tête FR (jamais d'anglais). */
  header: React.ReactNode;
  /** Rendu d'une cellule. */
  cell: (row: T, rowIndex: number) => React.ReactNode;
  /** Largeur Tailwind explicite (ex: `w-32`, `w-[180px]`). Sinon flex. */
  width?: string;
  /** Aligner à droite (utile pour montants, durées, dates). */
  align?: "left" | "right" | "center";
  /** Activer le tri sur cette colonne. */
  sortable?: boolean;
  /** Fonction de comparaison personnalisée (sinon : comparaison lexicale du `cell`). */
  sortFn?: (a: T, b: T) => number;
  /** Cacher en dessous d'un breakpoint donné (`md` ou `lg`). */
  hideBelow?: "md" | "lg";
};

export type Density = "compact" | "comfortable";

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  /** Identifiant unique de ligne (utilisé pour la clé React et la sélection). */
  rowKey: (row: T) => string;
  density?: Density;
  loading?: boolean;
  /** Affiché si rows.length === 0 et loading === false. */
  emptyTitle?: string;
  emptyBody?: React.ReactNode;
  emptyAction?: React.ReactNode;
  /** Cliquer sur une ligne déclenche cette callback (ex: ouvrir une Sheet). */
  onRowClick?: (row: T) => void;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  density = "comfortable",
  loading,
  emptyTitle = "Aucun résultat",
  emptyBody = "Aucune donnée à afficher pour le moment.",
  emptyAction,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const sortedRows = (() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const cmp = col.sortFn
      ? col.sortFn
      : (a: T, b: T) => {
          const va = String(col.cell(a, 0));
          const vb = String(col.cell(b, 0));
          return va.localeCompare(vb, "fr");
        };
    const copy = [...rows].sort(cmp);
    return sort.dir === "asc" ? copy : copy.reverse();
  })();

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const compact = density === "compact";

  // ── Densités (cf. APERTURE-REDESIGN §1 Typographie) ──────────────────
  // Confort : text-[14px] · Compact : text-[13px] leading-[18px].
  const bodyText = compact ? "text-[13px] leading-[18px]" : "text-[14px] leading-5";
  const cellPad = compact ? "px-3 py-2" : "px-3.5 py-3";
  // Mode carte (mobile) : densité verticale des paires libellé/valeur.
  const cardRowGap = compact ? "py-1" : "py-1.5";

  const containerCn = cn(
    "overflow-hidden rounded-[var(--radius-admin-lg)]",
    "bg-[var(--color-admin-panel)] ring-1 ring-[var(--color-admin-border)]",
    className,
  );

  if (loading) {
    return (
      <div className={containerCn}>
        <LoadingState variant="rows" rows={6} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={containerCn}>
        <EmptyState title={emptyTitle} body={emptyBody} action={emptyAction} />
      </div>
    );
  }

  const alignCn = (align?: Column<T>["align"]) =>
    cn(align === "right" && "text-right", align === "center" && "text-center");

  const hideBelowCn = (hideBelow?: Column<T>["hideBelow"]) =>
    cn(
      hideBelow === "md" && "hidden md:table-cell",
      hideBelow === "lg" && "hidden lg:table-cell",
    );

  // Lignes interactives : hover calme (sunken), focus visible (halo accent),
  // état actif tinté (accent-soft) au clic/tap.
  const interactiveRow = onRowClick
    ? cn(
        "cursor-pointer transition-colors duration-150 ease-out outline-none",
        "hover:bg-[var(--color-admin-sunken)]",
        "active:bg-[var(--color-admin-accent-soft)]",
        "focus-visible:bg-[var(--color-admin-sunken)]",
        focusRing,
      )
    : undefined;

  const handleRowKey =
    onRowClick && ((row: T) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRowClick(row);
      }
    });

  return (
    <div className={containerCn}>
      {/* ── md+ : tableau complet ─────────────────────────────────────── */}
      <div className="hidden w-full overflow-x-auto md:block">
        <table className={cn("w-full border-collapse", bodyText)}>
          <thead className="sticky top-0 z-[var(--z-admin-sticky)] bg-[var(--color-admin-sunken)]">
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const SortIcon = !col.sortable
                  ? null
                  : isSorted && sort?.dir === "asc"
                    ? ChevronUp
                    : isSorted && sort?.dir === "desc"
                      ? ChevronDown
                      : ChevronsUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      col.sortable
                        ? isSorted
                          ? sort?.dir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                    className={cn(
                      "h-10 border-b border-[var(--color-admin-border)] text-left align-middle",
                      "text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-admin-muted)]",
                      cellPad,
                      col.width,
                      alignCn(col.align),
                      hideBelowCn(col.hideBelow),
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "-mx-1 inline-flex max-w-full items-center gap-1 rounded-[var(--radius-admin-sm)] px-1 py-0.5",
                          "uppercase tracking-[0.06em] transition-colors duration-150 ease-out",
                          "hover:text-[var(--color-admin-text)]",
                          focusRing,
                          col.align === "right" && "ml-auto flex-row-reverse",
                          col.align === "center" && "mx-auto",
                          isSorted && "text-[var(--color-admin-text)]",
                        )}
                      >
                        <span className="truncate">{col.header}</span>
                        {SortIcon ? (
                          <SortIcon
                            aria-hidden
                            className={cn(
                              "size-3 shrink-0",
                              isSorted
                                ? "text-[var(--color-admin-accent)]"
                                : "text-[var(--color-admin-faint)]",
                            )}
                          />
                        ) : null}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, idx) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={handleRowKey ? handleRowKey(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                className={cn(
                  "border-b border-[var(--color-admin-divider)] last:border-b-0",
                  // Subtle zebra so dense rows never visually merge (Apple/Finder
                  // register). Hover / active states below still win.
                  "even:bg-[var(--color-admin-bg)]/55",
                  "text-[var(--color-admin-text)]",
                  interactiveRow,
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      cellPad,
                      "align-middle",
                      alignCn(col.align),
                      hideBelowCn(col.hideBelow),
                    )}
                  >
                    {col.cell(row, idx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── < md : reflow en cartes empilées (paires libellé/valeur) ───── */}
      <ul className="divide-y divide-[var(--color-admin-divider)] md:hidden" role="list">
        {sortedRows.map((row, idx) => {
          // En carte, on ignore les colonnes basse-priorité (hideBelow),
          // exactement comme le tableau les masque sous leur breakpoint.
          const cardCols = columns.filter((c) => c.hideBelow !== "md" && c.hideBelow !== "lg");
          return (
            <li key={rowKey(row)}>
              <div
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={handleRowKey ? handleRowKey(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                className={cn(
                  "flex min-h-[44px] flex-col gap-1 px-4 py-3",
                  bodyText,
                  "text-[var(--color-admin-text)]",
                  interactiveRow,
                )}
              >
                {cardCols.map((col) => (
                  <div
                    key={col.key}
                    className={cn(
                      "flex items-start justify-between gap-3",
                      cardRowGap,
                    )}
                  >
                    <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-admin-muted)]">
                      {col.header}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 break-words text-right",
                        col.align === "left" && "text-left",
                      )}
                    >
                      {col.cell(row, idx)}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Density Toggle (utilisable depuis Toolbar) ────────────────────────

export function DensityToggle({
  value,
  onChange,
}: {
  value: Density;
  onChange: (v: Density) => void;
}) {
  return (
    <div
      className="inline-flex rounded-[var(--radius-admin-md)] bg-[var(--color-admin-panel)] p-0.5 ring-1 ring-[var(--color-admin-border-strong)]"
      role="group"
      aria-label="Densité du tableau"
    >
      {(
        [
          { value: "comfortable", label: "Confort" },
          { value: "compact", label: "Compact" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "h-7 rounded-[var(--radius-admin-sm)] px-2.5 text-[11.5px] font-medium",
            cn("transition-colors duration-150 ease-out", focusRing),
            value === opt.value
              ? "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)]"
              : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
