// /booking/payment — step 5. Mocked card form. CLEARLY DEMO ONLY.
//
// Server Component:
//   - Require room + dates in URL → else redirect to /search.
//   - Hand off to <PaymentClient> which reads guest + add-ons from
//     sessionStorage. If missing, the client bounces to the right step.
//   - On submit, the client generates a booking ref, persists the booking
//     snapshot to localStorage under `hdl:bookings`, then routes to
//     /booking/confirmation/[ref].

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  bookingHref,
  isSearchReady,
  searchParamsToBooking,
} from "@/lib/booking/params";
import { getRoomBySlug } from "@/lib/data/rooms";

import Section from "@/components/site/Section";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: "Payment — Hôtel du Lac",
  description:
    "Secure (demo) payment. Direct booking — we confirm every reservation ourselves.",
};

export default async function PaymentPage(
  props: PageProps<"/booking/payment">,
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
            Confirm,{" "}
            <span className="italic font-normal">and we&apos;ll set the room.</span>
          </h1>
          <span
            aria-hidden
            className="mt-5 md:mt-6 block h-px w-14 bg-marine"
          />
        </header>

        <PaymentClient room={room} q={q} />
    </Section>
  );
}
