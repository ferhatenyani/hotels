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
  title: `Contact — Joindre la réception · ${hotel.name}, ${hotel.city}`,
  description: `Téléphone, e-mail, adresse et itinéraire pour ${hotel.name} au cœur de ${hotel.city}. La réception est ouverte vingt-quatre heures sur vingt-quatre.`,
};

type LedgerLine = { text: string; href?: string };
type LedgerItem = { label: string; lines: LedgerLine[] };

// Letterhead ledger — uses the home Contact pattern but expands it to four
// items (the home version uses two). Pulled from `hotel` so the source of
// truth stays single.
const ledger: LedgerItem[] = [
  {
    label: "L'hôtel",
    lines: [
      { text: hotel.address.street },
      {
        text: `${hotel.address.postalCode} ${hotel.address.city}, ${hotel.address.country}`,
      },
    ],
  },
  {
    label: "Réservations",
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
    label: "Langues parlées",
    lines: hotel.numbers.languagesSpoken.map((l) => ({ text: l })),
  },
  {
    label: "Horaires de la réception",
    lines: [
      { text: "Vingt-quatre heures sur vingt-quatre, tous les jours" },
      { text: "Arrivée 14h00 · Départ 12h00" },
    ],
  },
];

// Tap-to-X tiles — surfaced at every breakpoint here (the home Contact
// hides them above lg). Each one is ≥ 56 px tall and shows the value plainly.
const tiles = [
  {
    label: "Appeler la réception",
    value: hotel.contact.phonePrimary,
    href: `tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`,
    icon: Phone,
  },
  {
    label: "Seconde ligne",
    value: hotel.contact.phoneSecondary,
    href: `tel:${hotel.contact.phoneSecondary.replace(/\s+/g, "")}`,
    icon: Phone,
  },
  {
    label: "E-mail réservations",
    value: hotel.contact.email,
    href: `mailto:${hotel.contact.email}`,
    icon: Mail,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Joindre la réception"
        heading="Écrivez-nous — nous vous répondrons"
        description="Le téléphone est décroché à toute heure. Un e-mail reçoit une réponse dans la journée. Une lettre est lue avec soin."
        image="/images/hero-poster.jpg"
        imageAlt={`${hotel.name}, ${hotel.city} — la ville à la fenêtre`}
        height="short"
      />

      {/* Letterhead + form. Cream-toned section to inherit the same calm as
          the home Contact block. */}
      <Section tone="cream" grain size="default" id="letter">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 lg:gap-20">
          {/* Letterhead column — order-2 on mobile so the form leads. */}
          <div className="lg:col-span-5 lg:pt-2 order-2 lg:order-1">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3 md:mb-4">
              La réception, en détail
            </p>
            <h2 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance">
              Quatre façons de nous joindre —
              <br className="hidden sm:block" />
              <span className="italic font-normal">choisissez celle qui vous va.</span>
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
          eyebrow="Pressé ?"
          heading="Toucher pour appeler, toucher pour écrire"
          description="Chaque ligne aboutit à la même réception — choisissez celle qui convient au moment. Le numéro fonctionne aussi pour un rapide message sur WhatsApp."
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
          eyebrow="Nous trouver"
          heading={`Au cœur de ${hotel.city}`}
          description={
            <>
              {hotel.name} se trouve au centre de {hotel.city}, à un court pas
              du front de mer et à quelques minutes de l'aéroport. Plus Code{" "}
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
              title={`${hotel.name} sur OpenStreetMap`}
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
                Pour venir
              </p>
              <ul className="flex flex-col gap-3 font-sans text-[14px] leading-[1.65] text-graybase">
                <li>
                  <span className="text-ink font-medium">Depuis l'aéroport :</span>{" "}
                  Les taxis attendent à la sortie des arrivées ; le trajet
                  dure environ quinze minutes. Nous pouvons aussi organiser un
                  transfert privé — laissez-nous un mot avec les détails de
                  votre vol.
                </li>
                <li>
                  <span className="text-ink font-medium">Depuis la gare :</span>{" "}
                  Environ dix minutes en voiture. À pied par beau temps si
                  vous voyagez léger.
                </li>
                <li>
                  <span className="text-ink font-medium">Parking :</span>{" "}
                  Parking privé gratuit sur place, accessible jour et nuit —
                  aucune réservation nécessaire.
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
              Réception 24 heures sur 24
            </p>
            <h3 className="font-display font-medium text-[24px] md:text-[28px] leading-tight tracking-tight text-white text-balance">
              Arrivez à toute heure — la réception est tenue.
            </h3>
            <p className="mt-4 font-sans text-[15px] leading-[1.7] text-white/70 max-w-[42ch]">
              Si votre vol atterrit après minuit, faites-nous signe à
              l'avance et nous aurons la chambre prête et un accueil
              chaleureux à la porte.
            </p>
          </div>

          {/* Document policy — flagged cream so it's clearly a heads-up, not
              the marketing register. */}
          <div className="border-l border-white/15 pl-8 md:pl-12">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream/15 text-cream mb-5">
              <MapPin className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-cream mb-3">
              À noter · Arrivée
            </p>
            <h3 className="font-display font-medium text-[24px] md:text-[28px] leading-tight tracking-tight text-white text-balance">
              Une pièce d'identité pour chacun — et pour les couples, le livret de famille.
            </h3>
            <p className="mt-4 font-sans text-[15px] leading-[1.7] text-white/70 max-w-[42ch]">
              Tous les clients présentent une pièce d'identité valide à
              l'arrivée (passeport ou carte nationale). Pour les couples, la
              réglementation locale exige une preuve de mariage — livret de
              famille ou certificat. Nous le mentionnons ici pour qu'aucune
              surprise ne vous attende à la réception : il s'agit d'une
              exigence nationale, et non d'une règle de l'hôtel.
            </p>
          </div>
        </div>
      </Section>

      {/* Decorative full-bleed image — visual breath before the footer. */}
      <Section tone="white" size="compact" fullBleed>
        <div className="relative w-full h-[260px] sm:h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden">
          <Image
            src="/images/exhibit-suite-dawn.jpg"
            alt={`Lumière de l'aube depuis une fenêtre de ${hotel.name}`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Section>
    </main>
  );
}
