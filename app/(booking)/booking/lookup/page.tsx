// /booking/lookup — find a reservation by ref + email (no real auth).
//
// Server page is a thin shell — the form is a client component because the
// search runs against localStorage on the current device. The StepRail
// hides itself for /lookup (it's not part of the linear funnel).

import type { Metadata } from "next";

import Section from "@/components/site/Section";
import LookupForm from "./LookupForm";

export const metadata: Metadata = {
  title: "Find your booking — Hôtel du Lac",
  description:
    "Look up a reservation by reference and email. Direct booking — we confirm every booking ourselves.",
};

export default function LookupPage() {
  return (
    <Section tone="white" size="compact" maxWidth="narrow">
      {/* /lookup sits outside the linear funnel (StepRail hides itself
          there), so the eyebrow stays — it provides the context StepRail
          would have. */}
      <header className="max-w-[44ch]">
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
          Find your booking
        </p>
        <h1 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance">
          Look up{" "}
          <span className="italic font-normal">a reservation.</span>
        </h1>
        <span aria-hidden className="mt-5 md:mt-6 block h-px w-14 bg-marine" />
        <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase">
          Bookings live on the device they were made on. Enter your reference
          and the email you used — or call the desk and we&apos;ll find you.
        </p>
      </header>

      <div className="mt-8 md:mt-12">
        <LookupForm />
      </div>
    </Section>
  );
}
