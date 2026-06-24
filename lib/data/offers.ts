// Offres saisonnières. Chaque offre porte un `promoCode` que l'entonnoir de
// réservation peut lire depuis l'URL (?promo=…) et afficher dans le détail
// de prix — pas de vrai moteur de remise, mais l'UI montre l'intention.

export type Offer = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Avantages en langage simple, affichés en liste. */
  perks: string[];
  /** Étiquette de remise indicative sur la carte — ex. « -15 % » ou « 20 % + check-out tardif ». */
  discountLabel: string;
  /** Code soumis à /booking/search?promo=…  */
  promoCode: string;
  /** Conditions de séjour affichées en petits caractères sur la carte. */
  conditions: string[];
  /** Quand l'offre est la plus pertinente — pour le badge de saison. */
  seasonHint: string;
  /** Image principale. */
  image: string;
  imageAlt: string;
  /** Cible de lien croisé pour le CTA secondaire, le cas échéant. */
  related?: { label: string; href: string };
};

export const offers: Offer[] = [
  {
    slug: "long-week-end",
    name: "Un Long Week-end",
    tagline: "Trois nuits, la seconde à nos frais.",
    description:
      "Séjournez trois nuits dans une chambre avec vue — payez-en deux, plus un check-out tardif et un petit-déjeuner d'accueil servi en chambre à votre arrivée.",
    perks: [
      "Troisième nuit incluse",
      "Check-out tardif (14:00)",
      "Petit-déjeuner d'accueil en chambre",
      "Une bouteille d'eau locale et des fruits à l'arrivée",
    ],
    discountLabel: "-33 % · 3e nuit offerte",
    promoCode: "WEEK3",
    conditions: [
      "Minimum 3 nuits consécutives",
      "Arrivée vendredi ou samedi",
      "Chambres avec vue sélectionnées uniquement",
    ],
    seasonHint: "Toute l'année",
    image: "/images/exhibit-suite-dawn.jpg",
    imageAlt: "Une suite avec vue à l'aube",
    related: { label: "Voir les chambres", href: "/rooms" },
  },
  {
    slug: "sejour-famille",
    name: "Séjour en Famille",
    tagline: "Deux chambres communicantes, le petit-déjeuner pour tous.",
    description:
      "Réservez deux chambres ensemble à un tarif réduit — pour parents et enfants, deux couples ou un petit groupe familial.",
    perks: [
      "-15 % sur la seconde chambre",
      "Petit-déjeuner inclus pour tous",
      "Check-in famille : évitez la file d'attente",
      "Équipements pour enfants à l'arrivée",
    ],
    discountLabel: "-15 % sur la 2e chambre",
    promoCode: "FAMILLE15",
    conditions: [
      "Deux chambres réservées au même nom",
      "Sous réserve de chambres communicantes disponibles",
    ],
    seasonHint: "Vacances scolaires",
    image: "/images/exhibit-corner-suite.jpg",
    imageAlt: "Une suite familiale",
    related: { label: "Voir les chambres familiales", href: "/rooms" },
  },
  {
    slug: "affaires-semaine",
    name: "Affaires en Semaine",
    tagline: "Du dimanche au jeudi, avec tout ce qu'il faut pour travailler.",
    description:
      "Un tarif unique en semaine pour deux nuits ou plus entre dimanche et jeudi — Wi-Fi, parking, petit-déjeuner et un bureau tranquille, tout inclus.",
    perks: [
      "Parking privé gratuit",
      "Petit-déjeuner inclus",
      "Check-out tardif (13:00) si disponible",
      "Blanchisserie express sur demande",
    ],
    discountLabel: "-10 % · tarif fixe semaine",
    promoCode: "WORKWEEK10",
    conditions: [
      "Nuits du dim, lun, mar, mer, jeu uniquement",
      "Minimum 2 nuits",
    ],
    seasonHint: "Toute l'année",
    image: "/images/exhibit-guest-room.jpg",
    imageAlt: "Un bureau tranquille dans une chambre avec vue",
    related: { label: "Organiser une réunion", href: "/events" },
  },
  {
    slug: "pack-mariage",
    name: "Pack Mariage",
    tagline: "Bloquez une rangée de chambres pour vos invités.",
    description:
      "Vous organisez un mariage dans la salle de 498 m² ? Bloquez 10 chambres ou plus pour vos invités à tarif réduit — nous organisons un check-in privé et un mot de bienvenue dans chaque chambre.",
    perks: [
      "Chambres bloquées sous une seule réservation principale",
      "Check-in privé pour les invités du mariage",
      "Mot de bienvenue dans chaque chambre",
      "Horaires spéciaux du petit-déjeuner pour les lève-tard",
    ],
    discountLabel: "Tarif groupe · 10 chambres ou plus",
    promoCode: "MARIAGE10",
    conditions: [
      "Réservation groupée de 10 chambres ou plus",
      "Liée à un événement dans la salle de 498 m²",
    ],
    seasonHint: "Saison des mariages",
    image: "/images/exhibit-salon.jpg",
    imageAlt: "La salle de 498 m² habillée pour un mariage",
    related: { label: "Parler à l'équipe événements", href: "/events" },
  },
];

export function getOfferBySlug(slug: string): Offer | undefined {
  return offers.find((o) => o.slug === slug);
}

export function getOfferByPromoCode(code: string): Offer | undefined {
  const normalized = code.trim().toUpperCase();
  return offers.find((o) => o.promoCode.toUpperCase() === normalized);
}
