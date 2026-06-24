// En-tête épuré pour le tunnel de réservation. Bonne pratique : on retire
// la navigation principale, on garde uniquement le wordmark + un lien
// retour au site + une ligne d'assistance. L'étape du tunnel est affichée
// juste sous l'en-tête (StepRail). Maintient l'utilisateur dans le tunnel ;
// reflète l'accent mis sur la réservation directe.

"use client";

import Link from "next/link";
import { Phone, ShieldCheck } from "lucide-react";

import { hotel } from "@/lib/data/hotel";
import { cn } from "@/lib/utils";

export default function BookingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-[1280px] mx-auto h-14 md:h-16 px-4 sm:px-6 lg:px-10 flex items-center gap-4">
        <Link
          href="/"
          className="font-display font-semibold text-[15px] md:text-base text-ink tracking-tight whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine rounded-sm"
        >
          {hotel.name}
        </Link>
        <span aria-hidden className="hidden sm:block h-4 w-px bg-ink/15" />
        <span className="hidden sm:inline font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          Réservation
        </span>

        <span aria-hidden className="ml-auto inline-flex items-center gap-1.5 text-marine text-[11px] font-sans uppercase tracking-[0.18em] max-md:hidden">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
          Réservation directe sécurisée
        </span>

        <a
          href={`tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`}
          aria-label={`Appeler la réception pour de l'aide, ${hotel.contact.phonePrimary}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full font-sans text-[11px] uppercase tracking-[0.18em] transition-colors",
            "h-10 px-3 md:px-4 text-ink/75 hover:text-ink",
            "max-md:h-11 max-md:px-3.5 max-md:rounded-full max-md:border max-md:border-ink/15",
          )}
        >
          <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden xs:inline">Aide</span>
          <span className="hidden sm:inline">· {hotel.contact.phonePrimary}</span>
        </a>
      </div>
    </header>
  );
}
