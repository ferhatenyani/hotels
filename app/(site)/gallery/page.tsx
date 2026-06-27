// /gallery — the full browsable expansion of the home Exhibit marquee.
// Server Component wrapper so we can export metadata; the interactive grid
// (filter + lightbox) lives in the client subcomponent.

import type { Metadata } from "next";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";

import { hotel } from "@/lib/data/hotel";

import GalleryGrid from "./GalleryGrid";

export const metadata: Metadata = {
  title: `Galerie — Un coup d'œil · ${hotel.name}, ${hotel.city}`,
  description: `Les chambres, le restaurant, la salle de 498 m² — et la vue à la fenêtre. Parcourez ${hotel.name} en images.`,
};

export default function GalleryPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Un coup d'œil"
        heading="Espaces et coins tranquilles"
        description="À l'intérieur, les chambres, le restaurant et la salle de 498 m² ; à l'extérieur, la ville et ses alentours. Touchez une image pour la voir de plus près."
        image="/images/exhibit-salon.jpg"
        imageAlt={`Un coin tranquille du lobby à ${hotel.name}`}
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
              Envie de voir le reste en vrai ?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-ink text-balance">
              Les chambres — et la vue — se lisent mieux de l'intérieur.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/booking/search"
              className="inline-flex items-center justify-center gap-2 btn-text-sm text-white bg-marine border border-marine rounded-full px-6 py-3.5 min-h-[48px] transition-colors duration-300 ease-out hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
            >
              Vérifier les disponibilités
            </a>
            <a
              href="/rooms"
              className="inline-flex items-center justify-center btn-text-sm text-ink border border-ink/30 rounded-full px-6 py-3.5 min-h-[48px] transition-colors duration-300 ease-out hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              Parcourir les chambres
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
