// /discover-bejaia — concierge picks around the hotel. Server Component.
//
// Archetype: Listing page (CONVENTIONS §11) with editorial wrapping.
//   PageHero
//   Section (opening blurb)
//   Section (filter chip row — client subcomponent, plain list fallback ok)
//   Section (closing CTA banner → /rooms)

import type { Metadata } from "next";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";
import { Button } from "@/components/site/Button";

import { experiences } from "@/lib/data/experiences";

import ExperienceList from "./ExperienceList";

export const metadata: Metadata = {
  title: "Discover Béjaïa — Hôtel du Lac",
  description:
    "Concierge picks around the hotel — Gouraya National Park, Cap Carbon, the Corniche beaches, the Casbah, and the lake at our doorstep.",
};

export default function DiscoverBejaiaPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Around the hotel"
        heading="Discover Béjaïa, from your doorstep"
        description="A small, honest list — the places the desk sends guests, and the ones we'd visit ourselves on a quiet afternoon."
        image="/images/activity-cliff-path.jpg"
        imageAlt="A cliff path above the bay of Béjaïa, in Gouraya National Park"
      />

      {/* OPENING BLURB */}
      <Section tone="white" size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Honestly"
              heading="Concierge picks, not paid tours"
              description="These are real local places, not packages we sell. The hotel is on the doorstep of all of them — most are a short walk or a fifteen-minute drive."
            />
          </div>
          <aside className="lg:col-span-5 lg:pt-2">
            <div className="border border-ink/15 bg-cream/40 p-6 md:p-8">
              <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-marine">
                A note from the desk
              </p>
              <p className="mt-3 font-display text-[18px] md:text-[20px] leading-[1.45] text-ink text-balance">
                Tell us the morning before — we&apos;ll send a taxi, draw you a
                map, or join you for a coffee on Place Gueydon when we&apos;re
                free.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* FILTER CHIPS + GRID — client subcomponent. */}
      <Section tone="cream" grain size="default" id="experiences">
        <SectionHeading
          eyebrow="What's nearby"
          heading="Six places the desk sends guests"
          description="Filter by what you're in the mood for — nature, heritage, coast, or a quiet evening in-house."
        />

        <div className="mt-10 md:mt-14">
          <ExperienceList experiences={experiences} />
        </div>
      </Section>

      {/* CLOSING CTA */}
      <Section tone="ink" grain size="compact">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="max-w-[44ch]">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/55 mb-3">
              Stay close to it all
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              A room on the lake — the city, the park and the coast on the
              doorstep.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              From the hotel you can walk to the seafront, drive to Cap Carbon
              before lunch, and be back for a window seat at dinner.
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
              Start a booking
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
