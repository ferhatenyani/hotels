// /decouvrir — recommandations du concierge autour de l'hôtel.
// Server Component.
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

import { hotel } from "@/lib/data/hotel";
import { experiences } from "@/lib/data/experiences";

import ExperienceList from "./ExperienceList";

export const metadata: Metadata = {
  title: `Découvrir la région — ${hotel.name}`,
  description:
    "Recommandations du concierge autour de l'hôtel — parc naturel, cap historique, plages de la corniche, vieille ville et réserve naturelle au pas de la porte.",
};

export default function DecouvrirPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Autour de l'hôtel"
        heading="Découvrir la région, depuis votre porte"
        description="Une petite liste honnête — les lieux que la réception recommande à nos hôtes, et ceux que nous irions voir nous-mêmes un après-midi tranquille."
        image="/images/activity-cliff-path.jpg"
        imageAlt="Un sentier panoramique au-dessus de la baie, dans le parc naturel"
      />

      {/* OPENING BLURB */}
      <Section tone="white" size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="En toute honnêteté"
              heading="Recommandations du concierge, pas d'excursions payantes"
              description="Ce sont de vrais lieux locaux, pas des forfaits que nous vendons. L'hôtel est au seuil de chacun d'eux — la plupart sont à courte marche ou à un quart d'heure en voiture."
            />
          </div>
          <aside className="lg:col-span-5 lg:pt-2">
            <div className="border border-ink/15 bg-cream/40 p-6 md:p-8">
              <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-marine">
                Un mot de la réception
              </p>
              <p className="mt-3 font-display text-[18px] md:text-[20px] leading-[1.45] text-ink text-balance">
                Dites-le-nous la veille au matin — nous appellerons un taxi,
                nous vous dessinerons un plan, ou nous viendrons partager un
                café avec vous sur la place centrale si nous sommes libres.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* FILTER CHIPS + GRID — client subcomponent. */}
      <Section tone="cream" grain size="default" id="experiences">
        <SectionHeading
          eyebrow="À proximité"
          heading="Six lieux que la réception recommande"
          description="Filtrez selon vos envies — nature, patrimoine, côte ou une soirée tranquille à l'hôtel."
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
              Rester au plus près
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              Une chambre au cœur de la ville — la nature, le patrimoine et la
              côte au seuil.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              Depuis l'hôtel, vous pouvez marcher jusqu'au front de mer,
              partir vers le cap avant le déjeuner, et être de retour pour une
              place près de la fenêtre au dîner.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button href="/rooms" variant="primary" size="default" arrow>
              Voir les chambres
            </Button>
            <Button
              href="/booking/search"
              variant="ghost-light"
              size="default"
            >
              Commencer une réservation
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
