// Helpers partagés au domaine Facturation. Aucun import depuis d'autres
// domaines — utilitaires purs, lecture seule.

import type {
  Invoice,
  InvoiceItem,
  InvoiceItemSource,
  Payment,
  PaymentMethod,
} from "@/lib/admin/types";

import type { Tone } from "@/components/admin/tone";

/** Mapping source d'item → tonalité du Badge. */
export const itemSourceTone: Record<InvoiceItemSource, Tone> = {
  room: "solid",
  tax: "muted",
  addon: "info",
  "pos-restaurant": "warn",
  "pos-bar": "warn",
  "pos-spa": "violet",
  extra: "muted",
};

/** Mapping méthode de paiement → tonalité du Badge. */
export const paymentMethodTone: Record<PaymentMethod, Tone> = {
  cash: "ok",
  card: "info",
  transfer: "violet",
  voucher: "amber",
};

/** Convertit une Date en ISO YYYY-MM-DD (jour local, pas UTC). */
export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Aujourd'hui au format ISO (jour). */
export function todayIso(): string {
  return isoDay(new Date());
}

/** Premier jour du mois courant (ISO). */
export function firstOfMonthIso(): string {
  const d = new Date();
  return isoDay(new Date(d.getFullYear(), d.getMonth(), 1));
}

/** Premier jour du mois suivant (borne haute exclusive, ISO). */
export function firstOfNextMonthIso(): string {
  const d = new Date();
  return isoDay(new Date(d.getFullYear(), d.getMonth() + 1, 1));
}

/** Une facture est-elle émise dans une fenêtre [from, to[ (jours ISO) ? */
export function invoiceInWindow(inv: Invoice, from: string, to: string): boolean {
  const day = inv.issuedAt.slice(0, 10);
  return day >= from && day < to;
}

/** Une facture est-elle en retard (échéance dépassée + solde > 0) ? */
export function invoiceOverdue(inv: Invoice): boolean {
  if (!inv.dueAt) return false;
  if (inv.balanceDA <= 0) return false;
  if (inv.status === "void" || inv.status === "refunded") return false;
  return inv.dueAt.slice(0, 10) < todayIso();
}

/** Nombre de jours entre aujourd'hui et l'échéance (négatif si dépassée). */
export function daysUntilDue(inv: Invoice): number | null {
  if (!inv.dueAt) return null;
  const due = new Date(inv.dueAt.slice(0, 10)).getTime();
  const today = new Date(todayIso()).getTime();
  return Math.round((due - today) / 86_400_000);
}

/** Tri par date d'émission décroissante (puis ref pour stabilité). */
export function byIssuedDesc(a: Invoice, b: Invoice): number {
  return b.issuedAt.localeCompare(a.issuedAt) || b.ref.localeCompare(a.ref);
}

/** Tri par date de paiement décroissante. */
export function byReceivedDesc(
  a: Pick<Payment, "receivedAt">,
  b: Pick<Payment, "receivedAt">,
): number {
  return b.receivedAt.localeCompare(a.receivedAt);
}

/** Tri par date d'ajout décroissante (items). */
export function byAddedDesc(
  a: Pick<InvoiceItem, "addedAt">,
  b: Pick<InvoiceItem, "addedAt">,
): number {
  return b.addedAt.localeCompare(a.addedAt);
}

/** Une chaîne ISO tombe-t-elle aujourd'hui (même jour local) ? */
export function isToday(iso: string): boolean {
  return iso.slice(0, 10) === todayIso();
}
