// /booking/results — step 2. List rooms available for the parsed search.
//
// Server Component:
//   1. await searchParams, parse with searchParamsToBooking.
//   2. If !isSearchReady → redirect to /booking/search preserving the partial
//      query (so the user picks up where they left off).
//   3. Filter rooms by party size via getRoomsForParty.
//   4. For each room compute the breakdown and render <RoomCard quote=…>.
//   5. If ?room=… is in URL, surface that one first (highlighted).
//   6. Empty state if the party doesn't fit any single room.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ArrowRight, BedDouble, BadgeCheck } from "lucide-react";

import Section from "@/components/site/Section";
import RoomCard from "@/components/site/RoomCard";
import { Button } from "@/components/site/Button";

import {
  bookingHref,
  bookingToSearchParams,
  isSearchReady,
  searchParamsToBooking,
} from "@/lib/booking/params";
import { computeBreakdown } from "@/lib/booking/pricing";
import { getRoomsForParty } from "@/lib/data/rooms";
import { getOfferByPromoCode } from "@/lib/data/offers";
import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: "Choose your room — Hôtel du Lac",
  description:
    "Rooms available for your stay at Hôtel du Lac. Direct booking — we confirm every reservation ourselves.",
};

export default async function ResultsPage(
  props: PageProps<"/booking/results">,
) {
  const sp = await props.searchParams;
  const q = searchParamsToBooking(sp);

  if (!isSearchReady(q)) {
    redirect(bookingHref("search", q));
  }

  // Sort: if ?room is present, lift it to the top (highlighted).
  const matching = getRoomsForParty(q.adults, q.children);
  const sorted = q.roomSlug
    ? [...matching].sort((a, b) => {
        if (a.slug === q.roomSlug) return -1;
        if (b.slug === q.roomSlug) return 1;
        return 0;
      })
    : matching;

  const promoOffer = q.promo ? getOfferByPromoCode(q.promo) : undefined;
  const partySize = q.adults + q.children;

  const modifySearchHref = bookingHref("search", q);

  return (
    <Section tone="white" size="compact">
      <header className="max-w-[44ch]">
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
          Step 2 · Choose room
        </p>
        <h1 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance">
          {sorted.length > 0
            ? `${sorted.length} room${sorted.length === 1 ? "" : "s"} for your stay`
            : "No room sleeps your party"}
        </h1>
        <span aria-hidden className="mt-5 md:mt-6 block h-px w-14 bg-marine" />
      </header>

      {/* Modify search chip-row */}
      <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border border-ink/10 bg-cream/40 rounded-2xl px-4 py-3 md:px-5 md:py-4">
        <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          Showing for
        </span>
        {q.checkIn && q.checkOut && (
          <span className="font-sans text-[13px] md:text-[14px] text-ink">
            {format(q.checkIn, "d MMM")} → {format(q.checkOut, "d MMM yyyy")}
          </span>
        )}
        <span aria-hidden className="h-3 w-px bg-ink/15" />
        <span className="font-sans text-[13px] md:text-[14px] text-ink">
          {q.adults} adult{q.adults === 1 ? "" : "s"}
          {q.children > 0
            ? ` · ${q.children} child${q.children === 1 ? "" : "ren"}`
            : ""}
        </span>
        {promoOffer && (
          <>
            <span aria-hidden className="h-3 w-px bg-ink/15" />
            <span className="inline-flex items-center gap-1.5 font-sans text-[12px] text-marine">
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              {promoOffer.name}
            </span>
          </>
        )}
        <Link
          href={modifySearchHref}
          className="ml-auto inline-flex items-center gap-1 min-h-[44px] font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-marine hover:text-marine/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine rounded-sm px-1"
        >
          Modify search
          <ArrowRight className="h-3 w-3" strokeWidth={2.25} />
        </Link>
      </div>

      {/* Grid */}
      {sorted.length > 0 ? (
        <ul className="mt-8 md:mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8 pb-24 md:pb-0">
          {sorted.map((room) => {
            const breakdown = computeBreakdown(room, q);
            const reserveHref = bookingHref("guest", {
              ...q,
              roomSlug: room.slug,
            });
            const isHighlighted = room.slug === q.roomSlug;
            return (
              <li key={room.slug} className="flex relative">
                {isHighlighted && (
                  <span className="absolute -top-3 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-marine text-white px-3 py-1 font-sans text-[10px] uppercase tracking-[0.2em] shadow-md">
                    <BedDouble
                      className="h-3 w-3"
                      strokeWidth={2}
                      aria-hidden
                    />
                    Your pick
                  </span>
                )}
                <RoomCard
                  room={room}
                  primaryHref={reserveHref}
                  primaryLabel="Book"
                  secondaryHref={`/rooms/${room.slug}`}
                  secondaryLabel="View room"
                  quote={{
                    nights: breakdown.nights,
                    total: breakdown.total,
                  }}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 md:mt-10 border border-ink/10 bg-cream/40 rounded-2xl px-6 py-12 md:px-10 md:py-16 text-center">
          <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            Nothing fits your party
          </p>
          <p className="mt-3 font-display text-[22px] md:text-[28px] text-ink leading-tight tracking-tight max-w-[36ch] mx-auto text-balance">
            No room sleeps {partySize} guests. Try splitting across two rooms,
            or contact us — we&apos;ll arrange adjoining rooms by hand.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/contact" variant="primary" size="default" arrow>
              Talk to the concierge
            </Button>
            <Button href={modifySearchHref} variant="secondary" size="default">
              Change party
            </Button>
            <a
              href={`tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-marine border border-marine/30 rounded-full px-5 py-2.5 min-h-[44px] hover:bg-marine hover:text-white transition-colors"
            >
              Call {hotel.contact.phonePrimary}
            </a>
          </div>
        </div>
      )}
    </Section>
  );
}
