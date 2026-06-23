// Seasonal packages. Each offer carries a `promoCode` that the booking funnel
// can read from the URL (?promo=…) and surface in the price breakdown — no
// real discount engine, but the UI shows the intent end-to-end.

export type Offer = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Plain-language perks shown as a bullet list. */
  perks: string[];
  /** Indicative discount label used on the card — e.g. "Save 15%" or "20% off + late check-out". */
  discountLabel: string;
  /** Code submitted to /booking/search?promo=…  */
  promoCode: string;
  /** Stay constraints surfaced as small print on the card. */
  conditions: string[];
  /** When the offer is best — for the seasonal hint chip. */
  seasonHint: string;
  /** Lead image. */
  image: string;
  imageAlt: string;
  /** Cross-link target for the secondary CTA, if any. */
  related?: { label: string; href: string };
};

export const offers: Offer[] = [
  {
    slug: "long-weekend-on-the-lake",
    name: "A Long Weekend on the Lake",
    tagline: "Three nights, the second at our cost.",
    description:
      "Stay three nights in a lake-view room — pay for two, plus a late check-out and a welcome breakfast in the room when you arrive.",
    perks: [
      "Third night included",
      "Late check-out (14:00)",
      "Welcome breakfast in the room",
      "A bottle of local water and fruit on arrival",
    ],
    discountLabel: "33% off · 3rd night free",
    promoCode: "LAKE3",
    conditions: [
      "Minimum 3 consecutive nights",
      "Friday or Saturday arrival",
      "Selected lake-view rooms only",
    ],
    seasonHint: "Year-round",
    image: "/images/exhibit-suite-dawn.jpg",
    imageAlt: "A lake-view suite at dawn",
    related: { label: "Browse rooms", href: "/rooms" },
  },
  {
    slug: "family-stay",
    name: "Family Stay",
    tagline: "Two adjoining rooms, breakfast for everyone.",
    description:
      "Book two rooms together at a reduced rate — for parents and children, two couples or a small family group.",
    perks: [
      "15% off the second room",
      "Breakfast included for all",
      "Family check-in: skip the front-desk queue",
      "Children's amenities on arrival",
    ],
    discountLabel: "15% off the 2nd room",
    promoCode: "FAMILY15",
    conditions: [
      "Two rooms booked under one name",
      "Subject to adjoining-room availability",
    ],
    seasonHint: "School holidays",
    image: "/images/exhibit-corner-suite.jpg",
    imageAlt: "A family-sized suite",
    related: { label: "See family rooms", href: "/rooms" },
  },
  {
    slug: "business-midweek",
    name: "Business Midweek",
    tagline: "Sunday-to-Thursday, with everything you need to work.",
    description:
      "A flat midweek rate for two or more nights between Sunday and Thursday — Wi-Fi, parking, breakfast and a quiet desk, all in.",
    perks: [
      "Free private parking",
      "Breakfast included",
      "Late check-out (13:00) if available",
      "Express laundry on request",
    ],
    discountLabel: "10% off · midweek flat rate",
    promoCode: "WORKWEEK10",
    conditions: [
      "Sun, Mon, Tue, Wed, Thu nights only",
      "Minimum 2 nights",
    ],
    seasonHint: "Year-round",
    image: "/images/exhibit-guest-room.jpg",
    imageAlt: "A quiet desk in a lake-view room",
    related: { label: "Plan a meeting", href: "/events" },
  },
  {
    slug: "wedding-party-block",
    name: "Wedding Party Block",
    tagline: "Hold a row of rooms for your guests.",
    description:
      "Planning a wedding in the 498 m² hall? Block 10+ rooms for your guests at a reduced rate — we'll set up a private check-in and a welcome note in each room.",
    perks: [
      "Rooms held under one master booking",
      "Private check-in for the wedding party",
      "Welcome note in each room",
      "Special breakfast hours for late risers",
    ],
    discountLabel: "Group rate · 10+ rooms",
    promoCode: "WEDDING10",
    conditions: [
      "Group booking of 10+ rooms",
      "Linked to an event in the 498 m² hall",
    ],
    seasonHint: "Wedding season",
    image: "/images/exhibit-salon.jpg",
    imageAlt: "The 498 m² hall dressed for a wedding",
    related: { label: "Talk to events", href: "/events" },
  },
];

export function getOfferBySlug(slug: string): Offer | undefined {
  return offers.find((o) => o.slug === slug);
}

export function getOfferByPromoCode(code: string): Offer | undefined {
  const normalized = code.trim().toUpperCase();
  return offers.find((o) => o.promoCode.toUpperCase() === normalized);
}
