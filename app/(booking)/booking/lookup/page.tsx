// /booking/lookup — retrouver une réservation par ref + e-mail (pas de
// vraie authentification).
//
// La page serveur est une coquille fine — le formulaire est un composant
// client car la recherche se fait dans localStorage, sur l'appareil
// courant. Le StepRail se cache pour /lookup (cette page ne fait pas
// partie du tunnel linéaire).

import type { Metadata } from "next";

import Section from "@/components/site/Section";
import LookupForm from "./LookupForm";
import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: `Trouver votre réservation — ${hotel.name}`,
  description:
    "Retrouvez une réservation à l'aide de votre référence et de votre e-mail. Réservation directe — nous confirmons chaque réservation nous-mêmes.",
};

export default function LookupPage() {
  return (
    <Section tone="white" size="compact" maxWidth="narrow">
      {/* /lookup vit hors du tunnel linéaire (le StepRail s'y cache), donc
          la surbrille reste — elle apporte le contexte que le StepRail
          aurait donné. */}
      <header className="max-w-[44ch]">
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
          Trouver votre réservation
        </p>
        <h1 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance">
          Retrouver{" "}
          <span className="italic font-normal">une réservation.</span>
        </h1>
        <span aria-hidden className="mt-5 md:mt-6 block h-px w-14 bg-marine" />
        <p className="mt-5 md:mt-6 font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase">
          Les réservations vivent sur l&apos;appareil utilisé pour les
          effectuer. Saisissez votre référence et l&apos;e-mail utilisé —
          ou appelez la réception et nous vous retrouverons.
        </p>
      </header>

      <div className="mt-8 md:mt-12">
        <LookupForm />
      </div>
    </Section>
  );
}
