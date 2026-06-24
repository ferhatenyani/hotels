// /dining — le restaurant en détail. Server Component. Expanse la section
// d'accueil en une page éditoriale calme : introduction + horaires, trois
// points forts, la carte par service, un formulaire de réservation en ligne,
// et un renvoi vers /rooms.
//
// Archetype: Editorial page (CONVENTIONS §11).
//   PageHero (default)
//   Section (intro + hours ledger / chips)
//   Section (3 highlights)
//   Section (menus — three cards)
//   Section (reserve a table — inline form)
//   Section (cross-link banner → /rooms)

import type { Metadata } from "next";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";
import { Button } from "@/components/site/Button";

import { hotel } from "@/lib/data/hotel";
import { diningHours, diningMenu, diningHighlights } from "@/lib/data/dining";

import DiningReservationForm from "./DiningReservationForm";

export const metadata: Metadata = {
  title: `Restaurant — ${hotel.name}, ${hotel.city}`,
  description:
    "Une carte d'excellence ouverte sur le monde, servie au-dessus de la ville. Petit-déjeuner 06h30–10h30 (inclus), déjeuner 12h00–14h30, dîner 19h00–22h00.",
};

export default function DiningPage() {
  const opening = diningHighlights[0];

  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Le restaurant"
        heading="Une table avec vue"
        description="Une carte d'excellence ouverte sur le monde — face au panorama de la ville."
        image="/images/exhibit-dining-room.jpg"
        imageAlt={`Le restaurant de ${hotel.name}, ouvert sur la ville`}
      />

      {/* INTRO + HOURS — opening blurb on the left, hours ledger on the right.
          Mobile: copy first, hours render as chips below. */}
      <Section tone="white" size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Une soirée en hauteur"
              heading={opening.title}
              description={opening.body}
            />
            <p className="mt-5 md:mt-6 font-sans font-normal text-[15px] md:text-[16px] leading-[1.7] md:leading-[1.75] text-graybase max-w-xl">
              Notre restaurant offre tout le confort d'une véritable maison de
              gastronomie — <span className="italic">une carte d&apos;excellence
              ouverte sur le monde</span>. Les matinées commencent par le
              petit-déjeuner que nos hôtes citent si souvent : fruits frais et
              viennoiseries chaudes. Le déjeuner et le dîner suivent, au-dessus
              du paysage.
            </p>
          </div>

          {/* HOURS — desktop ledger; mobile renders chips below the copy. */}
          <div className="lg:col-span-5 lg:pt-2">
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/55 mb-4 md:mb-5">
              Horaires de service
            </p>

            {/* Desktop ledger */}
            <dl className="hidden lg:flex flex-col gap-4">
              {diningHours.map((h, i) => (
                <div
                  key={h.label}
                  className="flex items-baseline gap-5 border-t border-ink/15 pt-3"
                >
                  <span className="font-display text-[12px] tabular-nums text-marine tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <dt className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60 min-w-[90px]">
                    {h.label}
                  </dt>
                  <dd className="font-sans tabular-nums text-[15px] text-ink text-right ml-auto">
                    {h.time}
                  </dd>
                  {h.note && (
                    <span className="font-sans italic text-[12px] text-marine">
                      {h.note}
                    </span>
                  )}
                </div>
              ))}
            </dl>

            {/* Mobile / tablet chips */}
            <ul className="lg:hidden flex flex-wrap gap-2">
              {diningHours.map((h) => (
                <li
                  key={h.label}
                  className="inline-flex items-baseline gap-2 rounded-full bg-cream/60 px-3.5 py-2.5 border border-ink/10"
                >
                  <span className="font-sans text-[10.5px] uppercase tracking-[0.18em] text-ink/60">
                    {h.label}
                  </span>
                  <span className="font-sans tabular-nums text-[13px] text-ink">
                    {h.time}
                  </span>
                  {h.note && (
                    <span className="font-sans italic text-[11px] text-marine">
                      · {h.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* HIGHLIGHTS — three stacked-to-grid cards. */}
      <Section tone="cream" grain size="default">
        <SectionHeading
          eyebrow="Ce que la salle propose"
          heading="Trois raisons pour lesquelles la table mérite sa place"
        />

        <ul className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
          {diningHighlights.map((h, i) => (
            <li
              key={h.title}
              className="flex flex-col bg-white border border-ink/10 p-6 md:p-8 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.18)]"
            >
              <p className="font-display text-[12px] tabular-nums text-marine tracking-tight">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display font-medium text-[20px] md:text-[24px] tracking-tight leading-tight text-ink text-balance">
                {h.title}
              </h3>
              <span aria-hidden className="mt-4 block h-px w-10 bg-marine" />
              <p className="mt-4 font-sans text-[14px] md:text-[15px] leading-[1.65] md:leading-[1.7] text-graybase">
                {h.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* MENUS — three cards, one per service. Stack mobile → side-by-side. */}
      <Section tone="white" size="default" id="menus">
        <SectionHeading
          eyebrow="La carte"
          heading="Ce que vous trouverez à table"
          description="Une carte courte qui change avec la saison — classiques algériens, incontournables méditerranéens et une ligne discrète de plats venus de plus loin."
        />

        <div className="mt-10 md:mt-14 lg:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
          {diningMenu.map((section) => (
            <article
              key={section.title}
              className="flex flex-col bg-cream/40 border border-ink/10 p-6 md:p-8 lg:p-10 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.18)]"
            >
              <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-marine">
                {section.eyebrow}
              </p>
              <h3 className="mt-3 font-display font-medium text-[22px] md:text-[26px] leading-tight tracking-tight text-ink text-balance">
                {section.title}
              </h3>
              <span aria-hidden className="mt-4 block h-px w-10 bg-marine" />
              <p className="mt-4 font-sans text-[14px] md:text-[15px] leading-[1.65] md:leading-[1.7] text-graybase">
                {section.description}
              </p>

              <ul className="mt-6 md:mt-7 flex flex-col gap-0 border-t border-ink/10">
                {section.dishes.map((dish) => (
                  <li
                    key={dish.name}
                    className="flex items-baseline gap-3 border-b border-ink/10 py-3"
                  >
                    <span className="font-sans text-[14px] md:text-[15px] text-ink">
                      {dish.name}
                    </span>
                    {dish.note && (
                      <span className="ml-auto font-sans italic text-[11.5px] tracking-wide text-graybase tabular-nums">
                        {dish.note}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* RESERVE A TABLE — inline form, mirrors Contact.tsx submission pattern. */}
      <Section tone="cream" grain size="default" id="reserve">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Réserver une table"
              heading="Garder une place près de la fenêtre"
              description="Un mot au maître d'hôtel — nous reviendrons confirmer. Pour les tables du jour, n'hésitez pas à téléphoner à la réception."
            />

            <ul className="mt-8 md:mt-10 flex flex-col gap-3 md:gap-4">
              <li className="flex items-baseline gap-3 border-t border-ink/15 pt-3">
                <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  Par téléphone
                </span>
                <a
                  href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`}
                  className="ml-auto font-sans tabular-nums text-[15px] text-ink hover:text-marine transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
                >
                  {hotel.contact.phonePrimary}
                </a>
              </li>
              <li className="flex items-baseline gap-3 border-t border-ink/15 pt-3">
                <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  Par e-mail
                </span>
                <a
                  href={`mailto:${hotel.contact.email}`}
                  className="ml-auto font-sans text-[14px] text-ink hover:text-marine transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
                >
                  {hotel.contact.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <DiningReservationForm />
          </div>
        </div>
      </Section>

      {/* CROSS-LINK BANNER → /rooms */}
      <Section tone="ink" grain size="compact">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="max-w-[44ch]">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/55 mb-3">
              Vous séjournez chez nous ?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              Le petit-déjeuner est inclus avec chaque chambre — fruits frais
              et viennoiseries chaudes, dès 06h30.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              Chaque chambre s'ouvre sur la ville, avec la même table qui
              attend en bas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button href="/rooms" variant="primary" size="default" arrow>
              Voir les chambres
            </Button>
            <Button
              href="/booking/search"
              variant="ghost-light"
              size="default"
            >
              Réserver un séjour
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
