// /booking/review — step 4. Review the whole order + pick add-ons.
//
// Server Component:
//   - Require room + dates in URL. Without them, can't render a meaningful
//     review → redirect to /search.
//   - Render the client <ReviewClient> which:
//       · reads GuestDetails from sessionStorage (`hdl:booking-guest`)
//       · if missing, redirects to /booking/guest
//       · lets the user toggle add-ons (persisted to `hdl:booking-addons`
//         so /payment can read them)
//       · shows the full price breakdown that responds to add-on toggles
//       · CTA → /booking/payment

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  bookingHref,
  isSearchReady,
  searchParamsToBooking,
} from "@/lib/booking/params";
import { getRoomBySlug } from "@/lib/data/rooms";

import Section from "@/components/site/Section";
import ReviewClient from "./ReviewClient";
import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: `Récapitulatif de votre réservation — ${hotel.name}`,
  description:
    "Confirmez les détails et ajoutez quelques suppléments. Réservation directe — nous confirmons chaque réservation nous-mêmes.",
};

export default async function ReviewPage(
  props: PageProps<"/booking/review">,
) {
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
            Un dernier regard{" "}
            <span className="italic font-normal">avant de préparer la chambre.</span>
          </h1>
          <span
            aria-hidden
            className="mt-5 md:mt-6 block h-px w-14 bg-marine"
          />
        </header>

        <ReviewClient room={room} q={q} />
    </Section>
  );
}
