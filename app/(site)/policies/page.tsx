// /policies — narrow editorial column. Privacy · Terms of stay ·
// Cancellation · House rules. Server Component, all copy inlined for the
// demo (no CMS).
//
// Voice: human, plain, brand-aligned. Avoids legalese. References the
// hotel's real practices (direct-booking emphasis, the document policy at
// check-in, no spa/pool/gym, free private parking, 24 h reception).

import type { Metadata } from "next";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import { Button } from "@/components/site/Button";

import { hotel } from "@/lib/data/hotel";

// Last-updated stamp — hardcoded to today's date per the build brief
// (the orchestrator passed it through the system context).
const LAST_UPDATED = "23 June 2026";

export const metadata: Metadata = {
  title: "Policies — What we promise, what we ask · Hôtel du Lac, Béjaïa",
  description:
    "Privacy, terms of stay, cancellation, and house rules at Hôtel du Lac, Béjaïa — written in plain English, kept short, no legalese.",
};

type Policy = {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: React.ReactNode[];
};

const policies: Policy[] = [
  {
    id: "privacy",
    eyebrow: "01 · Privacy",
    title: "How we look after your data",
    paragraphs: [
      <>We collect the smallest amount of information we need to run the booking: a name, contact details, the dates of the stay, and a card for the hold. That&apos;s it.</>,
      <>When you write to the desk through the contact form, we keep the message until the conversation is closed, then we delete it. We don&apos;t pass your details to anyone else, and we don&apos;t sell or rent the list — there is no list.</>,
      <>Bookings made through third-party channels (Booking.com, Expedia, agents) are governed by those platforms&apos; privacy terms in addition to ours. We strongly prefer direct booking, both for your comfort and ours — fewer hands on your data, fewer chances of a mix-up.</>,
      <>If you&apos;d like to know what we hold about you, or you&apos;d like us to delete it, write to <a href={`mailto:${hotel.contact.email}`} className="underline decoration-marine/40 underline-offset-2 hover:text-marine">{hotel.contact.email}</a> and we&apos;ll come back within a working day.</>,
      <>The hotel&apos;s closed-circuit cameras cover public areas — the entrance, the lobby, the corridors — for the safety of guests and staff. Footage is kept for a short window and reviewed only when there&apos;s reason.</>,
      <>For payments we use a regulated provider; the card itself never lands on our servers. The cookies on this site are limited to what makes the site work — session, language, the booking funnel&apos;s URL state. We don&apos;t run third-party analytics or advertising trackers.</>,
    ],
  },
  {
    id: "terms",
    eyebrow: "02 · Terms of stay",
    title: "What a stay with us means",
    paragraphs: [
      <>A confirmed reservation is a small contract: you let us know when to expect you and what kind of room to prepare; we hold that room and welcome you on arrival. The price you saw at confirmation is the price you&apos;ll pay — plus the {hotel.tourismTaxDA} DA per-person, per-night tourism tax that the city collects through us.</>,
      <>Check-in opens at 14:00; check-out is at 12:00. Earlier arrivals are welcome — we&apos;ll hold your luggage at the desk and call you when the room is ready. Late check-outs are usually possible at no charge if you ask the night before; subject to the day&apos;s arrivals.</>,
      <>Every guest presents a valid ID at check-in (passport or national ID). For couples, Algerian law requires proof of marriage — the livret de famille, the marriage booklet, or the certificate. This is a national requirement, not a hotel rule; we mention it everywhere so it doesn&apos;t surprise you at the desk.</>,
      <>Children are welcome at any age. A cot or extra bed can be added on request, subject to room size — write a note with your reservation so we know.</>,
      <>The hotel has 124 rooms, free private parking (day and night), a 24-hour reception and a multilingual team. What we don&apos;t have: a swimming pool, a spa, or a fitness room. We&apos;d rather tell you up front than have you discover it on arrival.</>,
      <>If anything goes wrong with the room, please tell the desk straight away — we&apos;ll fix what we can fix immediately, and arrange a different room where we can&apos;t.</>,
    ],
  },
  {
    id: "cancellation",
    eyebrow: "03 · Cancellation",
    title: "Plans change — here&apos;s how that works",
    paragraphs: [
      <>Standard rates are freely cancellable up to forty-eight hours before arrival. Until that window closes, you can move or cancel the booking from your confirmation email or by writing to the desk — at no cost.</>,
      <>Cancellations made inside the forty-eight-hour window, or no-shows on the day, are charged the first night of the stay. We don&apos;t do this lightly; it&apos;s how we make late-cancelled rooms work in a small operation.</>,
      <>Promotional and non-refundable rates are clearly marked at booking, with their own terms. Where a rate is non-refundable, we&apos;ll say so before you confirm — and we&apos;ll ask you to confirm again.</>,
      <>If the cancellation is due to a serious event — a hospitalisation, a bereavement, a force-majeure travel ban — write to the desk with what you can share, and we&apos;ll work it out together. We&apos;d rather meet you next year than charge you this one.</>,
      <>Group bookings of ten or more rooms, weddings, and conferences are governed by the contract you sign with the events team; that contract carries its own cancellation schedule. Ask the events team for a copy if you need to reread it.</>,
      <>Refunds, when due, are returned to the same card or account that paid — usually within five working days, sometimes a little longer depending on the bank.</>,
    ],
  },
  {
    id: "house-rules",
    eyebrow: "04 · House rules",
    title: "Small things that keep the house calm",
    paragraphs: [
      <>The whole hotel is non-smoking, indoors. Smoking is welcome on the small terrace by the lobby; smoking in a room incurs a deep-clean charge because the next guest can smell it for days.</>,
      <>Quiet hours run from 22:00 to 07:00. We&apos;re a sleep hotel in the middle of a busy city; the calm in the rooms is what most of our guests come back for, so we ask the favour of low voices in the corridors after ten.</>,
      <>Pets aren&apos;t accepted in the rooms, with the exception of registered assistance animals — write ahead so we can prepare the room properly.</>,
      <>The events hall is busy on weekends: weddings, baptisms, engagements, conferences. We&apos;ll let you know if your stay overlaps, and we&apos;ll place you on a floor away from the music where we can.</>,
      <>The breakfast room serves from 06:30 to 10:30. We can pack a take-away breakfast if you have an early flight or a long drive — drop a note at the desk the night before.</>,
      <>Lost-and-found items are kept for thirty days. If you think you&apos;ve left something behind, write to the desk with the date and the room number and we&apos;ll have a look.</>,
      <>Damage to the room or its furnishings is billed at cost. Accidents happen — tell us, we&apos;ll work it out without drama.</>,
      <>And: thank you. Hotels rely on guests being kind to each other and to the staff; the warmth in the welcome is something we try to earn, and to deserve, with every stay.</>,
    ],
  },
];

