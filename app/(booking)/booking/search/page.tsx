// /booking/search — step 1. Date + guest picker.
//
// Server Component reads ?in / ?out / ?adults / ?children / ?room / ?promo
// and pre-fills the client <SearchForm>. If ?room is present we lock the
// choice with a "Reserving the {Name}" chip + "Change room" link. If ?promo
// resolves to an offer we show the offer name + applied badge; otherwise a
// quiet "code not recognised" hint.
//
// On submit (in the client form) we route to /booking/results carrying the
// full query so /results can render the listing without round-tripping.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, BadgeAlert } from "lucide-react";

import Section from "@/components/site/Section";
import SearchForm from "./SearchForm";

import { encodeDate, searchParamsToBooking } from "@/lib/booking/params";
import { getRoomBySlug } from "@/lib/data/rooms";
import { getOfferByPromoCode } from "@/lib/data/offers";
import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: `Trouver votre séjour — ${hotel.name}`,
  description:
    "Choisissez vos dates et le nombre de voyageurs. Réservation directe — nous confirmons chaque réservation nous-mêmes.",
};

export default async function SearchPage(props: PageProps<"/booking/search">) {
  const sp = await props.searchParams;
  const q = searchParamsToBooking(sp);

  const lockedRoom = q.roomSlug ? getRoomBySlug(q.roomSlug) : undefined;
  const promoOffer = q.promo ? getOfferByPromoCode(q.promo) : undefined;
  const promoUnrecognised = Boolean(q.promo && !promoOffer);

  return (
    <Section tone="white" size="compact" maxWidth="narrow">
      {/* Pastille chambre verrouillée */}
      {lockedRoom ? (
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 border border-marine/20 bg-marine/[0.04] rounded-full pl-4 pr-2 py-2 max-w-fit">
          <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-marine">
            Réservation
          </span>
          <span className="font-display text-[14px] font-medium text-ink leading-none">
            {lockedRoom.name}
          </span>
          <Link
            href="/rooms"
            className="ml-1 inline-flex items-center gap-1 rounded-full bg-white border border-ink/10 px-3 py-1.5 font-sans text-[10.5px] uppercase tracking-[0.18em] text-ink/70 hover:text-ink hover:border-ink/25 transition-colors max-md:min-h-[36px]"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={2} />
            Changer de chambre
          </Link>
        </div>
      ) : null}

      {/* Les en-têtes du tunnel laissent tomber la surbrille — le StepRail
          ci-dessus nomme déjà l'étape. Le h1 porte le moment. */}
      <header className="max-w-[44ch]">
        <h1 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[48px] leading-[1.05] tracking-tight text-ink text-balance">
          Quand souhaitez-vous
          <br className="hidden sm:block" />
          <span className="italic font-normal">venir nous voir&nbsp;?</span>
        </h1>
        <span aria-hidden className="mt-5 md:mt-6 block h-px w-14 bg-marine" />
        <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase">
          Choisissez votre arrivée et votre départ, et dites-nous qui vient.
        </p>
      </header>

      {/* Badge promo */}
      {promoOffer ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-marine/25 bg-marine/[0.04] px-4 py-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine">
            <BadgeCheck className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-marine">
              Promo appliquée
            </span>
            <span className="mt-0.5 font-display text-[15px] font-medium text-ink">
              {promoOffer.name}{" "}
              <span className="font-sans text-[12px] text-ink/55 ml-1">
                · code {promoOffer.promoCode}
              </span>
            </span>
          </div>
        </div>
      ) : promoUnrecognised ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-ink/15 bg-ink/[0.02] px-4 py-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-ink/55">
            <BadgeAlert className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="font-sans text-[13.5px] text-ink/75">
            Code <span className="font-medium text-ink">{q.promo}</span> non
            reconnu — recherche sans réduction.
          </p>
        </div>
      ) : null}

      <div className="mt-8 md:mt-12">
        <SearchForm
          initialCheckIn={encodeDate(q.checkIn) ?? null}
          initialCheckOut={encodeDate(q.checkOut) ?? null}
          initialAdults={q.adults}
          initialChildren={q.children}
          roomSlug={q.roomSlug}
          promo={q.promo}
        />
      </div>
    </Section>
  );
}
