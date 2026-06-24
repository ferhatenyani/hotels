// /about — la maison en ville, en registre éditorial. Server Component.
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
  title: `À propos — ${hotel.name}, ${hotel.city}`,
  description: `Un hôtel moderne et calme au cœur de ${hotel.city}. Noté 4,3/5 par plus de 400 clients — pour le petit-déjeuner, la propreté et l'emplacement.`,
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
  { value: "4,3", label: "Note des clients", stars: true },
  { value: hotel.numbers.rooms.toString(), label: "Chambres & suites" },
  { value: `${hotel.numbers.eventsHallSqm} m²`, label: "Salle d'événements" },
  { value: "Au cœur", label: "De la ville" },
];

const beliefs = [
  {
    title: "Le calme au centre",
    body: "« Le Calme au Cœur de la Ville » — la ligne que nous gardons. Un refuge tranquille à l'intérieur de la ville, et non à distance, avec la vie urbaine à portée de pas.",
  },
  {
    title: "Accueil à toute heure",
    body: "Une réception ouverte 24h/24, un comptoir multilingue (arabe, français, anglais), et une équipe qui connaît bien la ville — pour un voyage d'affaires ou en famille, le même accueil chaleureux.",
  },
  {
    title: "Une réservation directe et honnête",
    body: "Nous répondons nous-mêmes au comptoir. Tarifs directs, pas de surprise à l'arrivée, documentation claire. Le chemin le plus court entre vous et une chambre confirmée.",
  },
];

// Lien profond Google Maps construit à partir du Plus Code pour que le lien
// fonctionne sans intégrer l'iframe (qui nécessite souvent une clé API + allowlist).
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  hotel.address.plusCode,
)}`;

export default function AboutPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="La maison en ville"
        heading="Calme, central, et à vous le temps du séjour"
        description={`Un hôtel moderne au cœur de ${hotel.city} — pensé autour d'une seule promesse : propre, confortable, calme, avec un accueil chaleureux à toute heure.`}
        image="/images/exhibit-suite-dawn.jpg"
        imageAlt={`Lumière de l'aube depuis une suite de ${hotel.name}`}
      />

      {/* STORY — narrow editorial column. */}
      <Section tone="white" size="default" maxWidth="narrow">
        <SectionHeading
          eyebrow="La maison"
          heading="Un hôtel moderne, gardé tranquille"
        />
        <div className="mt-7 md:mt-9 flex flex-col gap-6 font-sans font-normal text-[16px] md:text-[17px] leading-[1.75] md:leading-[1.8] text-graybase">
          <p>
            {hotel.name} se trouve au cœur de{" "}
            <span className="text-ink">{hotel.city}</span>, avec le calme rare
            d'un quartier paisible à sa porte. Cent vingt-quatre chambres
            modernes donnent sur la ville et ses environs verdoyants — à
            quelques pas des principales adresses, du marché et du centre, tout
            en restant un peu à l'écart du bruit.
          </p>
          <p>
            Pour un voyage d'affaires ou en famille, la promesse est la même :
            propre, confortable et calme, avec un accueil chaleureux à toute
            heure. Noté{" "}
            <span className="text-ink">4,3/5 par plus de 400 clients</span>, le
            plus souvent pour le petit-déjeuner, la propreté et un emplacement
            qui met toute la ville à portée.
          </p>
          <p className="font-display italic text-[19px] md:text-[22px] leading-[1.5] text-ink text-balance">
            « {hotel.tagline}. »
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
          eyebrow="Ce en quoi nous croyons"
          heading="Trois promesses tranquilles"
          description="Pas de théâtre cinq étoiles. Trois choses simples, tenues avec constance, sont ce pour quoi nos hôtes reviennent."
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
              eyebrow="Où nous sommes"
              heading={`Au cœur de ${hotel.city}, à deux pas de tout`}
              description={`Nous sommes au centre de ${hotel.city}, à un pas du front de mer et à quelques minutes de l'aéroport. Le parc naturel, la réserve, la vieille ville et les plages de la corniche sont tous à portée — et la ville est juste à la fenêtre.`}
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
            {/* TODO: confirmer l'autorisation d'intégration OSM / Google ; en
                attendant, un espace réservé stylisé avec le Plus Code et un
                lien « Ouvrir dans Google Maps » fait le même travail sans clé API. */}
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
                  {hotel.shortName}
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
                  Ouvrir dans Google Maps
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
          eyebrow="Ce dont les clients se souviennent"
          heading="Dans leurs propres mots"
          description="Avis réels, légèrement remis au propre ; attributions gardées génériques. Les thèmes récurrents sont le petit-déjeuner, la propreté et un emplacement calme au cœur de tout."
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
              Planifier un séjour
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              Quand vous serez prêt, la chambre vous attend.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              Réservation directe, tarifs directs, le même comptoir au bout du
              fil si vous avez une question en chemin.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button
              href="/booking/search"
              variant="primary"
              size="default"
              arrow
            >
              Commencer une réservation
            </Button>
            <Button href="/contact" variant="ghost-light" size="default">
              Parler à la réception
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}

// Témoignages génériques en français — pas de référence à un hôtel ou lieu réel.
const testimonials = [
  {
    quote:
      "Mon coup de cœur est sans aucun doute le petit-déjeuner — fruits frais et bonnes viennoiseries.",
    source: "Avis client",
  },
  {
    quote:
      "Super hôtel, très propre, chambre très confortable — exactement comme sur les photos, et un copieux petit-déjeuner.",
    source: "Avis client",
  },
  {
    quote: "L'emplacement de l'hôtel est parfait, proche de tout.",
    source: "Avis client",
  },
  {
    quote:
      "L'accueil était chaleureux, le personnel très professionnel… Je reviendrai avec grand plaisir.",
    source: "Avis client",
  },
  {
    quote: "Bien situé, hôtel à taille humaine, et très calme.",
    source: "Avis client",
  },
  {
    quote: "Propreté impeccable, personnel aimable.",
    source: "Avis client",
  },
];
