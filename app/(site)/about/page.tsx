// /about — the house on the lake, in editorial register. Server Component.
//
// Archetype: Editorial page (CONVENTIONS §11).
//   PageHero (default)
//   Section (story copy — narrow editorial column, max-w-[920px])
//   Section (4-stat band — re-uses About.tsx rhythm)
//   Section (3 quiet promises grid)
//   Section (image-and-copy split: "Where we are" + map placeholder)
//   Section (testimonials — horizontal scroll on mobile, grid on tablet+)
//   Section (CTA banner → /booking/search)

import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";
import { Button } from "@/components/site/Button";

import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: "About — Hôtel du Lac, Béjaïa",
  description:
    "A modern, calm hotel on the edge of Lac Mézaïa, in the very heart of Béjaïa. Rated 4.3/5 by more than 400 guests — for the breakfast, the cleanliness, and the location.",
};

// 86% fill ≈ 4.3 / 5, mirrors About.tsx Stars component.
function Stars() {
  return (
    <span
      className="relative inline-flex text-[13px] leading-none tracking-[0.1em] select-none"
      aria-hidden
    >
      <span className="text-ink/15">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden text-marine"
        style={{ width: "86%" }}
      >
        ★★★★★
      </span>
    </span>
  );
}

const aboutStats = [
  { value: "4.3", label: "Guest rating", stars: true },
  { value: hotel.numbers.rooms.toString(), label: "Rooms & suites" },
  { value: `${hotel.numbers.eventsHallSqm} m²`, label: "Events hall" },
  { value: "Lac Mézaïa", label: "On the lakefront" },
];

const beliefs = [
  {
    title: "Calm at the centre",
    body: "« Le Calme au Centre Ville » — the brand line we keep. A quiet refuge inside the city, not a drive away, with the lake and the mountain at the window.",
  },
  {
    title: "Welcome at any hour",
    body: "A 24-hour reception, multilingual desk (Arabic, French, English), and a team that knows the city well — for business or for family, the same warm welcome.",
  },
  {
    title: "Direct, honest booking",
    body: "We answer the desk ourselves. Direct rates, no surprises at check-in, clean documentation. The shortest path between you and a confirmed room.",
  },
];

// Real testimonials only — from §10.8 of the demo content pack. No synthesized
// ones (the doc clearly marks them and asks for the real ones).
const testimonials = [
  {
    quote:
      "My highlight is definitely the breakfast — fresh fruits and good pastries.",
    source: "Guest review · ZenHotels / Expedia pool",
  },
  {
    quote:
      "Super hotel, very clean, very comfortable room — exactly as in the photos, and a hearty breakfast.",
    source: "Guest review",
  },
  {
    quote: "L'emplacement de l'hôtel est parfait, proche de tout.",
    translation: "The location is perfect, close to everything.",
    source: "Guest review",
  },
  {
    quote:
      "L'accueil était chaleureux, le personnel très professionnel… Je reviendrai avec grand plaisir.",
    translation:
      "A warm welcome, a very professional team… I'll gladly return.",
    source: "Guest review",
  },
  {
    quote: "Well located, family-run hotel, and very quiet.",
    source: "Guest review",
  },
  {
    quote: "Impeccable cleanliness, friendly staff.",
    source: "Guest review",
  },
];

