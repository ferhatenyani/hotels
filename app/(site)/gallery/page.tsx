// /gallery — the full browsable expansion of the home Exhibit marquee.
// Server Component wrapper so we can export metadata; the interactive grid
// (filter + lightbox) lives in the client subcomponent.

import type { Metadata } from "next";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";

import GalleryGrid from "./GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery — A look around · Hôtel du Lac, Béjaïa",
  description:
    "The rooms, the restaurant, the 498 m² hall — and the lake at the window. Browse Hôtel du Lac Béjaïa in pictures.",
};

export default function GalleryPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="A look around"
        heading="Spaces and quiet corners"
        description="Inside the rooms, the restaurant and the 498 m² hall; outside, the lake and Yemma Gouraya. Tap any image to take a closer look."
        image="/images/exhibit-salon.jpg"
        imageAlt="A quiet corner of the lobby at Hôtel du Lac"
        height="short"
      />

      <Section tone="white" size="default" maxWidth="wide">
        <GalleryGrid />
      </Section>

      {/* Closing CTA — quietly point toward the booking flow. */}
      <Section tone="cream" grain size="compact">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="max-w-[44ch]">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
              Want to see the rest in person?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-ink text-balance">
              The rooms — and the view — read better from the inside.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/booking/search"
              className="inline-flex items-center justify-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white bg-marine border border-marine rounded-full px-6 py-3.5 min-h-[48px] transition-colors duration-300 ease-out hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
            >
              Check availability
            </a>
            <a
              href="/rooms"
              className="inline-flex items-center justify-center font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink border border-ink/30 rounded-full px-6 py-3.5 min-h-[48px] transition-colors duration-300 ease-out hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              Browse rooms
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
