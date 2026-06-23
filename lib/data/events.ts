// Events & Meetings content — the hotel's real differentiator.
// Numbers (498 m², seats 170, divisible into 2) are verbatim from the demo
// content pack and the hotel's official site.

export type EventType = {
  slug: string;
  name: string;
  blurb: string;
  /** Lucide icon name — keeps the section iconography consistent with the rest of the site. */
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
    slug: "weddings",
    name: "Weddings",
    blurb:
      "The 498 m² hall, dressed for the day — seated dinners up to 170, with bespoke catering and the lake on the horizon.",
    icon: "Heart",
  },
  {
    slug: "engagements-baptisms",
    name: "Engagements & Baptêmes",
    blurb:
      "Smaller celebrations in either half of the divisible hall — a quieter room, the same care.",
    icon: "Cake",
  },
  {
    slug: "birthdays",
    name: "Birthdays",
    blurb:
      "From an intimate dinner to a full hall — we'll shape the room to the night you have in mind.",
    icon: "PartyPopper",
  },
  {
    slug: "conferences",
    name: "Conferences",
    blurb:
      "Equipped meeting rooms — projector, microphone, fast Wi-Fi — for boards, panels and seminars.",
    icon: "Mic",
  },
  {
    slug: "seminars",
    name: "Seminars & Off-sites",
    blurb:
      "Adaptable rooms with coffee-break service, working lunches and the city on the doorstep.",
    icon: "Briefcase",
  },
  {
    slug: "concerts",
    name: "Concerts & Soirées",
    blurb:
      "A history of live music — from Samir Khelfi to Yennayer parties with DJ Lydia, the hall holds a crowd well.",
    icon: "Music",
  },
];

export type CapacitySetup = {
  setup: string;
  capacity: string;
  note?: string;
};

export const hallCapacity: CapacitySetup[] = [
  { setup: "Banquet", capacity: "Up to 170 seated", note: "Full hall, round tables" },
  { setup: "Theatre", capacity: "Up to 220 seated", note: "Conference-style" },
  { setup: "Classroom", capacity: "Up to 110 seated", note: "Training-style" },
  { setup: "U-shape", capacity: "Up to 60 seated", note: "Half-hall, board format" },
  { setup: "Cocktail", capacity: "Up to 300 standing", note: "Reception format" },
  { setup: "Divisible", capacity: "2 × ~85 seated", note: "Hall split into two" },
];

export const meetingEquipment = [
  "Video projector + drop-down screen",
  "Wireless microphones (handheld & lapel)",
  "Sound system, in-room mixing",
  "Free, fast Wi-Fi throughout",
  "Flipchart and markers",
  "On-site technician on request",
  "Coffee-break service",
  "Bespoke catering (coffee, lunch, cocktail, dinner)",
];

export const eventTimeline = [
  {
    step: "Tell us about the day",
    body: "Type of event, date, guest count, any catering or AV needs. Send a note or call the desk directly.",
  },
  {
    step: "We propose a layout & quote",
    body: "Hall configuration, room blocks for your guests, a quote you can share with stakeholders — usually within the day.",
  },
  {
    step: "Sign and we hold the date",
    body: "A deposit holds the room. We'll share a checklist for everything from menus to flowers.",
  },
  {
    step: "On the day, we run quietly",
    body: "A discreet on-site team handles setup, service and breakdown — you stay with your guests.",
  },
];
