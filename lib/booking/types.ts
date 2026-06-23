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
    label: "Late check-out (14:00)",
    blurb: "Guaranteed late check-out at 14:00 on your departure day.",
    priceDA: 2500,
    perNight: false,
  },
  {
    id: "breakfast",
    label: "Add full breakfast",
    blurb: "Already included with most rooms — extra add-on for additional guests.",
    priceDA: 1800,
    perNight: true,
  },
  {
    id: "airport-pickup",
    label: "Airport pickup",
    blurb: "A driver waits at arrivals at Soummam–Abane Ramdane Airport.",
    priceDA: 3500,
    perNight: false,
  },
  {
    id: "champagne",
    label: "Welcome flowers & sparkling",
    blurb: "A small arrangement and a bottle of sparkling in the room on arrival.",
    priceDA: 5500,
    perNight: false,
  },
];
