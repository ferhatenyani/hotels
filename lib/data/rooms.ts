// Source unique de vérité pour le catalogue des chambres. Prix en DA. Les
// tailles et caractéristiques par chambre sont génériques pour cette démo.
// Le slug et la galerie permettent à /rooms/[slug] de pointer en lien profond
// et d'afficher plusieurs images par chambre sans casser l'existant.

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
  /** Court slogan utilisé sur les cartes (1 ligne). */
  tagline: string;
  /** Description longue pour /rooms/[slug]. 2–4 phrases, voix de la marque. */
  description: string;
  /** Court résumé utilisé sur la carte de listing (motif existant Rooms.tsx). */
  cardDescription: string;
  sleeps: number;
  /** Chaîne d'affichage de la taille sur les cartes (« 52 m² » ou « Vue panoramique »). */
  sizeDisplay: string;
  /** Surface réelle quand connue, pour le filtrage. null si non publié. */
  sqm: number | null;
  /** Prix par nuit en DA. */
  priceDA: number;
  beds: { type: RoomBedType; count: number }[];
  /** Image principale utilisée sur les cartes. */
  cover: string;
  coverAlt: string;
  /** Images supplémentaires pour la galerie de la page détail. */
  gallery: { src: string; alt: string }[];
  features: RoomFeature[];
  /** À qui cette chambre convient le mieux — affiché sur la page détail. */
  bestFor: string[];
  /** Mis en avant sur le Rooms.tsx de la page d'accueil (mise en page héritée à 3 cartes). */
  featured: boolean;
};

