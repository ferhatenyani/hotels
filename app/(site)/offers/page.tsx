// /offers — the seasonal package catalogue. Server Component. Each card carries
// a promoCode that, when picked up by /booking/search via ?promo=…, surfaces in
// the funnel and breakdown. Pure URL state — no client wiring needed here.
//
// Archetype: Listing page (CONVENTIONS §11) — PageHero short, grid, "how it
// works" reassurance row, closing cross-sell.

import type { Metadata } from "next";
import Image from "next/image";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";
import { Button } from "@/components/site/Button";

import { offers } from "@/lib/data/offers";
import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: `Offres — Restez plus longtemps, économisez un peu plus · ${hotel.name}, ${hotel.city}`,
  description: `Forfaits saisonniers à ${hotel.name}, ${hotel.city} — longs week-ends, séjours en famille, milieu de semaine en affaires et blocs de chambres pour les mariages. Réservez en direct pour le meilleur tarif.`,
};

// Reassurance row — three quick promises so visitors don't have to read all
// the conditions before they trust the offer mechanic.
const howItWorks: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Appliqué à la réservation",
    body: "Touchez l'offre. Le code vous accompagne jusqu'à l'écran de réservation et s'applique automatiquement — pas de copier-coller depuis une newsletter.",
  },
  {
    n: "02",
    title: "Sous réserve de disponibilité",
    body: "Les offres s'appliquent à certaines chambres et à des fenêtres de dates. Si la chambre souhaitée n'est pas disponible à ces dates, la réception vous proposera une alternative proche.",
  },
  {
    n: "03",
    title: "Annulation jusqu'à 48 h avant",
    body: "Les tarifs standards restent librement annulables jusqu'à quarante-huit heures avant l'arrivée. Les tarifs non remboursables sont clairement signalés avant confirmation.",
  },
];

export default function OffersPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Offres"
        heading="Restez un peu plus longtemps, économisez un peu plus"
        description="Une poignée de forfaits saisonniers — pour le long week-end, le voyage en famille, la semaine d'affaires et le mariage. Chacun s'applique à l'étape de réservation ; aucun code à retenir."
        image="/images/exhibit-corner-suite.jpg"
        imageAlt={`Une suite d'angle à ${hotel.name}`}
        height="short"
      />

      <Section tone="white" size="default">
        <SectionHeading
          eyebrow="Forfaits actuels"
          heading={`${offers.length} façons de rendre le séjour plus doux`}
          description="Toutes les offres sont réservables en direct sur ce site. Le prix affiché est le prix à la réception — pas de surprise via un tiers."
        />

        <ul className="mt-10 md:mt-14 lg:mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
          {offers.map((offer) => {
            const shownPerks = offer.perks.slice(0, 4);
            const extra = offer.perks.length - shownPerks.length;
            const reserveHref = `/booking/search?promo=${encodeURIComponent(offer.promoCode)}`;
            return (
              <li key={offer.slug} className="flex">
                <article className="offer-card group/card flex flex-col w-full bg-white border border-ink/10 overflow-hidden transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)] hover:border-ink/15 focus-within:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)]">
                  <a
                    href={`/offers/${offer.slug}`}
                    className="block relative overflow-hidden h-[210px] md:h-[230px] lg:h-[260px]"
                    aria-label={`En savoir plus sur ${offer.name}`}
                  >
                    <Image
                      src={offer.image}
                      alt={offer.imageAlt}
                      width={1200}
                      height={900}
                      loading="lazy"
                      sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 30vw"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
                    />
                    {/* Discount chip — top-left so it doesn't compete with image focal point. */}
                    <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-marine text-white px-3.5 py-1.5 font-sans text-[10.5px] font-semibold uppercase tracking-[0.18em] shadow-sm">
                      {offer.discountLabel}
                    </span>
                    {/* Season hint — bottom-right small caps. */}
                    <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/80">
                      {offer.seasonHint}
                    </span>
                  </a>

                  <div className="flex flex-col flex-1 p-5 md:p-7 lg:p-8">
                    <h3 className="font-display font-semibold leading-tight tracking-tight text-ink text-[20px] md:text-[24px]">
                      <a
                        href={`/offers/${offer.slug}`}
                        className="hover:text-marine transition-colors"
                      >
                        {offer.name}
                      </a>
                    </h3>
                    <p className="mt-2.5 md:mt-3 font-display italic text-graybase text-[14px] md:text-[15px] leading-[1.6]">
                      {offer.tagline}
                    </p>
                    <p className="mt-3 md:mt-4 font-sans font-normal text-graybase text-[14px] md:text-[15px] leading-[1.65] md:leading-[1.7]">
                      {offer.description}
                    </p>

                    {/* Perks ledger — bullet list with a thin marine rule above. */}
                    <ul className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-ink/10 flex flex-col gap-2.5">
                      {shownPerks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-start gap-2.5 font-sans text-[13.5px] md:text-[14px] leading-[1.5] text-ink"
                        >
                          <span
                            aria-hidden
                            className="mt-[7px] inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-marine"
                          />
                          <span>{perk}</span>
                        </li>
                      ))}
                      {extra > 0 && (
                        <li className="font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-marine pl-[15px]">
                          +{extra} de plus
                        </li>
                      )}
                    </ul>

                    {/* Conditions — small caps, quietly stated. */}
                    {offer.conditions.length > 0 && (
                      <p className="mt-5 font-sans text-[10px] uppercase tracking-[0.2em] text-ink/55 leading-[1.7]">
                        {offer.conditions.join(" · ")}
                      </p>
                    )}

                    <div className="mt-auto pt-6 md:pt-7 flex flex-wrap items-center gap-2">
                      <Button
                        href={reserveHref}
                        variant="primary"
                        size="default"
                        arrow
                        className="flex-1 min-w-[200px]"
                      >
                        Réserver avec cette offre
                      </Button>
                      {offer.related && (
                        <Button
                          href={offer.related.href}
                          variant="ghost"
                          size="default"
                        >
                          {offer.related.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* How offers work — three quick promises. */}
      <Section tone="cream" grain size="compact">
        <SectionHeading
          eyebrow="Comment fonctionnent les offres"
          heading="Trois petites promesses"
          description="Chaque offre s'intègre au parcours de réservation standard sans friction. Voici ce à quoi vous attendre."
        />
        <ol className="mt-10 md:mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {howItWorks.map((step) => (
            <li
              key={step.n}
              className="flex flex-col gap-4 border-t border-ink/15 pt-5"
            >
              <span className="font-display text-[13px] text-marine tabular-nums tracking-tight">
                {step.n}
              </span>
              <h3 className="font-display font-medium text-[20px] md:text-[22px] leading-tight tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="font-sans text-[14px] md:text-[15px] leading-[1.7] text-graybase">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Closing CTA banner — hand-off to the contact desk. */}
      <Section tone="ink" grain size="compact">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="max-w-[44ch]">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/55 mb-3">
              Vous hésitez ?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              Dites-nous la forme du voyage — nous vous orienterons vers le bon forfait.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              Un long week-end, une famille de cinq, une équipe en déplacement pour la semaine, le mariage d&apos;un cousin — écrivez une phrase, nous vous répondrons.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button href="/contact" variant="ghost-light" size="default" arrow>
              Écrire à la réception
            </Button>
            <Button
              href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`}
              variant="primary"
              size="default"
            >
              Appeler · {hotel.contact.phonePrimary}
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