// Google Maps deep-link built from the Plus Code so the link works without
// embedding the iframe (which often needs an API key + allowlist).
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  hotel.address.plusCode,
)}`;

export default function AboutPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="The house on the lake"
        heading="Quiet, central, and yours for the stay"
        description="A modern, 3-star hotel on the edge of Lac Mézaïa, facing Yemma Gouraya — built around a single promise: clean, comfortable, calm, with a warm welcome at any hour."
        image="/images/exhibit-suite-dawn.jpg"
        imageAlt="Dawn light over Lac Mézaïa, seen from a Hôtel du Lac suite"
      />

      {/* STORY — narrow editorial column. */}
      <Section tone="white" size="default" maxWidth="narrow">
        <SectionHeading
          eyebrow="The house"
          heading="A modern hotel, kept quiet"
        />
        <div className="mt-7 md:mt-9 flex flex-col gap-6 font-sans font-normal text-[16px] md:text-[17px] leading-[1.75] md:leading-[1.8] text-graybase">
          <p>
            Hôtel du Lac sits in the <span className="text-ink">Aamriou</span>{" "}
            district, in the very heart of Béjaïa, with the rare calm of a lake
            at its doorstep. One hundred and twenty-four modern rooms look out
            over <span className="text-ink">Lac Mézaïa</span> and the green
            slopes of <span className="text-ink">Gouraya</span> — close to the
            seafront, the market and the old town, yet held a step apart from
            the noise.
          </p>
          <p>
            For business or for family, the promise is the same: clean,
            comfortable, and calm, with a warm welcome at any hour. Rated{" "}
            <span className="text-ink">4.3/5 by more than 400 guests</span>,
            most often for the breakfast, the cleanliness, and a location that
            puts all of Béjaïa within reach.
          </p>
          <p className="font-display italic text-[19px] md:text-[22px] leading-[1.5] text-ink text-balance">
            « Le Calme au Centre Ville. »
          </p>
        </div>
      </Section>

      {/* 4-STAT BAND — fuller version of About.tsx as a standalone section. */}
      <Section tone="cream" grain size="compact">
        <div className="max-w-[1100px] mx-auto border-y border-ink/15">
          <ul className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-0 sm:gap-x-14 sm:gap-y-7 py-8 sm:py-12 md:py-14">
            {aboutStats.map((s, i) => (
              <li
                key={s.label}
                className={`text-center py-4 sm:py-0 px-2 sm:px-0 ${
                  i % 2 === 1 ? "sm:border-0 border-l border-ink/15" : ""
                } ${i >= 2 ? "sm:border-0 border-t border-ink/15" : ""}`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  <span className="font-display font-medium text-[26px] sm:text-[32px] md:text-[40px] leading-none tracking-tight text-ink">
                    {s.value}
                  </span>
                  {s.stars ? <Stars /> : null}
                </div>
                <p className="mt-3 font-sans text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] text-ink/55">
                  {s.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* WHAT WE BELIEVE — 3 promises in a 3-up grid. */}
      <Section tone="white" size="default">
        <SectionHeading
          eyebrow="What we believe"
          heading="Three quiet promises"
          description="No five-star theatrics. Three simple things, kept steadily, are what guests return for."
        />

        <ul className="mt-10 md:mt-14 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
          {beliefs.map((b, i) => (
            <li
              key={b.title}
              className="flex flex-col border-t border-marine/30 pt-6 md:pt-8"
            >
              <p className="font-display text-[12px] tabular-nums text-marine tracking-tight">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display font-medium text-[22px] md:text-[26px] tracking-tight leading-tight text-ink text-balance">
                {b.title}
              </h3>
              <p className="mt-4 font-sans text-[14px] md:text-[15px] leading-[1.7] text-graybase">
                {b.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* WHERE WE ARE — image-and-copy split. Map placeholder + Plus Code +
          Google Maps deep-link. */}
      <Section tone="cream" grain size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Copy column — order-1 mobile (lead with the headline), order-2 desktop. */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <SectionHeading
              eyebrow="Where we are"
              heading="In the heart of Béjaïa, on the edge of the lake"
              description="We're in the Aamriou district of central Béjaïa, a step from the seafront and minutes from Soummam–Abane Ramdane airport. Gouraya National Park, Cap Carbon, the old Casbah and the Corniche beaches are all within easy reach — and Lac Mézaïa is right outside the window."
            />

            <ul className="mt-8 md:mt-10 flex flex-col gap-3 md:gap-4">
              {hotel.distances.map((d) => (
                <li
                  key={d.label}
                  className="flex items-baseline gap-4 border-t border-ink/15 pt-3"
                >
                  <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55 max-w-[60%]">
                    {d.label}
                  </span>
                  <span className="ml-auto font-sans tabular-nums text-[14px] md:text-[15px] text-ink text-right">
                    {d.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Map placeholder column — order-2 mobile, order-1 desktop. */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            {/* TODO: confirm OSM / Google embed allowed; until then, a styled
                placeholder with the Plus Code and an "Open in Google Maps"
                link does the same job without an API key. */}
            <div className="relative overflow-hidden bg-white border border-ink/15 aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3]">
              {/* Decorative hatched grid that suggests a city plan. */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, transparent 49.5%, var(--color-marine) 49.5%, var(--color-marine) 50.5%, transparent 50.5%), linear-gradient(90deg, transparent 49.5%, var(--color-marine) 49.5%, var(--color-marine) 50.5%, transparent 50.5%)",
                  backgroundSize: "44px 44px",
                }}
              />
              {/* Suggested lake-edge curve. */}
              <svg
                aria-hidden
                viewBox="0 0 400 320"
                className="absolute inset-0 w-full h-full text-marine/55"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 220 C 100 200, 180 180, 240 200 S 360 250, 400 240"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M 0 220 C 100 200, 180 180, 240 200 S 360 250, 400 240 L 400 320 L 0 320 Z"
                  fill="currentColor"
                  opacity="0.08"
                />
              </svg>
              {/* Pin */}
              <div className="absolute left-[42%] top-[44%] flex flex-col items-center">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-marine/40" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-marine" />
                </span>
                <span className="mt-2 inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 border border-ink/10 font-display text-[12px] font-semibold text-ink shadow-sm">
                  Hôtel du Lac
                </span>
              </div>

              {/* Footer ribbon with the Plus Code + open-in-maps. */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/95 backdrop-blur-sm border-t border-ink/10 px-4 sm:px-5 py-3.5">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55">
                    Plus Code
                  </p>
                  <p className="mt-1 font-display tabular-nums text-[14px] text-ink">
                    {hotel.address.plusCode}
                  </p>
                </div>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-marine hover:text-marine/80 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine rounded-sm"
                >
                  Open in Google Maps
                  <ExternalLink className="h-3 w-3" strokeWidth={2.25} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS — horizontal scroll on mobile, 2-col tablet, 3-col desktop. */}
      <Section tone="white" size="default">
        <SectionHeading
          eyebrow="What guests remember"
          heading="In their own words"
          description="Real reviews, lightly tidied; attributions kept generic. The recurring themes are the breakfast, the cleanliness, and a quiet location at the centre of everything."
        />

        {/* Mobile: horizontal scroll. Tablet+: grid. */}
        <ul
          className="
            mt-10 md:mt-14 lg:mt-16
            flex gap-4 overflow-x-auto snap-x snap-mandatory
            -mx-4 pl-6 pr-4 pb-3 scroll-pl-6 scroll-smooth
            sm:-mx-6 sm:pl-8 sm:pr-6 sm:scroll-pl-8
            md:mx-0 md:p-0 md:overflow-visible md:snap-none md:scroll-pl-0
            md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          "
        >
          {testimonials.map((t, i) => (
            <li
              key={i}
              className="
                shrink-0 w-[82vw] max-w-[360px] snap-start
                md:shrink md:w-auto md:max-w-none md:snap-align-none
                flex flex-col bg-cream/40 border border-ink/10 p-6 md:p-8
                transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.18)]
              "
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-6 w-6 text-marine/45"
                fill="currentColor"
              >
                {/* Two opening-quote marks. */}
                <path d="M6 7h4v4H8c0 2 1 3 3 3v2c-3 0-5-2-5-5V7zm8 0h4v4h-2c0 2 1 3 3 3v2c-3 0-5-2-5-5V7z" />
              </svg>
              <p className="mt-4 font-display text-[18px] md:text-[20px] leading-[1.4] text-ink text-balance">
                &ldquo;{t.quote}&rdquo;
              </p>
              {t.translation && (
                <p className="mt-3 font-sans italic text-[13.5px] leading-[1.6] text-graybase">
                  {t.translation}
                </p>
              )}
              <p className="mt-auto pt-5 font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                {t.source}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* CLOSING CTA — Plan a stay → /booking/search */}
      <Section tone="ink" grain size="compact">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="max-w-[44ch]">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/55 mb-3">
              Plan a stay
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              When you&apos;re ready, the room is waiting.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              Direct booking, direct rates, the same desk on the line if you
              have a question along the way.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button
              href="/booking/search"
              variant="primary"
              size="default"
              arrow
            >
              Start a booking
            </Button>
            <Button href="/contact" variant="ghost-light" size="default">
              Talk to the desk
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
