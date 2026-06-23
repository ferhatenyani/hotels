// /contact — the dedicated contact route. Mirrors the visual rhythm of the
// home Contact section (letterhead + form card pattern) but adds the things
// a stand-alone contact page needs: tap-to-call/email tiles for every
// breakpoint, a map embed, directions, the 24-hour reception note and the
// document policy.
//
// Server Component wrapper; the letter form is its own client subcomponent
// so the page can still export metadata.

import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Mail, Phone, Clock, MapPin } from "lucide-react";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";

import { hotel } from "@/lib/data/hotel";

import ContactLetterForm from "./ContactLetterForm";

export const metadata: Metadata = {
  title: "Contact — Reach the desk · Hôtel du Lac, Béjaïa",
  description:
    "Telephone, email, address and directions to Hôtel du Lac in Aamriou, central Béjaïa. The desk is staffed twenty-four hours a day.",
};

type LedgerLine = { text: string; href?: string };
type LedgerItem = { label: string; lines: LedgerLine[] };

// Letterhead ledger — uses the home Contact pattern but expands it to four
// items (the home version uses two). Pulled from `hotel` so the source of
// truth stays single.
const ledger: LedgerItem[] = [
  {
    label: "The hotel",
    lines: [
      { text: hotel.address.street },
      {
        text: `${hotel.address.postalCode} ${hotel.address.city}, ${hotel.address.country}`,
      },
    ],
  },
  {
    label: "Reservations",
    lines: [
      { text: hotel.contact.email, href: `mailto:${hotel.contact.email}` },
      {
        text: hotel.contact.phonePrimary,
        href: `tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`,
      },
      {
        text: hotel.contact.phoneSecondary,
        href: `tel:${hotel.contact.phoneSecondary.replace(/\s+/g, "")}`,
      },
    ],
  },
  {
    label: "Languages spoken",
    lines: hotel.numbers.languagesSpoken.map((l) => ({ text: l })),
  },
  {
    label: "Hours of the desk",
    lines: [
      { text: "Twenty-four hours a day, every day" },
      { text: "Check-in 14:00 · Check-out 12:00" },
    ],
  },
];

