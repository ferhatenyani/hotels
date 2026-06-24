// Helpers locaux pour le domaine Clients. Ne réinvente pas ce qui existe
// déjà dans `lib/admin/*` — utilise simplement ces utilitaires pour les
// quelques calculs propres à l'écran (dernière visite, tone fidélité…).

import type { Tone } from "@/components/admin/tone";
import type { Guest, LoyaltyTier, Reservation } from "@/lib/admin/types";

export function loyaltyTone(tier?: LoyaltyTier | null): Tone | null {
  if (!tier) return null;
  if (tier === "or" || tier === "platine") return "ok";
  return "muted";
}

/** Dernière date de séjour terminée ("checked-out") pour un client. */
export function lastVisitDate(
  guestId: string,
  reservations: Reservation[],
): string | undefined {
  const closed = reservations
    .filter((r) => r.guestId === guestId && r.status === "checked-out")
    .map((r) => r.checkOut)
    .sort();
  return closed.length > 0 ? closed[closed.length - 1] : undefined;
}

/** Renvoie « DD MMM » ou « —» selon la disponibilité. Compte clients créés ce mois. */
export function isCreatedThisMonth(guest: Guest): boolean {
  const created = new Date(guest.createdAt);
  const now = new Date();
  return (
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth()
  );
}
