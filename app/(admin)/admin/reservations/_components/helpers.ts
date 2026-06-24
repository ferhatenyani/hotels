// Helpers partagés au sein du domaine Réservations.
// Aucun import depuis d'autres domaines — utilitaires purs.

import type { Reservation } from "@/lib/admin/types";

/** Nombre de nuits entre check-in et check-out (au moins 1). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn).getTime();
  const outDate = new Date(checkOut).getTime();
  const diff = Math.round((outDate - inDate) / 86_400_000);
  return Math.max(1, diff);
}

/** Solde restant à percevoir sur une réservation. */
export function balanceDA(r: Pick<Reservation, "totalDA" | "paidDA">): number {
  return Math.max(0, r.totalDA - r.paidDA);
}

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

/** Date décalée de N jours. */
export function dayOffset(delta: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + delta);
  return d;
}

/** Le séjour d'une réservation chevauche-t-il une date donnée ? */
export function spansDate(r: Reservation, isoDate: string): boolean {
  return r.checkIn <= isoDate && r.checkOut > isoDate;
}

/** Le séjour d'une réservation chevauche-t-il une fenêtre [from, to[ ? */
export function overlapsWindow(r: Reservation, from: string, to: string): boolean {
  return r.checkOut > from && r.checkIn < to;
}

/** Tri par check-in croissant (puis ref pour stabilité). */
export function byCheckInAsc(a: Reservation, b: Reservation): number {
  return a.checkIn.localeCompare(b.checkIn) || a.ref.localeCompare(b.ref);
}
