// /offers/[slug] — offer detail page. Server Component. Static-generated for
// every offer in the catalogue; notFound() if someone deep-links a slug we
// don't carry. Pairs the offer with a couple of rooms the offer "fits" so
// the conversation moves naturally from "I like this deal" → "I want this
// room with this deal".
//
// Archetype: Detail page (CONVENTIONS §11) — PageHero with the offer image,
// breadcrumb, the long description, perks ledger, conditions, big book CTA,
// then a related rooms rail.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";
import Breadcrumb from "@/components/site/Breadcrumb";
import RoomCard from "@/components/site/RoomCard";
import { Button } from "@/components/site/Button";

import { offers, getOfferBySlug } from "@/lib/data/offers";
import { rooms, getRoomBySlug } from "@/lib/data/rooms";
import { hotel } from "@/lib/data/hotel";

// Mapping from offer slug → suggested room slugs to surface in the
// "Pairs nicely with" rail. Hand-picked so the recommendation reads as
// editorial, not algorithmic — e.g. the family stay highlights the family
// and apartment rooms.
const offerToRoomSlugs: Record<string, string[]> = {
  "long-week-end": ["suite-senior", "chambre-double-vue"],
  "sejour-famille": ["chambre-familiale", "appartement"],
  "affaires-semaine": ["chambre-double-vue", "chambre-single"],
  "pack-mariage": ["suite-senior", "appartement"],
};

