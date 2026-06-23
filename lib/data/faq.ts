// FAQ content. Topics ordered by the real friction points called out in the
// demo content pack — check-in document policy first (the dominant Algerian
// hospitality friction), then practical questions (parking, breakfast, etc.).

export type FAQItem = {
  q: string;
  a: string;
};

export type FAQGroup = {
  title: string;
  blurb: string;
  items: FAQItem[];
};

export const faqGroups: FAQGroup[] = [
  {
    title: "Arrival & check-in",
    blurb:
      "What to bring, when to arrive, and how the desk handles the small things.",
    items: [
      {
        q: "What time can I check in?",
        a: "Check-in opens at 14:00. Earlier arrivals are welcome — we'll hold your luggage at the desk and call you as soon as the room is ready. The desk is staffed twenty-four hours a day.",
      },
      {
        q: "What documents do I need to present?",
        a: "All guests must present a valid ID at check-in (passport or national ID). For couples, Algerian law requires proof of marriage (the marriage booklet, livret de famille, or the certificate). We mention this here so it doesn't surprise you at the desk — it is a national requirement, not a hotel rule.",
      },
      {
        q: "Can I arrive late at night?",
        a: "Yes. The reception is staffed twenty-four hours a day. If you're arriving after midnight, a quick note on your booking helps us be ready for you.",
      },
      {
        q: "What is check-out?",
        a: "Check-out is at 12:00. We can usually hold your room until 13:00 or 14:00 at no charge — ask the desk the night before, and we'll arrange it where availability allows.",
      },
    ],
  },
  {
    title: "Getting here & parking",
    blurb: "From the airport, the station, and around the city.",
    items: [
      {
        q: "How far is the airport?",
        a: "Soummam–Abane Ramdane Airport is roughly three to six kilometres away — about fifteen minutes by car in normal traffic. Taxis are available outside arrivals.",
      },
      {
        q: "Is there parking on site?",
        a: "Yes, free private parking, accessible twenty-four hours a day. No reservation is needed for guest parking.",
      },
      {
        q: "Can you arrange an airport pickup?",
        a: "We can help arrange a transfer with a local provider, but it isn't included in the rate. Send a note with your arrival details and we'll come back with options and pricing.",
      },
    ],
  },
  {
    title: "Rooms, breakfast & the restaurant",
    blurb: "What's included, when meals are served, and what we can do for you in the room.",
    items: [
      {
        q: "Is breakfast included?",
        a: "Yes. Breakfast is included for all our guests, served from 06:30 to 10:30 in the lake-view restaurant. It's the meal our guests mention most often — fresh fruit, warm pastries, and eggs to order.",
      },
      {
        q: "Do you have lake-view rooms?",
        a: "Every favoured room looks over Lac Mézaïa and the green slopes of Yemma Gouraya — that's the room you're booking, almost without exception. A handful of rooms face the city side; ask the desk if you'd prefer one.",
      },
      {
        q: "Can I have a meal in my room?",
        a: "Yes, room service is available during restaurant hours. The full carte is reachable from your room phone.",
      },
      {
        q: "Are you family-friendly?",
        a: "Very. We have family and triple rooms, the breakfast spread works well for children, and the team will help with anything you need on the night.",
      },
    ],
  },
  {
    title: "The hotel & amenities",
    blurb: "What we have, what we don't, and what to expect.",
    items: [
      {
        q: "Do you have a swimming pool or spa?",
        a: "No — Hôtel du Lac is a calm, modern city hotel, not a resort. We don't have a pool, a spa or a gym on site. We'd rather tell you up front than have you discover it on arrival.",
      },
      {
        q: "Do you have Wi-Fi?",
        a: "Yes, free Wi-Fi throughout the hotel — strong enough for video calls in every room we've tested.",
      },
      {
        q: "Are the rooms air-conditioned?",
        a: "Every room has air conditioning, with controls in the room.",
      },
      {
        q: "Is there a lift?",
        a: "Please ask at the desk when you book — we'll confirm based on your floor and any accessibility needs.",
      },
    ],
  },
  {
    title: "Booking, payment & cancellation",
    blurb: "How to reserve, how we hold the room, and how cancellations work.",
    items: [
      {
        q: "How should I book?",
        a: "Direct booking is the simplest path — through this site, by email at contact@hoteldulacvert.dz, or by phone at +213 44 20 20 22. Direct bookings are confirmed by us, so there are no surprises at the desk.",
      },
      {
        q: "Do you take credit cards?",
        a: "Yes, all major cards. We also accept cash settlement at the desk if you prefer.",
      },
      {
        q: "What is your cancellation policy?",
        a: "Free cancellation up to forty-eight hours before arrival on standard rates. Promotional and non-refundable rates are clearly marked at booking, with their own terms.",
      },
      {
        q: "Will I be charged at booking?",
        a: "Standard rates are held with a card but charged only at the hotel. Non-refundable rates are charged at booking — this is shown clearly before you confirm.",
      },
    ],
  },
  {
    title: "Events & meetings",
    blurb: "Weddings, conferences, and everything in between.",
    items: [
      {
        q: "Can I hold a wedding here?",
        a: "Yes — the hall seats up to one hundred and seventy guests and is one of Béjaïa's go-to venues for weddings, baptêmes and engagements. Visit the Events page or write to the desk to start the conversation.",
      },
      {
        q: "Do you have meeting rooms for business?",
        a: "Yes, adaptable rooms with projector, microphone, Wi-Fi and a coffee-break service. Catering ranges from morning coffee to a full dinner — tell us the day and we'll shape the room.",
      },
      {
        q: "Can you block rooms for our wedding guests?",
        a: "Yes. We can hold ten or more rooms together at a reduced group rate, with a private check-in for the wedding party — see the Wedding Party Block on the Offers page.",
      },
    ],
  },
];
