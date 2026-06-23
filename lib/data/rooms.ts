// Single source of truth for the room catalogue. Prices in DA. Sizes and
// per-room features come from the demo content pack (HOTEL-DU-LAC-DEMO-CONTENT.md).
// Adding `slug` and `gallery` so /rooms/[slug] can deep-link and show more than
// one image per room without changing existing usages.

export type RoomBedType = "single" | "double" | "twin" | "triple" | "queen";

export type RoomFeature =
  | "lake-view"
  | "gouraya-view"
  | "wifi"
  | "ac"
  | "tv"
  | "safe"
  | "desk"
  | "dressing"
  | "walk-in-shower"
  | "bathtub"
  | "hairdryer"
  | "bathrobe"
  | "minibar-water"
  | "lounge-corner"
  | "non-smoking"
  | "family-friendly";

export type Room = {
  slug: string;
  name: string;
  /** Short tagline used on cards (1 line). */
  tagline: string;
  /** Long description for /rooms/[slug]. 2–4 sentences, brand voice. */
  description: string;
  /** Short blurb used on the listing card (existing Rooms.tsx pattern). */
  cardDescription: string;
  sleeps: number;
  /** Display string for the size column on cards ("52 m²" or "Lake view"). */
  sizeDisplay: string;
  /** Actual sqm when known, for filtering. null when not published. */
  sqm: number | null;
  /** Nightly price in DA. */
  priceDA: number;
  beds: { type: RoomBedType; count: number }[];
  /** Lead image used on cards. */
  cover: string;
  coverAlt: string;
  /** Extra images for the detail page gallery. */
  gallery: { src: string; alt: string }[];
  features: RoomFeature[];
  /** What the room is best for — surfaces on the detail page. */
  bestFor: string[];
  /** Featured on the home page Rooms.tsx (legacy 3-card layout). */
  featured: boolean;
};

