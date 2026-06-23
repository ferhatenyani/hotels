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

export const metadata: Metadata = {
  title: "Offers — Stay longer, save a little more · Hôtel du Lac, Béjaïa",
  description:
    "Seasonal packages at Hôtel du Lac, Béjaïa — long weekends on the lake, family stays, business midweek, and wedding-party room blocks. Book direct for the best rate.",
};

// Reassurance row — three quick promises so visitors don't have to read all
// the conditions before they trust the offer mechanic.
const howItWorks: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Apply at booking",
    body: "Tap the offer. The code travels with you to the booking screen and is applied automatically — no copy-pasting from a newsletter.",
  },
  {
    n: "02",
    title: "Subject to availability",
    body: "Offers run on selected rooms and date windows. If the room you want isn't available on those dates, the desk will quote you a close alternative.",
  },
  {
    n: "03",
    title: "Cancel up to 48 h before",
    body: "Standard rates remain freely cancellable up to forty-eight hours before arrival. Non-refundable rates are clearly flagged before you confirm.",
  },
];

export default function OffersPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Offers"
        heading="Stay a little longer, save a little more"
        description="A handful of seasonal packages — for the long weekend, the family trip, the business week, and the wedding party. Each one applies at the booking step; no codes to remember."
        image="/images/exhibit-corner-suite.jpg"
        imageAlt="A lake-view corner suite at Hôtel du Lac"
        height="short"
      />

      <Section tone="white" size="default">
        <SectionHeading
          eyebrow="Current packages"
          heading={`${offers.length} ways to make the stay sweeter`}
          description="All offers are bookable direct on this site. The price you see is the price at the desk — no third-party surprises."
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
                    aria-label={`Read more about ${offer.name}`}
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
                          +{extra} more
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
                        Reserve with this offer
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
          eyebrow="How offers work"
          heading="Three small promises"
          description="Each offer is built to slot into the standard booking flow without friction. Here's what to expect."
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
              Not sure which fits?
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              Tell the desk the shape of the trip — we&apos;ll point you to the
              right package.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              A long weekend, a family of five, a business team for the week,
              the wedding of a cousin — write a sentence, we&apos;ll write
              back.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button href="/contact" variant="ghost-light" size="default" arrow>
              Write to the desk
            </Button>
            <Button
              href="tel:+21344202022"
              variant="primary"
              size="default"
            >
              Call · +213 44 20 20 22
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
