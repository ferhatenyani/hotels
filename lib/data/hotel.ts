// Faits centraux de l'hôtel. Source unique de vérité pour que l'adresse, le
// téléphone, l'e-mail et les phrases « toujours présentes » (slogan, lignes
// d'intro) restent cohérents sur chaque page et bloc de métadonnées.

export const hotel = {
  name: "Notre Hôtel",
  shortName: "Notre Hôtel",
  city: "Votre Ville",
  country: "Pays",
  tagline: "Le Calme au Cœur de la Ville",
  about:
    "Un hôtel moderne au cœur de la ville — pensé pour vous accueillir dans le confort et la tranquillité, que vous voyagiez pour affaires ou en famille.",
  address: {
    street: "Rue de l'Hôtel",
    postalCode: "00000",
    city: "Votre Ville",
    country: "Pays",
    /** Plus Code de secours pour les cartes intégrées. */
    plusCode: "0000+00 Ville",
  },
  contact: {
    phonePrimary: "+00 00 00 00 00",
    phoneSecondary: "+00 00 00 00 01",
    fax: "+00 00 00 00 02",
    email: "contact@notre-hotel.com",
  },
  social: {
    instagram: "https://www.instagram.com/notre.hotel/",
    facebook: "https://www.facebook.com/notrehotel/",
  },
  numbers: {
    rooms: 124,
    eventsHallSqm: 498,
    googleRating: 4.3,
    googleReviewCount: 410,
    languagesSpoken: ["Arabe", "Français", "Anglais"],
  },
  /** Distances à afficher dans Contact et À propos. */
  distances: [
    { label: "Centre-ville & front de mer", value: "≈ 1 km" },
    { label: "Parc naturel", value: "Au pied de l'hôtel" },
    { label: "Aéroport international", value: "≈ 3–6 km · 15 min" },
    { label: "Gare ferroviaire", value: "≈ 3,1 km" },
    { label: "Réserve naturelle", value: "7–15 min en voiture" },
  ],
  /** Taxe de séjour par personne et par nuit, appliquée au total de la réservation. */
  tourismTaxDA: 300,
};

/** Formate un montant en Dinars avec un séparateur fin de milliers et le suffixe « DA ». */
export function formatDA(amount: number): string {
  // 12500 → "12 500 DA"
  return `${amount.toLocaleString("fr-FR")} DA`;
}