export function generateStaticParams() {
  return offers.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata(
  props: PageProps<"/offers/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const offer = getOfferBySlug(slug);
  if (!offer) {
    return {
      title: `Offre introuvable — ${hotel.name}, ${hotel.city}`,
    };
  }
  return {
    title: `${offer.name} — Offres · ${hotel.name}, ${hotel.city}`,
    description: offer.description,
    openGraph: {
      title: `${offer.name} · ${hotel.name}, ${hotel.city}`,
      description: offer.description,
      images: [{ url: offer.image, alt: offer.imageAlt }],
    },
  };
}

export default async function OfferDetailPage(
  props: PageProps<"/offers/[slug]">,
) {
  const { slug } = await props.params;
  const offer = getOfferBySlug(slug);
  if (!offer) notFound();

  const reserveHref = `/booking/search?promo=${encodeURIComponent(offer.promoCode)}`;

  const relatedSlugs = offerToRoomSlugs[offer.slug] ?? [];
  const relatedRooms = relatedSlugs
    .map((s) => getRoomBySlug(s))
    .filter((r): r is (typeof rooms)[number] => Boolean(r));

  return (
    <main className="bg-white">
      <PageHero
        eyebrow={`Offre · ${offer.discountLabel}`}
        heading={offer.name}
        image={offer.image}
        imageAlt={offer.imageAlt}
        height="short"
      />

      <Section tone="white" size="compact">
        <Breadcrumb
          items={[
            { label: "Offres", href: "/offers" },
            { label: offer.name },
          ]}
        />
      </Section>

      <Section tone="white" size="default" className="!pt-0">
        <div className="grid gap-10 md:gap-12 lg:gap-16 lg:grid-cols-12">
          {/* Main column — copy + ledger. */}
          <div className="lg:col-span-7">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3 md:mb-4">
              À propos de ce forfait
            </p>
            <h2 className="font-display font-medium text-[26px] xs:text-[30px] sm:text-4xl lg:text-[44px] leading-[1.1] tracking-tight text-ink text-balance">
              {offer.tagline}
            </h2>
            <span
              aria-hidden
              className="mt-5 md:mt-6 block h-px w-14 bg-marine"
            />
            <p className="mt-6 md:mt-8 font-sans text-[16px] md:text-[17px] leading-[1.75] text-graybase max-w-[60ch]">
              {offer.description}
            </p>

            {/* All perks — bullet list, no "+ N more" truncation here. */}
            <div className="mt-10 md:mt-14">
              <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60 mb-4">
                Ce qui est inclus
              </p>
              <ul className="flex flex-col gap-3">
                {offer.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-3 font-sans text-[15px] md:text-[16px] leading-[1.65] text-ink border-b border-ink/10 pb-3"
                  >
                    <span
                      aria-hidden
                      className="mt-[9px] inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-marine"
                    />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conditions — quieter ledger of the fine print. */}
            {offer.conditions.length > 0 && (
              <div className="mt-10 md:mt-12">
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60 mb-4">
                  Conditions
                </p>
                {/* « Conditions » – mot identique en français */}
                <ul className="flex flex-col gap-2.5">
                  {offer.conditions.map((c, i) => (
                    <li
                      key={c}
                      className="flex items-start gap-3 font-sans text-[13.5px] md:text-[14px] leading-[1.65] text-graybase"
                    >
                      <span className="font-display text-[12px] text-marine pt-0.5 tabular-nums tracking-tight shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar — discount + CTA card, sticky on lg. */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 bg-cream border border-ink/10 p-6 md:p-8 lg:p-10 relative overflow-hidden grain">
              <span
                aria-hidden
                className="absolute left-0 right-0 top-0 h-[2px] bg-marine"
              />
              <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/55">
                Idéal pour
              </p>
              <p className="mt-2 font-display text-[20px] md:text-[22px] leading-tight tracking-tight text-ink">
                {offer.seasonHint}
              </p>

              <div className="mt-8 pt-8 border-t border-ink/15">
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/55">
                  Économie
                </p>
                <p className="mt-2 font-display font-medium text-[28px] md:text-[32px] leading-[1.1] tracking-tight text-marine">
                  {offer.discountLabel}
                </p>
                <p className="mt-3 font-sans text-[12px] uppercase tracking-[0.2em] text-ink/55">
                  Promo · <span className="tabular-nums text-ink">{offer.promoCode}</span>
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  href={reserveHref}
                  variant="primary"
                  size="large"
                  arrow
                  className="w-full"
                >
                  Réserver avec cette offre
                </Button>
                {offer.related && (
                  <Button
                    href={offer.related.href}
                    variant="secondary"
                    size="default"
                    className="w-full"
                  >
                    {offer.related.label}
                  </Button>
                )}
              </div>

              <p className="mt-6 font-sans text-[12px] leading-[1.65] text-ink/60">
                Le code vous accompagne jusqu&apos;à l&apos;écran de réservation — pas de copier-coller. Besoin d&apos;aide ? Appelez <a href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`} className="underline decoration-marine/40 underline-offset-2 hover:text-marine">{hotel.contact.phonePrimary}</a>.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* Related rooms rail — pairs the offer with rooms it suits. */}
      {relatedRooms.length > 0 && (
        <Section tone="cream" grain size="default">
          <SectionHeading
            eyebrow="S'accorde bien avec"
            heading={`Chambres adaptées à ${offer.name.toLowerCase()}`}
            description="Sélectionnées à la main parce qu'elles correspondent à la façon dont le forfait est le plus souvent utilisé. Le code de réduction est transmis à toute chambre que vous choisissez."
          />
          <ul className="mt-10 md:mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:gap-8">
            {relatedRooms.map((room) => (
              <li key={room.slug} className="flex">
                <RoomCard
                  room={room}
                  variant="compact"
                  primaryHref={`/booking/search?room=${room.slug}&promo=${encodeURIComponent(offer.promoCode)}`}
                  primaryLabel="Réserver avec l'offre"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Closing CTA — back to the catalogue. */}
      <Section tone="white" size="compact">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-2">
              Parcourir tous les forfaits
            </p>
            <p className="font-display text-[22px] md:text-[26px] leading-tight tracking-tight text-ink max-w-[36ch]">
              Découvrez toutes les offres proposées par la maison cette saison.
            </p>
          </div>
          <Button href="/offers" variant="ghost" size="default" arrow>
            Toutes les offres
          </Button>
        </div>
      </Section>
    </main>
  );
}
