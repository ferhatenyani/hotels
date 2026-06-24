// Mapping centralisé tone → classes Tailwind. Toutes les primitives qui
// affichent un statut (Badge, StatusPill, Toast, EmptyState, StatTile delta)
// passent par ici. Aucun composant n'a le droit de hard-coder une couleur.

import type {
  InvoiceStatus,
  ReservationStatus,
  RoomStatus,
  TaskStatus,
} from "@/lib/admin/types";

export type Tone =
  | "ok"
  | "warn"
  | "danger"
  | "info"
  | "muted"
  | "violet"
  | "amber"
  | "solid";

/** Bandeau plein de la pastille / pill (background + foreground). */
export const toneFill: Record<Tone, string> = {
  ok: "bg-[var(--color-admin-ok-bg)] text-[var(--color-admin-ok-fg)]",
  warn: "bg-[var(--color-admin-warn-bg)] text-[var(--color-admin-warn-fg)]",
  danger: "bg-[var(--color-admin-danger-bg)] text-[var(--color-admin-danger-fg)]",
  info: "bg-[var(--color-admin-info-bg)] text-[var(--color-admin-info-fg)]",
  muted: "bg-[var(--color-admin-muted-bg)] text-[var(--color-admin-muted-fg)]",
  violet: "bg-[var(--color-admin-violet-bg)] text-[var(--color-admin-violet-fg)]",
  amber: "bg-[var(--color-admin-amber-bg)] text-[var(--color-admin-amber-fg)]",
  solid: "bg-[var(--color-admin-solid-bg)] text-[var(--color-admin-solid-fg)]",
};

/** Dot de couleur seul (à pairer avec un libellé). */
export const toneDot: Record<Tone, string> = {
  ok: "bg-[var(--color-admin-ok-fg)]",
  warn: "bg-[var(--color-admin-warn-fg)]",
  danger: "bg-[var(--color-admin-danger-fg)]",
  info: "bg-[var(--color-admin-info-fg)]",
  muted: "bg-[var(--color-admin-muted-fg)]",
  violet: "bg-[var(--color-admin-violet-fg)]",
  amber: "bg-[var(--color-admin-amber-fg)]",
  solid: "bg-[var(--color-admin-solid-bg)]",
};

/** Texte seul (utilisé dans EmptyState/StatTile pour souligner une variation). */
export const toneText: Record<Tone, string> = {
  ok: "text-[var(--color-admin-ok-fg)]",
  warn: "text-[var(--color-admin-warn-fg)]",
  danger: "text-[var(--color-admin-danger-fg)]",
  info: "text-[var(--color-admin-info-fg)]",
  muted: "text-[var(--color-admin-muted-fg)]",
  violet: "text-[var(--color-admin-violet-fg)]",
  amber: "text-[var(--color-admin-amber-fg)]",
  solid: "text-[var(--color-admin-solid-bg)]",
};

// ─── Mappings statut métier → tone ─────────────────────────────────────

export const roomStatusTone: Record<RoomStatus, Tone> = {
  "vacant-clean": "ok",
  occupied: "solid",
  "vacant-dirty": "amber",
  inspection: "info",
  "out-of-order": "danger",
  maintenance: "violet",
};

export const reservationStatusTone: Record<ReservationStatus, Tone> = {
  confirmed: "ok",
  option: "warn",
  "arrival-expected": "info",
  "checked-in": "solid",
  "departure-expected": "info",
  "checked-out": "muted",
  cancelled: "danger",
  "no-show": "danger",
};

export const invoiceStatusTone: Record<InvoiceStatus, Tone> = {
  open: "info",
  paid: "ok",
  partial: "warn",
  void: "muted",
  refunded: "muted",
};

export const taskStatusTone: Record<TaskStatus, Tone> = {
  pending: "warn",
  "in-progress": "info",
  done: "ok",
  blocked: "danger",
};
