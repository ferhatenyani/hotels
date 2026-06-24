// Shared types for the booking funnel. The funnel is URL-driven (search params)
// so refresh, back, and link-sharing all work without a backend or storage.

export type BookingQuery = {
  checkIn?: Date;
  checkOut?: Date;
  adults: number;
  children: number;
  /** Pre-selected room (e.g. coming from /rooms/[slug] "Book this room"). */
  roomSlug?: string;
  /** Promo code applied from /offers or a marketing link. */
  promo?: string;
};

export type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Estimated arrival time, free text — used to prep the desk. */
  arrivalTime?: string;
  /** Special requests, free text. */
  notes?: string;
  /** Required check-in acknowledgement (ID / marriage booklet for couples). */
  ackCheckInPolicy: boolean;
};

export type PaymentDetails = {
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardName: string;
  billingCountry: string;
};

/**
 * Snapshot persisted to localStorage when a (demo) booking is confirmed.
 * Includes everything /booking/confirmation/[ref] and /booking/lookup need
 * to render a completed reservation without contacting any backend.
 */
export type BookingSnapshot = {
  ref: string;
  createdAt: string;
  roomSlug: string;
  /** ISO date string (date-only YYYY-MM-DD or full ISO). */
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
  promo?: string;
  addOnIds: AddOn["id"][];
  total: number;
  guest: GuestDetails;
};

/** Add-ons that the review step can layer onto the room rate. */
export type AddOn = {
  id: "late-checkout" | "breakfast" | "airport-pickup" | "champagne";
  label: string;
  blurb: string;
  priceDA: number;
  /** Whether the add-on multiplies by nights (e.g. breakfast per night) or is a single fee. */
  perNight: boolean;
};

export const addOns: AddOn[] = [
  {
    id: "late-checkout",
    label: "Départ tardif (14:00)",
    blurb: "Départ tardif garanti à 14:00 le jour de votre départ.",
    priceDA: 2500,
    perNight: false,
  },
  {
    id: "breakfast",
    label: "Ajouter un petit-déjeuner complet",
    blurb: "Déjà inclus avec la plupart des chambres — supplément pour invités additionnels.",
    priceDA: 1800,
    perNight: true,
  },
  {
    id: "airport-pickup",
    label: "Transfert aéroport",
    blurb: "Un chauffeur vous attend à l'arrivée à l'aéroport.",
    priceDA: 3500,
    perNight: false,
  },
  {
    id: "champagne",
    label: "Fleurs d'accueil & bulles",
    blurb: "Une petite composition et une bouteille de pétillant en chambre à l'arrivée.",
    priceDA: 5500,
    perNight: false,
  },
];
