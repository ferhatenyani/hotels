// /events — celebrations & conferences in full. Server Component.
// Expands the home section into a full editorial page: stats banner,
// event-type grid, hall-capacity table, equipment list, "how we work"
// timeline, then a CTA banner + real enquiry form.
//
// Archetype: Editorial page (CONVENTIONS §11), with one listing-style
// grid (event types) and one table reflowing to cards on mobile.

import type { Metadata } from "next";
import {
  Heart,
  Cake,
  PartyPopper,
  Mic,
  Briefcase,
  Music,
  type LucideIcon,
} from "lucide-react";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";
import { Button } from "@/components/site/Button";

import {
  eventTypes,
  hallCapacity,
  meetingEquipment,
  eventTimeline,
  type EventType,
} from "@/lib/data/events";
import { hotel } from "@/lib/data/hotel";

import EventEnquiryForm from "./EventEnquiryForm";

export const metadata: Metadata = {
  title: `Événements et Réunions — ${hotel.name}, ${hotel.city}`,
  description:
    "Une salle de 498 m² qui accueille jusqu'à 170 personnes assises, divisible en deux, avec des salles de réunion équipées et une restauration sur mesure. Mariages, conférences et célébrations au cœur de la ville.",
};

// Map data-layer icon names → real lucide components. Keeps the data layer
// dependency-free while letting the page render real glyphs.
const iconMap: Record<EventType["icon"], LucideIcon> = {
  Heart,
  Cake,
  PartyPopper,
  Mic,
  Briefcase,
  Music,
};

const stats = [
  { value: "498 m²", label: "Salle de réception" },
  { value: "170", label: "Invités assis" },
  { value: "÷ 2", label: "Salles divisibles" },
  { value: "Équipées", label: "Salles de réunion" },
];

