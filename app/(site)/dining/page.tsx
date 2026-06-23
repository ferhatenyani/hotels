// /dining — the restaurant in full. Server Component. Expands the home
// section into a quiet editorial page: opening blurb + service hours ledger,
// three highlights, the carte by service, an inline reservation form, and a
// cross-link to /rooms.
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

import { diningHours, diningMenu, diningHighlights } from "@/lib/data/dining";

import DiningReservationForm from "./DiningReservationForm";

export const metadata: Metadata = {
  title: "Dining — Hôtel du Lac, Béjaïa",
  description:
    "A short carte d'excellence ouverte sur le monde, served above Lac Mézaïa. Breakfast 06:30–10:30 (included), lunch 12:00–14:30, dinner 19:00–22:00.",
};

export default function DiningPage() {
  const opening = diningHighlights[0];

  return (
    <main className="bg-white">
      <PageHero
        eyebrow="The restaurant"
        heading="A table with a view of the water"
        description="Une carte d'excellence ouverte sur le monde — set against the wide, panoramic view of Lac Mézaïa."
        image="/images/exhibit-dining-room.jpg"
        imageAlt="The restaurant at Hôtel du Lac, overlooking Lac Mézaïa"
      />

      {/* INTRO + HOURS — opening blurb on the left, hours ledger on the right.
          Mobile: copy first, hours render as chips below. */}
      <Section tone="white" size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="An evening above the lake"
              heading={opening.title}
              description={opening.body}
            />
            <p className="mt-5 md:mt-6 font-sans font-normal text-[15px] md:text-[16px] leading-[1.7] md:leading-[1.75] text-graybase max-w-xl">
              Our restaurant carries all the comfort of a true house of
              gastronomy — <span className="italic">une carte d&apos;excellence
              ouverte sur le monde</span>. Mornings begin with the breakfast
              guests so often single out: fresh fruit and warm pastries. Lunch
              and dinner follow against the lake and the mountain.
            </p>
          </div>

          {/* HOURS — desktop ledger; mobile renders chips below the copy. */}
          <div className="lg:col-span-5 lg:pt-2">
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/55 mb-4 md:mb-5">
              Service hours
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
          eyebrow="What the room offers"
          heading="Three reasons the table earns its place"
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
          eyebrow="The carte"
          heading="What you'll find on the table"
          description="A short carte that changes with the season — Algerian classics, Mediterranean staples, and a quiet line of dishes from further afield."
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
              eyebrow="Reserve a table"
              heading="Save a window seat"
              description="A note to the maître d' — we'll come back to confirm. For same-day tables, do telephone the desk."
            />

            <ul className="mt-8 md:mt-10 flex flex-col gap-3 md:gap-4">
              <li className="flex items-baseline gap-3 border-t border-ink/15 pt-3">
                <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  By phone
                </span>
                <a
                  href="tel:+21344202022"
                  className="ml-auto font-sans tabular-nums text-[15px] text-ink hover:text-marine transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
                >
                  +213 44 20 20 22
                </a>
              </li>
              <li className="flex items-baseline gap-3 border-t border-ink/15 pt-3">
                <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  By email
                </span>
                <a
                  href="mailto:contact@hoteldulacvert.dz"
                  className="ml-auto font-sans text-[14px] text-ink hover:text-marine transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
                >
                  contact@hoteldulacvert.dz
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
              Staying with us?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              Breakfast is included with every room — fresh fruit and warm
              pastries, from 06:30.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              Each room looks out over Lac Mézaïa, with the same table waiting
              downstairs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button href="/rooms" variant="primary" size="default" arrow>
              See rooms
            </Button>
            <Button
              href="/booking/search"
              variant="ghost-light"
              size="default"
            >
              Reserve a stay
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