export const rooms: Room[] = [
  {
    slug: "suite-senior",
    name: "Suite Senior",
    tagline: "Fifty-two square metres of calm, above the lake.",
    cardDescription:
      "Fifty-two square metres of calm — a living corner, a dressing room, and a wide window over Lac Mézaïa and Gouraya.",
    description:
      "A suite that takes its time. A living corner faces the lake, a dressing room runs the length of the entry, and a wide picture window holds Yemma Gouraya at the green edge of Béjaïa. Wake to the water, work from the desk, return from the city to a room that quietly resets.",
    sleeps: 2,
    sizeDisplay: "52 m²",
    sqm: 52,
    priceDA: 12500,
    beds: [{ type: "queen", count: 1 }],
    cover: "/images/exhibit-corner-suite.jpg",
    coverAlt: "The Suite Senior's living corner, overlooking the lake",
    gallery: [
      {
        src: "/images/exhibit-corner-suite.jpg",
        alt: "The Suite Senior's living corner",
      },
      {
        src: "/images/exhibit-suite-dawn.jpg",
        alt: "Morning light over the lake from the suite window",
      },
      {
        src: "/images/exhibit-guest-room.jpg",
        alt: "The Suite Senior's bedroom",
      },
    ],
    features: [
      "lake-view",
      "gouraya-view",
      "lounge-corner",
      "dressing",
      "wifi",
      "ac",
      "tv",
      "safe",
      "desk",
      "walk-in-shower",
      "hairdryer",
      "bathrobe",
      "minibar-water",
      "non-smoking",
    ],
    bestFor: ["Couples", "Business with extra space", "A long weekend"],
    featured: true,
  },
  {
    slug: "chambre-double-vue-lac",
    name: "Chambre Double — Vue Lac",
    tagline: "The everyday comfort guests come back for.",
    cardDescription:
      "A bright, modern room with a lounge corner and a walk-in shower, the lake at the window — the everyday comfort guests come back for.",
    description:
      "A modern room that does the simple things well. A bright lounge corner, a walk-in shower, and the lake at the window. Built for one or two — the room our regulars ask for by name, for business or a quiet city break.",
    sleeps: 2,
    sizeDisplay: "Lake view",
    sqm: null,
    priceDA: 8300,
    beds: [{ type: "double", count: 1 }],
    cover: "/images/exhibit-guest-room.jpg",
    coverAlt: "A Chambre Double with a view of Lac Mézaïa",
    gallery: [
      {
        src: "/images/exhibit-guest-room.jpg",
        alt: "Inside the Chambre Double",
      },
      {
        src: "/images/exhibit-suite-dawn.jpg",
        alt: "Lake view from the Chambre Double",
      },
    ],
    features: [
      "lake-view",
      "gouraya-view",
      "lounge-corner",
      "wifi",
      "ac",
      "tv",
      "safe",
      "desk",
      "walk-in-shower",
      "hairdryer",
      "bathrobe",
      "minibar-water",
      "non-smoking",
    ],
    bestFor: ["Couples", "Business travel", "A short city stay"],
    featured: true,
  },
  {
    slug: "appartement",
    name: "Appartement",
    tagline: "One hundred and two square metres, above the water.",
    cardDescription:
      "Our largest space — one hundred and two square metres, with a full bathtub and room for the whole family, above the water.",
    description:
      "Our largest space — a hundred and two square metres laid out like a small apartment. A full bathtub, a generous sitting area, room for the family, and the lake on three sides of the day. Best when you want space without leaving the centre of the city.",
    sleeps: 4,
    sizeDisplay: "102 m²",
    sqm: 102,
    priceDA: 15500,
    beds: [
      { type: "queen", count: 1 },
      { type: "single", count: 2 },
    ],
    cover: "/images/exhibit-suite-dawn.jpg",
    coverAlt: "The Appartement at dawn, above the water",
    gallery: [
      {
        src: "/images/exhibit-suite-dawn.jpg",
        alt: "The Appartement at dawn",
      },
      {
        src: "/images/exhibit-corner-suite.jpg",
        alt: "Living area of the Appartement",
      },
      {
        src: "/images/exhibit-guest-room.jpg",
        alt: "Bedroom of the Appartement",
      },
    ],
    features: [
      "lake-view",
      "gouraya-view",
      "lounge-corner",
      "bathtub",
      "dressing",
      "wifi",
      "ac",
      "tv",
      "safe",
      "desk",
      "hairdryer",
      "bathrobe",
      "minibar-water",
      "family-friendly",
      "non-smoking",
    ],
    bestFor: ["Families", "Longer stays", "Two couples sharing"],
    featured: true,
  },
  {
    slug: "chambre-single",
    name: "Chambre Single",
    tagline: "A single room with the same lake at the window.",
    cardDescription:
      "A single room, calm and well-appointed, with the same view of Lac Mézaïa as the rest of the house.",
    description:
      "Solo travel made simple. A single bed, a quiet desk, and the same wide view of Lac Mézaïa and Gouraya — no compromise on the part of the room you actually live in.",
    sleeps: 1,
    sizeDisplay: "Lake view",
    sqm: null,
    priceDA: 7300,
    beds: [{ type: "single", count: 1 }],
    cover: "/images/exhibit-guest-room.jpg",
    coverAlt: "A single room with a lake view",
    gallery: [
      { src: "/images/exhibit-guest-room.jpg", alt: "The single room" },
    ],
    features: [
      "lake-view",
      "gouraya-view",
      "wifi",
      "ac",
      "tv",
      "safe",
      "desk",
      "walk-in-shower",
      "hairdryer",
      "minibar-water",
      "non-smoking",
    ],
    bestFor: ["Solo travel", "Business midweek"],
    featured: false,
  },
  {
    slug: "chambre-twin",
    name: "Chambre Twin",
    tagline: "Two beds, the same lake.",
    cardDescription:
      "Two singles, a shared lounge corner, and a wide window over the water — for friends, colleagues or siblings.",
    description:
      "Twin singles in a bright room that opens to the lake. A shared lounge corner makes it easy to talk at the end of the day; the layout works whether you're travelling with a friend, a colleague or a sibling.",
    sleeps: 2,
    sizeDisplay: "Twin · lake view",
    sqm: null,
    priceDA: 8300,
    beds: [{ type: "single", count: 2 }],
    cover: "/images/exhibit-guest-room.jpg",
    coverAlt: "A twin room with two singles and a lake view",
    gallery: [
      { src: "/images/exhibit-guest-room.jpg", alt: "The twin room" },
      {
        src: "/images/exhibit-corner-suite.jpg",
        alt: "Lounge corner of the twin room",
      },
    ],
    features: [
      "lake-view",
      "gouraya-view",
      "lounge-corner",
      "wifi",
      "ac",
      "tv",
      "safe",
      "desk",
      "walk-in-shower",
      "hairdryer",
      "minibar-water",
      "non-smoking",
    ],
    bestFor: ["Friends", "Colleagues sharing", "Siblings"],
    featured: false,
  },
  {
    slug: "chambre-familiale",
    name: "Chambre Familiale",
    tagline: "A family room over the lake.",
    cardDescription:
      "Three singles, family-friendly amenities, and the same view of Lac Mézaïa and Gouraya — for a family that wants to stay together.",
    description:
      "A family-sized room with three singles, designed for the family that wants to stay in one space. The bathroom is full-featured, the wardrobe is generous, and the view is the one the whole hotel is known for.",
    sleeps: 3,
    sizeDisplay: "Family · lake view",
    sqm: null,
    priceDA: 9300,
    beds: [{ type: "single", count: 3 }],
    cover: "/images/exhibit-guest-room.jpg",
    coverAlt: "A family room with three singles",
    gallery: [
      { src: "/images/exhibit-guest-room.jpg", alt: "The family room" },
      {
        src: "/images/exhibit-corner-suite.jpg",
        alt: "Family room sitting area",
      },
    ],
    features: [
      "lake-view",
      "gouraya-view",
      "wifi",
      "ac",
      "tv",
      "safe",
      "desk",
      "walk-in-shower",
      "hairdryer",
      "minibar-water",
      "family-friendly",
      "non-smoking",
    ],
    bestFor: ["Families with one child", "Three travellers"],
    featured: false,
  },
];

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find((r) => r.slug === slug);
}

export function getFeaturedRooms(): Room[] {
  return rooms.filter((r) => r.featured);
}

/** Find rooms that can sleep the requested party. */
export function getRoomsForParty(
  adults: number,
  children: number,
): Room[] {
  const total = adults + children;
  return rooms.filter((r) => r.sleeps >= total);
}

export const featureLabels: Record<RoomFeature, string> = {
  "lake-view": "Lac Mézaïa view",
  "gouraya-view": "Yemma Gouraya view",
  wifi: "Free Wi-Fi",
  ac: "Air conditioning",
  tv: "Flat-screen TV",
  safe: "In-room safe",
  desk: "Desk",
  dressing: "Dressing area",
  "walk-in-shower": "Walk-in shower",
  bathtub: "Bathtub",
  hairdryer: "Hair dryer",
  bathrobe: "Bathrobe",
  "minibar-water": "Free mineral water",
  "lounge-corner": "Lounge corner",
  "non-smoking": "Non-smoking",
  "family-friendly": "Family-friendly",
};
