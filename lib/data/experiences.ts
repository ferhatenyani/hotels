// "Discover Béjaïa" — concierge-recommended local sights, NOT paid hotel tours.
// The honesty rule from HOTEL-DU-LAC-DEMO-CONTENT.md §10.4 applies:
// these are real local attractions framed as concierge picks, never priced.

export type Experience = {
  slug: string;
  name: string;
  /** One-line essence used on cards. */
  tagline: string;
  /** Long-form (1–2 sentences) used on the detail row. */
  description: string;
  /** "By car · ~15 min", "At the door", "Half day", "In town" — travel time, not paid duration. */
  travelTime: string;
  /** Category for filtering / grouping. */
  category: "Nature" | "Heritage" | "Coast" | "In-house";
  /** Local image asset. */
  image: string;
  imageAlt: string;
};

export const experiences: Experience[] = [
  {
    slug: "gouraya-national-park",
    name: "Gouraya National Park",
    tagline: "Cedar slopes, sea views, and the Pic des Singes above the bay.",
    description:
      "A protected mountain park rising directly behind the city — cedar woods, panoramic ridge walks, and the famous Pic des Singes (Peak of the Monkeys) overlooking the bay of Béjaïa.",
    travelTime: "By car · ~15 min",
    category: "Nature",
    image: "/images/activity-cliff-path.jpg",
    imageAlt: "A cliff path in Gouraya National Park",
  },
  {
    slug: "cap-carbon-lighthouse",
    name: "Cap Carbon Lighthouse",
    tagline: "One of the Mediterranean's highest lighthouses, on a dramatic headland.",
    description:
      "A drive along the Corniche to a working lighthouse perched on a sheer headland. One of the Mediterranean's highest, with a wide view of the gulf — best at the slow hour before sunset.",
    travelTime: "Half day",
    category: "Coast",
    image: "/images/activity-sunset-sailing.jpg",
    imageAlt: "The headland near Cap Carbon Lighthouse",
  },
  {
    slug: "lac-mezaia",
    name: "Lac Mézaïa",
    tagline: "A protected wetland of birdlife and quiet, right outside the hotel.",
    description:
      "Our doorstep. A protected stretch of inland water and birdsong, held quietly inside central Béjaïa — a short walk that resets the day. Bring a quiet pair of shoes and a camera.",
    travelTime: "At the door",
    category: "Nature",
    image: "/images/activity-garden-breakfast.jpg",
    imageAlt: "Quiet greenery along Lac Mézaïa",
  },
  {
    slug: "corniche-beaches",
    name: "The Corniche Beaches",
    tagline: "Les Aiguades and Boulimat, along Béjaïa's coast road.",
    description:
      "The Corniche unrolls north of the city — coves at Les Aiguades, the long curve at Boulimat, and clear water on calm days. Take the coast road slowly; the views are the point.",
    travelTime: "By car",
    category: "Coast",
    image: "/images/activity-sea-bathing.jpg",
    imageAlt: "A cove along the Béjaïa Corniche",
  },
  {
    slug: "casbah-bab-el-bahr",
    name: "The Casbah & Bab El Bahr",
    tagline: "The old town, the sea gate and Place Gueydon, in the historic centre.",
    description:
      "Walk the old upper city — narrow steps, Ottoman walls, the sea gate Bab El Bahr — and finish with a coffee on Place Gueydon, where Béjaïa watches itself pass the afternoon.",
    travelTime: "In town",
    category: "Heritage",
    image: "/images/activity-vineyard-walk.jpg",
    imageAlt: "An old-city alley in Béjaïa",
  },
  {
    slug: "lake-view-dining",
    name: "Lake-View Dining",
    tagline: "An evening table at the hotel restaurant, above Lac Mézaïa.",
    description:
      "A table at the hotel restaurant, above the water, as the light goes. Une carte d'excellence ouverte sur le monde — the simplest experience to plan, and often the one guests remember.",
    travelTime: "In-house",
    category: "In-house",
    image: "/images/exhibit-dining-room.jpg",
    imageAlt: "The restaurant at Hôtel du Lac",
  },
];

export function getExperienceBySlug(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}