export const rooms: Room[] = [
  {
    slug: "suite-senior",
    name: "Suite Senior",
    tagline: "Cinquante-deux mètres carrés de calme, avec vue panoramique.",
    cardDescription:
      "Cinquante-deux mètres carrés de calme — un coin salon, un dressing et une large baie ouverte sur le paysage.",
    description:
      "Une suite qui prend son temps. Un coin salon face à la vue, un dressing qui longe l'entrée et une large fenêtre panoramique. Réveillez-vous face au paysage, travaillez au bureau, revenez de la ville dans une chambre qui apaise.",
    sleeps: 2,
    sizeDisplay: "52 m²",
    sqm: 52,
    priceDA: 12500,
    beds: [{ type: "queen", count: 1 }],
    cover: "/images/exhibit-corner-suite.jpg",
    coverAlt: "Le coin salon de la Suite Senior, ouvert sur la vue",
    gallery: [
      {
        src: "/images/exhibit-corner-suite.jpg",
        alt: "Le coin salon de la Suite Senior",
      },
      {
        src: "/images/exhibit-suite-dawn.jpg",
        alt: "Lumière du matin depuis la fenêtre de la suite",
      },
      {
        src: "/images/exhibit-guest-room.jpg",
        alt: "La chambre de la Suite Senior",
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
    bestFor: ["Couples", "Voyage d'affaires avec espace supplémentaire", "Un long week-end"],
    featured: true,
  },
  {
    slug: "chambre-double-vue",
    name: "Chambre Double — Vue Panoramique",
    tagline: "Le confort quotidien que nos hôtes reviennent chercher.",
    cardDescription:
      "Une chambre lumineuse et moderne avec un coin salon et une douche à l'italienne, vue panoramique — le confort quotidien que nos hôtes reviennent chercher.",
    description:
      "Une chambre moderne qui fait bien les choses simples. Un coin salon lumineux, une douche à l'italienne et la vue à la fenêtre. Pensée pour une ou deux personnes — la chambre que nos habitués demandent par son nom, pour les affaires ou pour une escapade en ville.",
    sleeps: 2,
    sizeDisplay: "Vue panoramique",
    sqm: null,
    priceDA: 8300,
    beds: [{ type: "double", count: 1 }],
    cover: "/images/exhibit-guest-room.jpg",
    coverAlt: "Une Chambre Double avec vue panoramique",
    gallery: [
      {
        src: "/images/exhibit-guest-room.jpg",
        alt: "À l'intérieur de la Chambre Double",
      },
      {
        src: "/images/exhibit-suite-dawn.jpg",
        alt: "Vue depuis la Chambre Double",
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
    bestFor: ["Couples", "Voyage d'affaires", "Court séjour en ville"],
    featured: true,
  },
  {
    slug: "appartement",
    name: "Appartement",
    tagline: "Cent deux mètres carrés, au-dessus de l'horizon.",
    cardDescription:
      "Notre plus grand espace — cent deux mètres carrés, avec une baignoire complète et de la place pour toute la famille.",
    description:
      "Notre plus grand espace — cent deux mètres carrés disposés comme un petit appartement. Une baignoire complète, un séjour généreux, de la place pour la famille et une vue qui accompagne la journée. Idéal quand vous voulez de l'espace sans quitter le centre-ville.",
    sleeps: 4,
    sizeDisplay: "102 m²",
    sqm: 102,
    priceDA: 15500,
    beds: [
      { type: "queen", count: 1 },
      { type: "single", count: 2 },
    ],
    cover: "/images/exhibit-suite-dawn.jpg",
    coverAlt: "L'Appartement à l'aube, ouvert sur le paysage",
    gallery: [
      {
        src: "/images/exhibit-suite-dawn.jpg",
        alt: "L'Appartement à l'aube",
      },
      {
        src: "/images/exhibit-corner-suite.jpg",
        alt: "Espace de vie de l'Appartement",
      },
      {
        src: "/images/exhibit-guest-room.jpg",
        alt: "Chambre de l'Appartement",
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
    bestFor: ["Familles", "Séjours longs", "Deux couples partageant"],
    featured: true,
  },
  {
    slug: "chambre-single",
    name: "Chambre Single",
    tagline: "Une chambre individuelle avec la même belle vue.",
    cardDescription:
      "Une chambre individuelle, calme et bien équipée, avec la même vue que le reste de la maison.",
    description:
      "Le voyage en solo, simplement. Un lit simple, un bureau tranquille et la même belle vue panoramique — sans compromis sur la part de la chambre que l'on vit vraiment.",
    sleeps: 1,
    sizeDisplay: "Vue panoramique",
    sqm: null,
    priceDA: 7300,
    beds: [{ type: "single", count: 1 }],
    cover: "/images/exhibit-guest-room.jpg",
    coverAlt: "Une chambre individuelle avec vue",
    gallery: [
      { src: "/images/exhibit-guest-room.jpg", alt: "La chambre individuelle" },
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
    bestFor: ["Voyage en solo", "Affaires en semaine"],
    featured: false,
  },
  {
    slug: "chambre-twin",
    name: "Chambre Twin",
    tagline: "Deux lits, la même vue.",
    cardDescription:
      "Deux lits simples, un coin salon partagé et une large fenêtre — pour amis, collègues ou frères et sœurs.",
    description:
      "Deux lits simples dans une chambre lumineuse ouverte sur la vue. Un coin salon partagé facilite la conversation en fin de journée ; l'agencement convient aussi bien à un ami, un collègue qu'à un frère ou une sœur.",
    sleeps: 2,
    sizeDisplay: "Twin · vue panoramique",
    sqm: null,
    priceDA: 8300,
    beds: [{ type: "single", count: 2 }],
    cover: "/images/exhibit-guest-room.jpg",
    coverAlt: "Une chambre twin avec deux lits simples et une vue panoramique",
    gallery: [
      { src: "/images/exhibit-guest-room.jpg", alt: "La chambre twin" },
      {
        src: "/images/exhibit-corner-suite.jpg",
        alt: "Coin salon de la chambre twin",
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
    bestFor: ["Amis", "Collègues qui partagent", "Frères et sœurs"],
    featured: false,
  },
  {
    slug: "chambre-familiale",
    name: "Chambre Familiale",
    tagline: "Une chambre familiale avec vue.",
    cardDescription:
      "Trois lits simples, des équipements adaptés à la famille et la même belle vue — pour une famille qui veut rester ensemble.",
    description:
      "Une chambre de taille familiale avec trois lits simples, conçue pour la famille qui veut rester dans un même espace. La salle de bain est complète, la penderie généreuse et la vue est celle pour laquelle tout l'hôtel est connu.",
    sleeps: 3,
    sizeDisplay: "Familiale · vue panoramique",
    sqm: null,
    priceDA: 9300,
    beds: [{ type: "single", count: 3 }],
    cover: "/images/exhibit-guest-room.jpg",
    coverAlt: "Une chambre familiale avec trois lits simples",
    gallery: [
      { src: "/images/exhibit-guest-room.jpg", alt: "La chambre familiale" },
      {
        src: "/images/exhibit-corner-suite.jpg",
        alt: "Espace salon de la chambre familiale",
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
    bestFor: ["Familles avec un enfant", "Trois voyageurs"],
    featured: false,
  },
];

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find((r) => r.slug === slug);
}

export function getFeaturedRooms(): Room[] {
  return rooms.filter((r) => r.featured);
}

/** Trouve les chambres pouvant accueillir la composition demandée. */
export function getRoomsForParty(
  adults: number,
  children: number,
): Room[] {
  const total = adults + children;
  return rooms.filter((r) => r.sleeps >= total);
}

export const featureLabels: Record<RoomFeature, string> = {
  "lake-view": "Vue panoramique",
  "gouraya-view": "Vue sur le parc",
  wifi: "Wi-Fi gratuit",
  ac: "Climatisation",
  tv: "Télévision écran plat",
  safe: "Coffre-fort",
  desk: "Bureau",
  dressing: "Dressing",
  "walk-in-shower": "Douche à l'italienne",
  bathtub: "Baignoire",
  hairdryer: "Sèche-cheveux",
  bathrobe: "Peignoir",
  "minibar-water": "Eau minérale gratuite",
  "lounge-corner": "Coin salon",
  "non-smoking": "Non-fumeur",
  "family-friendly": "Adapté aux familles",
};