export default function PoliciesPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Policies"
        heading="What we promise, what we ask"
        description="Four short sections — privacy, terms, cancellation, and house rules. Written in plain English, kept human."
        image="/images/exhibit-corner-suite.jpg"
        imageAlt="The Suite Senior's living corner at Hôtel du Lac"
        height="short"
      />

      <Section tone="white" size="default" maxWidth="narrow">
        {/* Last-updated + index nav at the top of the editorial column. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10 pb-10 md:pb-14 border-b border-ink/10">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
              Last updated · <span className="text-ink">{LAST_UPDATED}</span>
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] leading-tight tracking-tight text-ink max-w-[36ch] text-balance">
              A short, plain index of what we ask of you, and what we owe in
              return.
            </h2>
          </div>
          <nav aria-label="Jump to a policy" className="flex flex-wrap gap-2">
            {policies.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="inline-flex items-center justify-center font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70 border border-ink/15 rounded-full px-4 py-2.5 min-h-[44px] transition-colors hover:bg-ink hover:border-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                {p.title.split(" ").slice(0, 1).join(" ").replace(/[—,.]/, "")}
              </a>
            ))}
          </nav>
        </div>

        {/* Policy sections — long-form, paragraphs only, marine ruled. */}
        <div className="flex flex-col gap-16 md:gap-20 pt-10 md:pt-14">
          {policies.map((p) => (
            <article
              key={p.id}
              id={p.id}
              className="scroll-mt-24"
            >
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
                {p.eyebrow}
              </p>
              <h2 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.08] tracking-tight text-ink text-balance">
                {p.title}
              </h2>
              <span
                aria-hidden
                className="mt-5 md:mt-7 block h-px w-14 bg-marine"
              />
              <div className="mt-7 md:mt-10 flex flex-col gap-5 md:gap-6">
                {p.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="font-sans text-[15px] md:text-[16px] leading-[1.75] text-graybase"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Closing — back-to-top + contact link. */}
        <div className="mt-16 md:mt-20 pt-10 border-t border-ink/10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[14px] md:text-[15px] leading-[1.7] text-graybase max-w-[44ch]">
            Questions about any of this? Write to the desk and we&apos;ll come
            back in plain English.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/contact" variant="primary" size="default" arrow>
              Write to the desk
            </Button>
            <Button href="/faq" variant="ghost" size="default">
              See the FAQ
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
