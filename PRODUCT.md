# Product

## Register

brand

## Users

A working hotel website serving three guest archetypes, on weekday/weekend rhythms:

- **Algerian and diaspora families** — booking lake-view family rooms, often around school holidays, weddings or returning visits. Multilingual context (Arabic, French, English).
- **Business travelers** — Sun–Thu midweek stays for meetings in central Béjaïa, near Soummam airport. They want fast Wi-Fi, free parking, breakfast included, a quiet desk.
- **Couples and short-stay leisure** — weekend escapes drawn by Lac Mézaïa, Gouraya National Park, and the Corniche beaches.
- **Event clients** — wedding/baptême/seminar planners pricing the 498 m² hall and connected meeting rooms.

The shared context: visiting on phone first (Instagram, Google search), then desktop to confirm dates with a partner or HR. Mostly French/Arabic readers; English present.

## Product Purpose

A guest-facing website for **Hôtel du Lac Béjaïa** — a real 3-star, 124-room city-center hotel on Lac Mézaïa, facing Yemma Gouraya. Two jobs:

1. **Convey *place*** — sell the calm-at-the-centre promise (« Le Calme au Centre Ville »), the lake/Gouraya view, the gastronomic restaurant, and the events hall, with editorial restraint that matches the hotel's actual character.
2. **Convert directly** — push direct booking via a coherent funnel (search → results → guest → review → demo payment → confirmation), bypassing the OTA disputes (Booking.com) that are the hotel's #1 real-world friction.

Success: a guest arrives from search/social, understands the place in under 30 seconds, and either books directly or contacts the desk with intent.

## Brand Personality

Three words: **Calm · Grounded · Welcoming**.

Voice rules (carried over from `HOTEL-DU-LAC-DEMO-CONTENT.md`):

- Lead with calm and place ("at the heart of Béjaïa, on the edge of the lake").
- Plain, warm, unhurried sentences. No hype.
- Keep the French brand line « Le Calme au Centre Ville » visible — it's the real equity.
- Name the actual geography: Lac Mézaïa, Yemma Gouraya, Gouraya National Park, the Corniche, Cap Carbon.
- Lean on what guests actually praise: breakfast, cleanliness, central-but-quiet location.

Emotional target: "I can finally exhale — I'm in the centre of everything, but it's quiet, it's clean, and the lake is right there."

## Anti-references

Explicit "do not look like this":

- **Luxury-resort clichés (Aman, Four Seasons, Six Senses templates).** No drone-shot infinity-pool heroes, no gold accents, no oversized italic serif "an escape awaits" headlines, no spa or pool imagery. The hotel is a 3-star city hotel with no spa, no pool, no gym — pretending otherwise is dishonest and was the original template's failure mode.
- **OTA aesthetics (Booking.com / Expedia).** No urgency badges ("3 people viewing"), no fake scarcity, no busy badge stacks. Direct-booking calm is the brand's actual edge.
- **AI "editorial warm" template.** The cream-bg + thin-rule + tiny-eyebrow-on-every-section move is the saturated 2026 default. This project already leans editorial; conscious variety in rhythm matters (don't number every section 01/02/03, don't add an uppercase tracked eyebrow on every block by reflex).

## Design Principles

Five principles to guide future visual + content decisions:

1. **Honesty before polish.** If the hotel doesn't have it (spa, pool, gym, infinity views, certified 5-star), the site doesn't show it. The check-in document requirement (ID + marriage booklet for couples) is disclosed clearly, never hidden.
2. **Place is the protagonist.** Lac Mézaïa, Yemma Gouraya, Béjaïa — the specifics earn their weight. Photography, copy, even color (the forest-green "Lac Vert" marine) point to the actual geography rather than generic luxury.
3. **Calm carries the brand.** Generous whitespace, restrained motion, a single accent, slow-paced reveals. The brand line is "Le Calme au Centre Ville"; the interface must demonstrate calm, not just say it.
4. **Direct booking is the relationship.** The funnel is owned by the hotel, not handed to an OTA. Every page invites the user to book or call directly; the funnel itself emphasizes "we confirm every reservation ourselves" and warns about check-in documents up front. No dark patterns, no urgency tricks.
5. **Mobile is the primary surface.** Most guests arrive on a phone (Instagram, Google). Every layout reflows truly — not just shrinks — at 320 px and up. Touch targets ≥ 44 px. Editorial rhythm survives the small screen.

## Accessibility & Inclusion

Target: **WCAG 2.2 AA** for all guest-facing pages.

Concrete commitments:

- Body text contrast ≥ 4.5:1; large text ≥ 3:1. Verified per-surface, not assumed from token defaults.
- Every interactive element keyboard-reachable with a visible `focus-visible` ring on the marine accent.
- All decorative motion respects `prefers-reduced-motion`. The animated marquee (Exhibit) and parallax (Hero) are gated.
- Form fields have visible labels, helper text, and error messages that name the cause and the fix. Touch target ≥ 44 px on mobile.
- Multilingual baseline: site copy is currently English with French brand lines preserved. Lang switching is out of scope for now; copy must read cleanly as English without needing translation cues.
- Information is never conveyed by color alone (the marine accent always pairs with an icon, weight, or rule).
- Heading hierarchy is one h1 per route (PageHero), sequential h2/h3 below.
