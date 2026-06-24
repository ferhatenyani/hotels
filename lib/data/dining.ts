// Contenu du restaurant. Les horaires viennent du pack de contenu démo ; les
// plats sont illustratifs (la démo demande de ne pas inventer de prix), donc
// les plats sont listés sans prix et présentés comme « une petite sélection
// de ce que vous trouverez à la carte ».

export type DiningHour = { label: string; time: string; note?: string };
export type MenuSection = {
  title: string;
  eyebrow: string;
  description: string;
  dishes: { name: string; note?: string }[];
};

export const diningHours: DiningHour[] = [
  { label: "Petit-déjeuner", time: "06:30 – 10:30", note: "Inclus pour nos hôtes" },
  { label: "Déjeuner", time: "12:00 – 14:30" },
  { label: "Dîner", time: "19:00 – 22:00" },
];

export const diningMenu: MenuSection[] = [
  {
    title: "Petit-déjeuner",
    eyebrow: "À partir de 06:30",
    description:
      "Une table continentale généreuse — le repas que nos hôtes citent le plus souvent. Fruits frais et viennoiseries chaudes, servis dans la salle avec vue.",
    dishes: [
      { name: "Fruits frais de saison", note: "Coupés à la commande" },
      { name: "Viennoiseries maison" },
      { name: "Confitures maison et miel de la région" },
      { name: "Café, thé, infusions" },
      { name: "Œufs à la commande" },
    ],
  },
  {
    title: "Déjeuner & Dîner",
    eyebrow: "Une carte d'excellence",
    description:
      "Une carte courte qui change avec la saison — classiques algériens, incontournables méditerranéens et une ligne discrète de plats venus de plus loin. Servie avec vue.",
    dishes: [
      { name: "Crudités du jour" },
      { name: "Soupe du chef" },
      { name: "Tajine d'agneau aux pruneaux" },
      { name: "Couscous royal" },
      { name: "Filet de loup, sauce vierge" },
      { name: "Carré d'agneau, jus court" },
      { name: "Sashimi de saumon", note: "De la ligne sushi" },
      { name: "Pâtisseries maison" },
    ],
  },
  {
    title: "À la cafétéria",
    eyebrow: "Toute la journée",
    description:
      "Une salle plus calme pour un café entre deux réunions, un sandwich après une promenade ou un thé tardif près de la fenêtre.",
    dishes: [
      { name: "Espresso, cappuccino, thé à la menthe" },
      { name: "Sandwich du jour" },
      { name: "Tarte de saison" },
      { name: "Jus frais" },
    ],
  },
];

export const diningHighlights = [
  {
    title: "Une vue qui fait le travail",
    body: "La salle est assez haute pour que le paysage remplisse la fenêtre — au déjeuner, les pentes verdoyantes ; au dîner, les lumières de la ville le long de l'horizon.",
  },
  {
    title: "Un petit-déjeuner pour lequel on revient",
    body: "À travers des centaines d'avis, le petit-déjeuner est le repas que nos hôtes citent en premier — fruits frais coupés à la commande, viennoiseries chaudes et une table généreuse qui ouvre bien la journée.",
  },
  {
    title: "Une carte ouverte sur le monde",
    body: "Une maison algérienne dans l'âme, avec un registre international discret — une ligne sushi pour les curieux, des classiques pour les fidèles.",
  },
];
