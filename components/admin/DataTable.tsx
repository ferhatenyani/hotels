"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

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

  const cellPad = density === "compact" ? "px-3 py-2" : "px-3.5 py-3";
  const rowH = density === "compact" ? "text-[12.5px]" : "text-[13.5px]";

  if (loading) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl bg-[var(--color-admin-panel)] ring-1 ring-[var(--color-admin-border)]",
          className,
        )}
      >
        <LoadingState variant="rows" rows={6} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl bg-[var(--color-admin-panel)] ring-1 ring-[var(--color-admin-border)]",
          className,
        )}
      >
        <EmptyState title={emptyTitle} body={emptyBody} action={emptyAction} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-[var(--color-admin-panel)] ring-1 ring-[var(--color-admin-border)]",
        className,
      )}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--color-admin-sunken)]">
            <tr className="text-left">
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
                    style={col.width ? undefined : undefined}
                    className={cn(
                      "h-10 border-b border-[var(--color-admin-border)] text-[11px] uppercase tracking-[0.06em] font-medium",
                      "text-[var(--color-admin-muted)]",
                      cellPad,
                      col.width,
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.hideBelow === "md" && "hidden md:table-cell",
                      col.hideBelow === "lg" && "hidden lg:table-cell",
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "inline-flex items-center gap-1 -mx-1 px-1 py-0.5 rounded transition-colors",
                          "hover:text-[var(--color-admin-text)]",
                          isSorted && "text-[var(--color-admin-text)]",
                        )}
                      >
                        <span>{col.header}</span>
                        {SortIcon ? <SortIcon className="size-3" /> : null}
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
                className={cn(
                  rowH,
                  "border-b border-[var(--color-admin-divider)] last:border-b-0",
                  onRowClick && "cursor-pointer hover:bg-[var(--color-admin-sunken)]/60 transition-colors",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      cellPad,
                      "align-middle text-[var(--color-admin-text)]",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.hideBelow === "md" && "hidden md:table-cell",
                      col.hideBelow === "lg" && "hidden lg:table-cell",
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
      className="inline-flex rounded-md ring-1 ring-[var(--color-admin-border-strong)] bg-[var(--color-admin-panel)] p-0.5"
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
          className={cn(
            "h-7 px-2.5 text-[11.5px] font-medium rounded transition-colors",
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