export default function EventsPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Célébrations et conférences"
        heading="Une salle de 498 m² pour les jours qui comptent"
        description={`Des mariages et fiançailles aux séminaires et conférences — l'un des lieux de rassemblement de ${hotel.city}, au cœur de la ville.`}
        image="/images/exhibit-salon.jpg"
        imageAlt={`La salle de réception de 498 m² à ${hotel.name}, dressée pour un événement`}
      />

      {/* STATS BANNER — mirrors Events.tsx <dl> pattern, lifted into white surface. */}
      <Section tone="white" size="compact">
        <div className="max-w-[1100px] mx-auto border-y border-ink/10">
          <dl className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-0 sm:gap-x-12 sm:gap-y-7 py-7 sm:py-9 md:py-11">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`text-center py-3 sm:py-0 px-2 sm:px-0 ${
                  i % 2 === 1 ? "sm:border-0 border-l border-ink/10" : ""
                } ${i >= 2 ? "sm:border-0 border-t border-ink/10" : ""}`}
              >
                <dt className="font-display font-medium text-[24px] sm:text-[30px] md:text-[34px] leading-none tracking-tight text-ink">
                  {s.value}
                </dt>
                <dd className="mt-2 sm:mt-2.5 font-sans text-[10.5px] sm:text-[11px] uppercase tracking-[0.18em] text-ink/55">
                  {s.label}
                </dd>
              </div>
            ))}
            <div
              aria-hidden
              className="sm:hidden col-span-2 h-px bg-ink/10"
            />
          </dl>
        </div>
      </Section>

      {/* EVENT TYPES — 1/2/3 col grid. */}
      <Section tone="white" size="default">
        <SectionHeading
          eyebrow="Ce que nous accueillons"
          heading="D'un baptême à une conférence nationale"
          description="La salle s'adapte. Nous avons accueilli des banquets de mariage pour 170 convives, des séminaires de comités de direction, des soirées de fin d'année avec DJ en direct et de discrètes tables rondes pour des sociétés savantes."
        />

        <ul className="mt-10 md:mt-14 lg:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
          {eventTypes.map((t, i) => {
            const Icon = iconMap[t.icon];
            return (
              <li
                key={t.slug}
                className="flex flex-col bg-cream/40 border border-ink/10 p-6 md:p-8 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.18)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marine/10 text-marine">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-display text-[12px] tabular-nums text-marine tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 font-display font-medium text-[20px] md:text-[22px] tracking-tight leading-tight text-ink text-balance">
                  {t.name}
                </h3>
                <span aria-hidden className="mt-4 block h-px w-10 bg-marine" />
                <p className="mt-4 font-sans text-[14px] md:text-[15px] leading-[1.65] md:leading-[1.7] text-graybase">
                  {t.blurb}
                </p>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* HALL CAPACITY — table on desktop, card stack on mobile. */}
      <Section tone="cream" grain size="default" id="capacity">
        <SectionHeading
          eyebrow="Comment la salle s'agence"
          heading="Six façons de disposer la salle"
          description="La salle de 498 m² se configure selon le format — un banquet de 170, une assemblée de 220, ou deux moitiés de 85 lorsque la soirée appelle une salle plus intime."
        />

        {/* Desktop table */}
        <div className="hidden md:block mt-10 md:mt-14 lg:mt-16 border border-ink/15 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/15">
                <th className="text-left font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55 px-6 py-4">
                  Configuration
                </th>
                <th className="text-left font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55 px-6 py-4">
                  Capacité
                </th>
                <th className="text-left font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55 px-6 py-4">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {hallCapacity.map((row, i) => (
                <tr
                  key={row.setup}
                  className={
                    i === hallCapacity.length - 1
                      ? ""
                      : "border-b border-ink/10"
                  }
                >
                  <td className="px-6 py-5 font-display font-medium text-[18px] tracking-tight text-ink">
                    {row.setup}
                  </td>
                  <td className="px-6 py-5 font-sans tabular-nums text-[15px] text-ink">
                    {row.capacity}
                  </td>
                  <td className="px-6 py-5 font-sans text-[14px] text-graybase">
                    {row.note ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card stack */}
        <ul className="md:hidden mt-10 flex flex-col gap-3">
          {hallCapacity.map((row, i) => (
            <li
              key={row.setup}
              className="bg-white border border-ink/10 p-5"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[12px] tabular-nums text-marine tracking-tight">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display font-medium text-[18px] tracking-tight text-ink">
                  {row.setup}
                </h3>
              </div>
              <p className="mt-3 font-sans tabular-nums text-[15px] text-ink">
                {row.capacity}
              </p>
              {row.note && (
                <p className="mt-1.5 font-sans text-[13.5px] text-graybase">
                  {row.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* MEETING EQUIPMENT — 2-col bullet list on tablet+, single col mobile. */}
      <Section tone="white" size="default">
        <SectionHeading
          eyebrow="Ce que comprend la salle"
          heading="Équipée, avec une main sur la barre"
          description="Tout ce dont une journée de travail a besoin — et un technicien discret en veille pour les moments qui comptent."
        />

        <ul className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-x-10 md:gap-x-16 gap-y-0">
          {meetingEquipment.map((item, i) => (
            <li
              key={item}
              className="flex items-start gap-4 border-b border-ink/10 py-4 md:py-5"
            >
              <span className="font-display text-[12px] tabular-nums text-marine tracking-tight pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-sans text-[15px] md:text-[16px] leading-[1.5] text-ink">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* HOW WE WORK — numbered timeline with marine accent. */}
      <Section tone="cream" grain size="default">
        <SectionHeading
          eyebrow="Notre façon de travailler"
          heading="De la première note au dernier invité"
          description="Un processus court et honnête — chaque étape pilotée par la même personne chez nous, pour que le jour J ne réserve aucune surprise."
        />

        <ol className="mt-10 md:mt-14 lg:mt-16 relative max-w-[820px]">
          {/* Vertical hairline anchor — visible from tablet+, hidden on mobile
              where the numbered chips carry the rhythm on their own. */}
          <span
            aria-hidden
            className="hidden sm:block absolute left-[19px] top-2 bottom-2 w-px bg-marine/25"
          />
          {eventTimeline.map((step, i) => (
            <li
              key={step.step}
              className="relative flex items-start gap-5 md:gap-8 pb-8 md:pb-10 last:pb-0"
            >
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-marine/30 font-display text-[14px] tabular-nums text-marine">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 pt-1">
                <h3 className="font-display font-medium text-[20px] md:text-[24px] tracking-tight leading-tight text-ink text-balance">
                  {step.step}
                </h3>
                <p className="mt-3 font-sans text-[14px] md:text-[16px] leading-[1.7] text-graybase max-w-[60ch]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* CTA BANNER — bridge into the enquiry form below. */}
      <Section tone="ink" grain size="compact">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="max-w-[44ch]">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/55 mb-3">
              Planifiez votre événement
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-white text-balance">
              Parlez-nous de la journée. Un devis, généralement sous vingt-quatre heures.
            </h2>
            <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-white/70 max-w-[42ch]">
              La réception bloque les dates pendant que nous affinons les détails — agencement, restauration, blocs de chambres pour vos invités qui logent chez nous.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button href="#enquiry" variant="primary" size="default" arrow>
              Envoyer une demande
            </Button>
            <Button
              href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`}
              variant="ghost-light"
              size="default"
            >
              Appeler {hotel.contact.phonePrimary}
            </Button>
          </div>
        </div>
      </Section>

      {/* ENQUIRY FORM */}
      <Section tone="white" size="default" id="enquiry">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Quelques détails"
              heading="Envoyez-nous votre journée sur papier"
              description="Plus vous nous en dites en amont — date, taille du groupe, format imaginé — plus le premier devis sera juste."
            />

            <ul className="mt-8 md:mt-10 flex flex-col gap-3 md:gap-4">
              <li className="flex items-baseline gap-3 border-t border-ink/15 pt-3">
                <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  Service événements
                </span>
                <a
                  href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`}
                  className="ml-auto font-sans tabular-nums text-[15px] text-ink hover:text-marine transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
                >
                  {hotel.contact.phonePrimary}
                </a>
              </li>
              <li className="flex items-baseline gap-3 border-t border-ink/15 pt-3">
                <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  E-mail
                </span>
                <a
                  href={`mailto:${hotel.contact.email}`}
                  className="ml-auto font-sans text-[14px] text-ink hover:text-marine transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
                >
                  {hotel.contact.email}
                </a>
              </li>
              <li className="flex items-baseline gap-3 border-t border-ink/15 pt-3">
                <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  Horaires
                </span>
                <span className="ml-auto font-sans text-[14px] text-ink">
                  10h00 – 19h00
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <EventEnquiryForm />
          </div>
        </div>
      </Section>
    </main>
  );
}
