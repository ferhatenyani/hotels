// /rooms — the catalogue. Server Component. Reads optional booking search
// params (?adults / ?children / ?in / ?out) so the listing can quote the
// chosen stay instead of the bare nightly rate. When the URL is empty we just
// show the full catalogue at standard nightly pricing.
//
// Archetype: Listing page (CONVENTIONS §11).
//   PageHero · short
//   Filter strip (only when a query is present)
//   Grid of RoomCard (mobile: stacked single col, md: 2-col, lg: 3-col)
//   Cross-sell: "Need help choosing?" → /contact

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";
import RoomCard from "@/components/site/RoomCard";
import { Button } from "@/components/site/Button";

import { rooms, getRoomsForParty } from "@/lib/data/rooms";
import {
  searchParamsToBooking,
  bookingToSearchParams,
} from "@/lib/booking/params";
import { computeBreakdown } from "@/lib/booking/pricing";
import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: `Chambres et Suites — ${hotel.name}, ${hotel.city}`,
  description: `Six manières de se reposer chez ${hotel.name}, d'une chambre individuelle à un appartement de 102 m². Chambres avec vue à ${hotel.name}, ${hotel.city}.`,
};

export default async function RoomsPage(props: PageProps<"/rooms">) {
  const sp = await props.searchParams;
  const q = searchParamsToBooking(sp);

  // Filter only when the URL says how many people we're hosting. Otherwise
  // show the full catalogue — the listing is a browse surface first.
  const hasParty = q.adults > 0 || q.children > 0;
  const list = hasParty ? getRoomsForParty(q.adults, q.children) : rooms;

  // If the dates are present, surface a quote on each card so the price
  // reflects the chosen stay, not just the per-night rate.
  const hasDates = Boolean(q.checkIn && q.checkOut);

  // "Change" link back to /booking/search keeping the current query — uses
  // bookingHref so the funnel remembers what the listing already knew.
  const changeQS = bookingToSearchParams(q).toString();
  const changeHref = changeQS
    ? `/booking/search?${changeQS}`
    : "/booking/search";

  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Chambres et Suites"
        heading="Où se reposer, au cœur de la ville"
        description={`Un hôtel moderne au cœur de ${hotel.city} — chaque chambre pensée pour le confort et la tranquillité. Choisissez la forme de votre séjour ; nous gardons la qualité constante.`}
        image="/images/exhibit-suite-dawn.jpg"
        imageAlt={`Lumière de l'aube vue depuis une suite à ${hotel.name}`}
        height="short"
      />

      <Section tone="white" size="default">
        <SectionHeading
          eyebrow={hasParty ? "Filtré pour votre groupe" : "Le catalogue"}
          heading={
            hasParty
              ? `${list.length} chambre${list.length === 1 ? "" : "s"} adaptée${list.length === 1 ? "" : "s"} à votre séjour`
              : "Six chambres, une maison"
          }
          description={
            hasParty
              ? "Nous avons filtré la liste pour ne montrer que les chambres qui accueillent le groupe que vous avez saisi. Ajustez les dates ou le nombre d'invités à tout moment — le reste de la réservation reste en place."
              : "D'une chambre individuelle à un appartement de 102 m², chaque espace est pensé pour le confort. Choisissez celui qui correspond à votre voyage."
          }
        />

        {/* Filter strip — only present when the URL has a real query. */}
        {(hasParty || hasDates) && (
          <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border border-ink/10 bg-cream/40 rounded-2xl px-4 py-3 md:px-5 md:py-4">
            <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              Affiché pour
            </span>
            <span className="font-sans text-[13px] md:text-[14px] text-ink">
              {q.adults} adulte{q.adults === 1 ? "" : "s"}
              {q.children > 0
                ? ` · ${q.children} enfant${q.children === 1 ? "" : "s"}`
                : ""}
            </span>
            {hasDates && q.checkIn && q.checkOut && (
              <>
                <span aria-hidden className="h-3 w-px bg-ink/15" />
                <span className="font-sans text-[13px] md:text-[14px] text-ink">
                  {format(q.checkIn, "d MMM")} →{" "}
                  {format(q.checkOut, "d MMM yyyy")}
                </span>
              </>
            )}
            <Link
              href={changeHref}
              className="ml-auto inline-flex items-center gap-1 min-h-[44px] font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-marine hover:text-marine/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine rounded-sm px-1"
            >
              Modifier
              <ArrowRight className="h-3 w-3" strokeWidth={2.25} />
            </Link>
          </div>
        )}

        {/* Grid. Mobile: single column. Tablet: 2-col. Desktop: 3-col. */}
        {list.length > 0 ? (
          <ul className="mt-10 md:mt-14 lg:mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
            {list.map((room) => {
              const quote =
                hasDates && q.checkIn && q.checkOut
                  ? (() => {
                      const b = computeBreakdown(room, q);
                      return { nights: b.nights, total: b.total };
                    })()
                  : undefined;
              // Funnel-aware primary CTA: preserve the chosen dates/party
              // through to /booking/search so the user doesn't re-enter them.
              const reserveHref = hasParty || hasDates
                ? `/booking/search?${bookingToSearchParams({
                    ...q,
                    roomSlug: room.slug,
                  }).toString()}`
                : `/booking/search?room=${room.slug}`;
              return (
                <li key={room.slug} className="flex">
                  <RoomCard
                    room={room}
                    primaryHref={reserveHref}
                    quote={quote}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 md:mt-14 border border-ink/10 bg-cream/40 rounded-2xl px-6 py-10 md:px-10 md:py-14 text-center">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              Rien ne convient à votre groupe
            </p>
            <p className="mt-3 font-display text-[22px] md:text-[26px] text-ink leading-tight tracking-tight max-w-[28ch] mx-auto text-balance">
              Nous proposons des chambres pour des groupes jusqu&apos;à quatre personnes. Pour des groupes plus importants, notre conciergerie peut mettre deux chambres côte à côte.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/contact" variant="primary" size="default" arrow>
                Parler à la conciergerie
              </Button>
              <Button href={changeHref} variant="secondary" size="default">
                Modifier le groupe
              </Button>
            </div>
          </div>
        )}
      </Section>

      {/* Cross-sell: a soft "we'll pick for you" hand-off. */}
      <Section tone="cream" grain size="compact">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="max-w-[44ch]">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
              Besoin d&apos;aide pour choisir ?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-ink text-balance">
              La conciergerie connaît la maison. Demandez, et nous adapterons la chambre au voyage.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase max-w-[42ch]">
              En déplacement professionnel, en famille ou pour un week-end avec un proche ? Un petit mot et nous vous orienterons vers la bonne chambre — et la garderons pendant votre décision.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button href="/contact" variant="primary" size="default" arrow>
              Parler à la conciergerie
            </Button>
            <Button href="/booking/search" variant="secondary" size="default">
              Démarrer une réservation
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
