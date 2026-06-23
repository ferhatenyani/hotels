// Restaurant content. Hours are verbatim from the demo content pack; menu items
// are illustrative (the demo content explicitly says not to invent prices), so
// dishes are listed without prices and framed as "a small selection of what
// you'll find on the carte" — honest and brand-appropriate.

export type DiningHour = { label: string; time: string; note?: string };
export type MenuSection = {
  title: string;
  eyebrow: string;
  description: string;
  dishes: { name: string; note?: string }[];
};

export const diningHours: DiningHour[] = [
  { label: "Breakfast", time: "06:30 – 10:30", note: "Included for guests" },
  { label: "Lunch", time: "12:00 – 14:30" },
  { label: "Dinner", time: "19:00 – 22:00" },
];

export const diningMenu: MenuSection[] = [
  {
    title: "Breakfast",
    eyebrow: "From 06:30",
    description:
      "A generous continental table — the meal guests single out the most. Fresh fruit and warm pastries, served in the lake-view room.",
    dishes: [
      { name: "Fresh seasonal fruit", note: "Cut to order" },
      { name: "Pastries from the kitchen" },
      { name: "House preserves and honey from the region" },
      { name: "Coffee, tea, infusions" },
      { name: "Eggs to order" },
    ],
  },
  {
    title: "Lunch & Dinner",
    eyebrow: "A carte d'excellence",
    description:
      "A short carte that changes with the season — Algerian classics, Mediterranean staples, and a quiet line of dishes from further afield. Served above Lac Mézaïa.",
    dishes: [
      { name: "Crudités du jour" },
      { name: "Soupe Mézaïa" },
      { name: "Tajine d'agneau aux pruneaux" },
      { name: "Couscous royal" },
      { name: "Filet de loup, sauce vierge" },
      { name: "Carré d'agneau, jus court" },
      { name: "Ahi salmon nigiri", note: "From the sushi line" },
      { name: "Pâtisseries maison" },
    ],
  },
  {
    title: "From the cafeteria",
    eyebrow: "All day",
    description:
      "A quieter room for a coffee between meetings, an after-walk sandwich, or a late tea by the window.",
    dishes: [
      { name: "Espresso, cappuccino, mint tea" },
      { name: "Sandwich du jour" },
      { name: "Tarte de saison" },
      { name: "Fresh juices" },
    ],
  },
];

export const diningHighlights = [
  {
    title: "A view that does the work",
    body: "The room sits high enough over Lac Mézaïa for the lake to fill the window — at lunch, the green slope of Gouraya; at dinner, the city's lights along the water.",
  },
  {
    title: "Breakfast guests come back for",
    body: "Across hundreds of reviews, the breakfast is the meal guests mention first — fresh fruit cut to order, warm pastries, and a generous spread that opens the day well.",
  },
  {
    title: "Une carte ouverte sur le monde",
    body: "An Algerian house at heart, with a quiet international register — a sushi line for the curious, classics for the loyal.",
  },
];
