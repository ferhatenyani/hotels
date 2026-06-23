// Core hotel facts. Single source of truth so address, phone, email and the
// "always-on" copy (tagline, intro lines) stay consistent across every page
// and metadata block.

export const hotel = {
  name: "Hôtel du Lac",
  shortName: "Hôtel du Lac",
  city: "Béjaïa",
  country: "Algérie",
  tagline: "Le Calme au Centre Ville",
  about:
    "A modern hotel on the edge of Lac Mézaïa, facing Yemma Gouraya — designed to receive you in comfort and quiet, whether you come for business or with family.",
  address: {
    street: "Rue Hassiba Ben Bouali, Aamriou",
    postalCode: "06000",
    city: "Béjaïa",
    country: "Algérie",
    /** Plus Code for embedded map fallbacks. */
    plusCode: "Q323+C2V Béjaïa",
  },
  contact: {
    phonePrimary: "+213 44 20 20 22",
    phoneSecondary: "+213 44 20 21 32",
    fax: "+213 44 20 26 70",
    email: "contact@hoteldulacvert.dz",
  },
  social: {
    instagram: "https://www.instagram.com/hotel.du.lac/",
    facebook: "https://www.facebook.com/hoteldulacbejaia/",
  },
  numbers: {
    rooms: 124,
    eventsHallSqm: 498,
    googleRating: 4.3,
    googleReviewCount: 410,
    languagesSpoken: ["Arabic", "French", "English"],
  },
  /** Distances to surface on Contact and About. */
  distances: [
    { label: "City centre & seafront", value: "≈ 1 km" },
    { label: "Lac Mézaïa", value: "On the doorstep" },
    { label: "Soummam – Abane Ramdane Airport", value: "≈ 3–6 km · 15 min" },
    { label: "Béjaïa railway station", value: "≈ 3.1 km" },
    { label: "Gouraya National Park", value: "7–15 min by car" },
  ],
  /** Tourism tax in DA per person per night, applied to the booking total. */
  tourismTaxDA: 300,
};

/** Formats a Dinar amount with a thin space thousands separator and a "DA" suffix. */
export function formatDA(amount: number): string {
  // 12500 → "12 500 DA"
  return `${amount.toLocaleString("fr-FR")} DA`;
}
