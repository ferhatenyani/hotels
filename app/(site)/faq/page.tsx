// /faq — questions, answered. Server Component wrapper; the search +
// accordion + sticky group rail live in the client subcomponent so the page
// can still export metadata.
//
// Archetype: editorial (long-read) — narrow column on desktop with a sticky
// nav rail on lg, no rail on mobile.

import type { Metadata } from "next";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import { Button } from "@/components/site/Button";

import { hotel } from "@/lib/data/hotel";

import FAQAccordion from "./FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ — Good to know · Hôtel du Lac, Béjaïa",
  description:
    "Arrival, parking, breakfast, the hall, cancellation, the document policy — what to expect when you stay at Hôtel du Lac in Béjaïa.",
};

export default function FAQPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Good to know"
        heading="Questions, answered"
        description="Six clusters of the things guests ask most. If the answer you want isn't here, the desk is one telephone call away."
        image="/images/exhibit-salon.jpg"
        imageAlt="A quiet corner of the lobby at Hôtel du Lac"
        height="short"
      />

      <Section tone="white" size="default">
        <FAQAccordion />
      </Section>

      {/* Closing CTA — phone + email, plainly. */}
      <Section tone="cream" grain size="compact">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="max-w-[44ch]">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
              Still wondering about something?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-ink text-balance">
              Call the desk, write a letter — either lands on the same table.
            </h2>
            <p className="mt-5 font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase max-w-[42ch]">
              We&apos;d rather answer one question now than have you wonder
              about it on the night.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button
              href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`}
              variant="primary"
              size="default"
              arrow
            >
              Call · {hotel.contact.phonePrimary}
            </Button>
            <Button
              href={`mailto:${hotel.contact.email}`}
              variant="ghost"
              size="default"
            >
              Email the desk
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
