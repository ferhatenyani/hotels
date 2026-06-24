// /booking/guest — step 3. Lead-guest details form.
//
// Server Component:
//   - await searchParams. Require room + dates → otherwise redirect to /search.
//   - Look up the room. Build the BookingSummary card for the right column /
//     mobile chip.
//   - Render the client <GuestForm>, which captures details to sessionStorage
//     (NOT URL: PII must never appear in the address bar — see GuestForm.tsx).
//
// On the desktop layout the page is a lg:grid-cols-3 with the form on the
// left (col-span-2) and BookingSummary sticky on the right (col-span-1).
// On mobile, BookingSummary collapses to a tap-to-expand chip at the top
// and the form takes the full width, with a sticky bottom action bar.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  bookingHref,
  isSearchReady,
  searchParamsToBooking,
} from "@/lib/booking/params";
import { getRoomBySlug } from "@/lib/data/rooms";

import Section from "@/components/site/Section";
import BookingSummary, {
  BookingSummaryChip,
} from "@/components/booking/BookingSummary";
import GuestForm from "./GuestForm";
import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: `Vos informations — ${hotel.name}`,
  description:
    "Dites-nous qui vient. Réservation directe — nous confirmons chaque réservation nous-mêmes.",
};

export default async function GuestPage(props: PageProps<"/booking/guest">) {
  const sp = await props.searchParams;
  const q = searchParamsToBooking(sp);

  if (!isSearchReady(q)) redirect(bookingHref("search", q));
  if (!q.roomSlug) redirect(bookingHref("results", q));

  const room = getRoomBySlug(q.roomSlug);
  if (!room) redirect(bookingHref("results", q));

  return (
    <Section tone="white" size="compact">
      <header className="max-w-[44ch]">
          <h1 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance">
            Dites-nous <span className="italic font-normal">qui vient.</span>
          </h1>
          <span
            aria-hidden
            className="mt-5 md:mt-6 block h-px w-14 bg-marine"
          />
          <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase">
            Nous gardons ces informations uniquement pour préparer votre séjour.
          </p>
        </header>

        <div className="mt-8 lg:mt-12 grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Form column — leads on every breakpoint. */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <GuestForm room={room} q={q} />
          </div>

          {/* Summary column — sticky on lg+, expandable chip on mobile. */}
          <div className="order-1 lg:order-2">
            {/* Mobile chip */}
            <div className="lg:hidden mb-2">
              <BookingSummaryChip room={room} q={q} />
            </div>
            {/* Desktop sticky card */}
            <div className="hidden lg:block lg:sticky lg:top-24">
              <BookingSummary room={room} q={q} />
            </div>
          </div>
        </div>
    </Section>
  );
}
