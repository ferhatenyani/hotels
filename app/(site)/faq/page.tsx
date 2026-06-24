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
  title: `FAQ — Bon à savoir · ${hotel.name}, ${hotel.city}`,
  description: `Arrivée, parking, petit-déjeuner, salle, annulation, politique des justificatifs — ce qui vous attend lors de votre séjour à ${hotel.name}, ${hotel.city}.`,
};

export default function FAQPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Bon à savoir"
        heading="Questions, réponses"
        description="Six groupes regroupant les questions que les clients posent le plus. Si la réponse que vous cherchez n'y figure pas, la réception est à un appel téléphonique."
        image="/images/exhibit-salon.jpg"
        imageAlt={`Un coin tranquille du lobby à ${hotel.name}`}
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
              Une question subsiste ?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-ink text-balance">
              Appelez la réception, écrivez-nous — tout arrive sur le même bureau.
            </h2>
            <p className="mt-5 font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase max-w-[42ch]">
              Nous préférons répondre à une question maintenant plutôt que de vous laisser y penser le soir venu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button
              href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`}
              variant="primary"
              size="default"
              arrow
            >
              Appeler · {hotel.contact.phonePrimary}
            </Button>
            <Button
              href={`mailto:${hotel.contact.email}`}
              variant="ghost"
              size="default"
            >
              Écrire à la réception
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
