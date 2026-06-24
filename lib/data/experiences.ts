// « Découvrir la région » — recommandations du concierge, PAS des excursions
// payantes de l'hôtel. Présentées comme suggestions locales, jamais tarifées.

export type Experience = {
  slug: string;
  name: string;
  /** Phrase essentielle en une ligne utilisée sur les cartes. */
  tagline: string;
  /** Forme longue (1–2 phrases) utilisée sur la rangée détail. */
  description: string;
  /** « En voiture · ~15 min », « Au pas de la porte », « Demi-journée », « En ville » — temps de trajet, pas durée payante. */
  travelTime: string;
  /** Catégorie pour le filtrage / regroupement. */
  category: "Nature" | "Patrimoine" | "Côte" | "À l'hôtel";
  /** Image locale. */
  image: string;
  imageAlt: string;
};

export const experiences: Experience[] = [
  {
    slug: "parc-national",
    name: "Parc National",
    tagline: "Pentes boisées, vues sur la mer et un sommet panoramique au-dessus de la baie.",
    description:
      "Un parc montagneux protégé qui s'élève juste derrière la ville — forêts, balades panoramiques sur la crête et un point de vue célèbre sur toute la baie.",
    travelTime: "En voiture · ~15 min",
    category: "Nature",
    image: "/images/activity-cliff-path.jpg",
    imageAlt: "Un sentier dans le parc national",
  },
  {
    slug: "phare-historique",
    name: "Phare Historique",
    tagline: "L'un des plus hauts phares de la Méditerranée, sur un cap spectaculaire.",
    description:
      "Une route le long de la corniche jusqu'à un phare en activité perché sur un cap abrupt. L'un des plus hauts de la Méditerranée, avec une large vue sur le golfe — à voir à l'heure douce avant le coucher du soleil.",
    travelTime: "Demi-journée",
    category: "Côte",
    image: "/images/activity-sunset-sailing.jpg",
    imageAlt: "Le cap près du phare",
  },
  {
    slug: "reserve-naturelle",
    name: "Réserve Naturelle",
    tagline: "Une zone humide protégée, riche en oiseaux et calme, juste devant l'hôtel.",
    description:
      "Notre pas de porte. Une étendue d'eau intérieure protégée et le chant des oiseaux, gardée discrètement au cœur de la ville — une courte promenade qui remet la journée à zéro. Apportez de bonnes chaussures et un appareil photo.",
    travelTime: "Au pas de la porte",
    category: "Nature",
    image: "/images/activity-garden-breakfast.jpg",
    imageAlt: "Verdure tranquille le long de la réserve",
  },
  {
    slug: "plages-corniche",
    name: "Plages de la Corniche",
    tagline: "Des criques et de longues plages le long de la route côtière.",
    description:
      "La corniche se déroule au nord de la ville — criques, longues courbes de sable et eau claire les jours calmes. Prenez la route côtière doucement ; les vues sont l'essentiel.",
    travelTime: "En voiture",
    category: "Côte",
    image: "/images/activity-sea-bathing.jpg",
    imageAlt: "Une crique le long de la corniche",
  },
  {
    slug: "vieille-ville",
    name: "Vieille Ville & Porte Historique",
    tagline: "La vieille ville, la porte de mer et la place centrale, dans le quartier historique.",
    description:
      "Parcourez la vieille ville haute — ruelles étroites, murs anciens, porte historique — et terminez par un café sur la place principale, où la ville se regarde passer l'après-midi.",
    travelTime: "En ville",
    category: "Patrimoine",
    image: "/images/activity-vineyard-walk.jpg",
    imageAlt: "Une ruelle de la vieille ville",
  },
  {
    slug: "diner-vue",
    name: "Dîner avec Vue",
    tagline: "Une table le soir au restaurant de l'hôtel, au-dessus du paysage.",
    description:
      "Une table au restaurant de l'hôtel, au-dessus du paysage, à mesure que la lumière s'éteint. Une carte d'excellence ouverte sur le monde — l'expérience la plus simple à planifier et souvent celle dont nos hôtes se souviennent.",
    travelTime: "À l'hôtel",
    category: "À l'hôtel",
    image: "/images/exhibit-dining-room.jpg",
    imageAlt: "Le restaurant de l'hôtel",
  },
];

export function getExperienceBySlug(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}