// Tap-to-X tiles — surfaced at every breakpoint here (the home Contact
// hides them above lg). Each one is ≥ 56 px tall and shows the value plainly.
const tiles = [
  {
    label: "Call the desk",
    value: hotel.contact.phonePrimary,
    href: `tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`,
    icon: Phone,
  },
  {
    label: "Second line",
    value: hotel.contact.phoneSecondary,
    href: `tel:${hotel.contact.phoneSecondary.replace(/\s+/g, "")}`,
    icon: Phone,
  },
  {
    label: "Email reservations",
    value: hotel.contact.email,
    href: `mailto:${hotel.contact.email}`,
    icon: Mail,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Reach the desk"
        heading="Write to us — we'll write back"
        description="A telephone is answered at any hour. An email is replied to within the day. A letter is read with care."
        image="/images/hero-poster.jpg"
        imageAlt="Hôtel du Lac, Béjaïa — the lake at the window"
        height="short"
      />

      {/* Letterhead + form. Cream-toned section to inherit the same calm as
          the home Contact block. */}
      <Section tone="cream" grain size="default" id="letter">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 lg:gap-20">
          {/* Letterhead column — order-2 on mobile so the form leads. */}
          <div className="lg:col-span-5 lg:pt-2 order-2 lg:order-1">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3 md:mb-4">
              The desk, in detail
            </p>
            <h2 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance">
              Four ways to reach us —
              <br className="hidden sm:block" />
              <span className="italic font-normal">pick the one you like.</span>
            </h2>
            <span aria-hidden className="mt-5 md:mt-7 block h-px w-14 bg-marine" />

            <ul className="mt-6 md:mt-10 lg:mt-12 flex flex-col gap-5 md:gap-9">
              {ledger.map((item, i) => (
                <li key={item.label} className="flex items-start gap-5">
                  <span className="font-display text-[13px] text-marine pt-1 tabular-nums tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 border-t border-ink/15 pt-3">
                    <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60">
                      {item.label}
                    </p>
                    <div className="mt-2 flex flex-col gap-1">
                      {item.lines.map((line) =>
                        line.href ? (
                          <a
                            key={line.text}
                            href={line.href}
                            className="font-sans font-normal text-[15px] leading-[1.6] text-ink hover:text-marine transition-colors max-md:min-h-[44px] max-md:flex max-md:items-center"
                          >
                            {line.text}
                          </a>
                        ) : (
                          <p
                            key={line.text}
                            className="font-sans font-normal text-[15px] leading-[1.6] text-ink"
                          >
                            {line.text}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Form column — order-1 on mobile (leads). */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <ContactLetterForm />
          </div>
        </div>
      </Section>

      {/* Tap-to-call / tap-to-email tile grid. */}
      <Section tone="white" size="compact">
        <SectionHeading
          eyebrow="In a hurry?"
          heading="Tap to call, tap to write"
          description="Each line goes to the same desk — pick whichever fits the moment. The number is also good for a quick text on WhatsApp."
        />
        <ul className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <li key={tile.label}>
                <a
                  href={tile.href}
                  className="group/tile flex items-center gap-4 rounded-2xl border border-ink/10 bg-white px-4 py-4 md:px-5 md:py-5 min-h-[72px] text-ink transition-colors hover:border-ink/25 hover:bg-cream/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine transition-colors group-hover/tile:bg-marine group-hover/tile:text-white">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55">
                      {tile.label}
                    </span>
                    <span className="font-sans text-[14px] md:text-[15px] text-ink mt-1 truncate">
                      {tile.value}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-ink/30 transition-all duration-300 ease-out group-hover/tile:translate-x-0.5 group-hover/tile:text-ink"
                    strokeWidth={1.75}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Finding us — map embed + directions. */}
      <Section tone="white" size="default" id="finding-us">
        <SectionHeading
          eyebrow="Finding us"
          heading="On the edge of Lac Mézaïa, in Aamriou"
          description={
            <>
              Hôtel du Lac sits in the Aamriou district of central Béjaïa, a
              short step from the seafront and a few minutes from
              Soummam–Abane Ramdane airport. Plus Code{" "}
              <span className="tabular-nums text-ink">
                {hotel.address.plusCode}
              </span>
              .
            </>
          }
        />

        <div className="mt-10 md:mt-12 grid gap-8 lg:gap-10 lg:grid-cols-12">
          {/* Map — lazy-loaded iframe. Aspect ratio flips wider on desktop. */}
          <div className="lg:col-span-8 aspect-[16/9] lg:aspect-[21/9] overflow-hidden border border-ink/10 bg-ink/5">
            <iframe
              title="Hôtel du Lac on OpenStreetMap"
              src="https://www.openstreetmap.org/export/embed.html?bbox=5.04,36.74,5.08,36.76&layer=mapnik&marker=36.747,5.061"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
            />
          </div>

          {/* Directions ledger — pulled from hotel.distances. */}
          <div className="lg:col-span-4">
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60 mb-4">
              Distances
            </p>
            <ul className="flex flex-col">
              {hotel.distances.map((d) => (
                <li
                  key={d.label}
                  className="flex items-start justify-between gap-4 border-t border-ink/10 py-3 first:border-t-0 first:pt-0"
                >
                  <span className="font-sans text-[14px] leading-[1.5] text-ink">
                    {d.label}
                  </span>
                  <span className="font-display text-[13px] md:text-[14px] tabular-nums text-marine pt-0.5 shrink-0">
                    {d.value}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-ink/15">
              <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60 mb-3">
                Getting in
              </p>
              <ul className="flex flex-col gap-3 font-sans text-[14px] leading-[1.65] text-graybase">
                <li>
                  <span className="text-ink font-medium">From the airport:</span>{" "}
                  Taxis wait outside arrivals; the ride is roughly fifteen
                  minutes. We&apos;re happy to help arrange a private transfer —
                  drop a note with your flight details.
                </li>
                <li>
                  <span className="text-ink font-medium">From the station:</span>{" "}
                  About ten minutes by car. Walkable in good weather if you
                  travel light.
                </li>
                <li>
                  <span className="text-ink font-medium">Parking:</span> Free
                  private parking on site, accessible day and night — no
                  reservation needed.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* 24-hour reception + check-in policy — explicit and visible. */}
      <Section tone="ink" grain size="compact">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* 24h note. */}
          <div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white mb-5">
              <Clock className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/55 mb-3">
              Twenty-four-hour reception
            </p>
            <h3 className="font-display font-medium text-[24px] md:text-[28px] leading-tight tracking-tight text-white text-balance">
              Arrive at any hour — the desk is staffed.
            </h3>
            <p className="mt-4 font-sans text-[15px] leading-[1.7] text-white/70 max-w-[42ch]">
              If your flight lands after midnight, drop us a line beforehand
              and we&apos;ll have the room ready and a warm welcome at the
              door.
            </p>
          </div>

          {/* Document policy — flagged amber so it's clearly a heads-up, not
              the marketing register. */}
          <div className="border-l border-white/15 pl-8 md:pl-12">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream/15 text-cream mb-5">
              <MapPin className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-cream mb-3">
              A heads-up · Check-in
            </p>
            <h3 className="font-display font-medium text-[24px] md:text-[28px] leading-tight tracking-tight text-white text-balance">
              Bring an ID for everyone — and for couples, the marriage booklet.
            </h3>
            <p className="mt-4 font-sans text-[15px] leading-[1.7] text-white/70 max-w-[42ch]">
              All guests present a valid ID at check-in (passport or national
              ID). For couples, Algerian law requires proof of marriage — the
              livret de famille, the booklet, or the certificate. We mention
              it here so it doesn&apos;t surprise you at the desk: it is a
              national requirement, not a hotel rule.
            </p>
          </div>
        </div>
      </Section>

      {/* Decorative full-bleed lake image — visual breath before the footer. */}
      <Section tone="white" size="compact" fullBleed>
        <div className="relative w-full h-[260px] sm:h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden">
          <Image
            src="/images/exhibit-suite-dawn.jpg"
            alt="Dawn over Lac Mézaïa from a Hôtel du Lac window"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Section>
    </main>
  );
}
