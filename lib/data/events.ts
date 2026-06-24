// Contenu Événements & Réunions — le véritable atout différenciant.
// Les chiffres (498 m², 170 places, divisible en 2) viennent du pack de
// contenu démo.

export type EventType = {
  slug: string;
  name: string;
  blurb: string;
  /** Nom d'icône Lucide — garde une iconographie cohérente avec le reste du site. */
  icon:
    | "Heart"
    | "Cake"
    | "PartyPopper"
    | "Mic"
    | "Briefcase"
    | "Music";
};

export const eventTypes: EventType[] = [
  {
    slug: "mariages",
    name: "Mariages",
    blurb:
      "La salle de 498 m², habillée pour le jour — dîners assis jusqu'à 170 invités, restauration sur mesure et l'horizon en toile de fond.",
    icon: "Heart",
  },
  {
    slug: "fiancailles-baptemes",
    name: "Fiançailles & Baptêmes",
    blurb:
      "Des célébrations plus intimes dans l'une des moitiés de la salle divisible — une salle plus calme, le même soin.",
    icon: "Cake",
  },
  {
    slug: "anniversaires",
    name: "Anniversaires",
    blurb:
      "D'un dîner intime à une salle entière — nous adaptons l'espace à la soirée que vous imaginez.",
    icon: "PartyPopper",
  },
  {
    slug: "conferences",
    name: "Conférences",
    blurb:
      "Salles de réunion équipées — vidéoprojecteur, microphone, Wi-Fi rapide — pour conseils, tables rondes et séminaires.",
    icon: "Mic",
  },
  {
    slug: "seminaires",
    name: "Séminaires & Off-sites",
    blurb:
      "Des salles modulables avec service pause-café, déjeuners de travail et la ville au pas de la porte.",
    icon: "Briefcase",
  },
  {
    slug: "concerts",
    name: "Concerts & Soirées",
    blurb:
      "Une tradition de musique live — la salle accueille bien une foule, qu'il s'agisse d'un concert ou d'une soirée DJ.",
    icon: "Music",
  },
];

export type CapacitySetup = {
  setup: string;
  capacity: string;
  note?: string;
};

export const hallCapacity: CapacitySetup[] = [
  { setup: "Banquet", capacity: "Jusqu'à 170 assis", note: "Salle entière, tables rondes" },
  { setup: "Théâtre", capacity: "Jusqu'à 220 assis", note: "Style conférence" },
  { setup: "Classe", capacity: "Jusqu'à 110 assis", note: "Style formation" },
  { setup: "En U", capacity: "Jusqu'à 60 assis", note: "Demi-salle, format conseil" },
  { setup: "Cocktail", capacity: "Jusqu'à 300 debout", note: "Format réception" },
  { setup: "Divisible", capacity: "2 × ~85 assis", note: "Salle séparée en deux" },
];

export const meetingEquipment = [
  "Vidéoprojecteur + écran déroulant",
  "Microphones sans fil (main & cravate)",
  "Système sonore, mixage en salle",
  "Wi-Fi rapide et gratuit dans toute la salle",
  "Tableau papier et marqueurs",
  "Technicien sur place sur demande",
  "Service pause-café",
  "Restauration sur mesure (café, déjeuner, cocktail, dîner)",
];

export const eventTimeline = [
  {
    step: "Parlez-nous du jour",
    body: "Type d'événement, date, nombre d'invités, besoins en restauration ou audiovisuel. Envoyez un mot ou appelez la réception directement.",
  },
  {
    step: "Nous proposons un agencement & un devis",
    body: "Configuration de la salle, blocs de chambres pour vos invités, un devis à partager avec les parties prenantes — en général dans la journée.",
  },
  {
    step: "Vous signez, nous bloquons la date",
    body: "Un acompte réserve la salle. Nous partageons une liste de vérification pour tout, des menus aux fleurs.",
  },
  {
    step: "Le jour J, nous opérons en coulisses",
    body: "Une équipe discrète sur place s'occupe de l'installation, du service et du démontage — vous restez avec vos invités.",
  },
];
