// Pricing helpers — pure functions, no I/O. Used by /booking/review and
// /booking/payment to draw the price breakdown, and by the room cards to
// quote a quick total when dates are known.

import { differenceInCalendarDays } from "date-fns";

import { hotel } from "@/lib/data/hotel";
import type { Room } from "@/lib/data/rooms";
import type { AddOn, BookingQuery } from "./types";
import { getOfferByPromoCode } from "@/lib/data/offers";

export type PriceBreakdown = {
  nights: number;
  guests: number;
  /** Nightly room rate × nights. */
  roomSubtotal: number;
  /** Tourism tax: 300 DA × guests × nights. */
  tourismTax: number;
  /** Sum of selected add-ons (per-night ones already multiplied). */
  addOnsTotal: number;
  /** Promo discount as a positive number (subtracted from total). */
  discount: number;
  /** Promo label to display next to the discount line, if any. */
  promoLabel?: string;
  /** Final total payable. */
  total: number;
};

/**
 * Promo math is illustrative — the codes set by /lib/data/offers are mapped
 * here to simple discount rules so the price breakdown reads end-to-end. No
 * real discount engine.
 */
function discountFor(
  promoCode: string | undefined,
  roomSubtotal: number,
): { discount: number; label?: string } {
  if (!promoCode) return { discount: 0 };
  const offer = getOfferByPromoCode(promoCode);
  if (!offer) return { discount: 0 };

  switch (offer.promoCode.toUpperCase()) {
    case "WEEK3":
      // « 3e nuit offerte » — approximée comme -1/3 si 3 nuits ou plus sont
      // réservées. Sinon pas de remise (l'offre exige la 3e nuit).
      return {
        discount: Math.round(roomSubtotal * (1 / 3)),
        label: `${offer.name} · 3e nuit offerte`,
      };
    case "WORKWEEK10":
      return {
        discount: Math.round(roomSubtotal * 0.1),
        label: `${offer.name} · -10 % semaine`,
      };
    case "MARIAGE10":
      return {
        discount: Math.round(roomSubtotal * 0.1),
        label: `${offer.name} · tarif groupe`,
      };
    case "FAMILLE15":
      // Le tarif famille est « -15 % sur la 2e chambre » — pour cet exemple à
      // une seule chambre, on applique -8 % pour garder le calcul lisible.
      return {
        discount: Math.round(roomSubtotal * 0.08),
        label: `${offer.name} · -15 % sur la seconde chambre`,
      };
    default:
      return { discount: 0 };
  }
}

export function computeBreakdown(
  room: Room,
  query: BookingQuery,
  selectedAddOns: AddOn[] = [],
): PriceBreakdown {
  const guests = query.adults + query.children;
  const nights =
    query.checkIn && query.checkOut
      ? Math.max(1, differenceInCalendarDays(query.checkOut, query.checkIn))
      : 1;

  const roomSubtotal = room.priceDA * nights;
  const tourismTax = hotel.tourismTaxDA * guests * nights;
  const addOnsTotal = selectedAddOns.reduce(
    (sum, a) => sum + (a.perNight ? a.priceDA * nights : a.priceDA),
    0,
  );
  const { discount, label } = discountFor(query.promo, roomSubtotal);

  return {
    nights,
    guests,
    roomSubtotal,
    tourismTax,
    addOnsTotal,
    discount,
    promoLabel: label,
    total: roomSubtotal + tourismTax + addOnsTotal - discount,
  };
}

/** Construit une référence de réservation courte, par ex. RES-2026-7F3A1. */
export function makeBookingRef(): string {
  const year = new Date().getFullYear();
  const code = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `RES-${year}-${code}`;
}
