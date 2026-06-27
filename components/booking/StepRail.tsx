// Indicateur d'étape pour le tunnel de réservation. Montre la position de
// l'utilisateur dans le parcours en 6 étapes. Sur mobile, on lit
// « Étape 2 sur 5 · Choisir la chambre » avec une fine barre de
// progression ; en tablette+, on affiche le rail complet de pastilles.
// Les étapes passées restent cliquables pour permettre d'éditer les choix
// précédents (règle UX : comportement de retour prévisible).

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { bookingHref, searchParamsToBooking } from "@/lib/booking/params";
import { cn } from "@/lib/utils";

type Step = {
  id: "search" | "results" | "guest" | "review" | "payment" | "confirmation";
  label: string;
  shortLabel: string;
};

const steps: Step[] = [
  { id: "search", label: "Dates & voyageurs", shortLabel: "Dates" },
  { id: "results", label: "Choisir la chambre", shortLabel: "Chambre" },
  { id: "guest", label: "Vos informations", shortLabel: "Infos" },
  { id: "review", label: "Récapitulatif", shortLabel: "Récap" },
  { id: "payment", label: "Paiement", shortLabel: "Paiement" },
  { id: "confirmation", label: "Confirmation", shortLabel: "Terminé" },
];

export default function StepRail() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParamsToBooking(searchParams);

  const currentId = steps.find((s) =>
    pathname.startsWith(`/booking/${s.id}`),
  )?.id;
  const currentIndex = currentId ? steps.findIndex((s) => s.id === currentId) : -1;

  // Lookup is a side-route, not part of the rail.
  if (pathname.startsWith("/booking/lookup")) return null;
  if (currentIndex < 0) return null;

  const current = steps[currentIndex];

  return (
    <div className="border-b border-ink/10 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-3 md:py-4">
        {/* MOBILE : « Étape X sur N · Libellé » compact + fine barre de progression. */}
        <div className="md:hidden flex items-center justify-between gap-3">
          <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            Étape {currentIndex + 1} sur {steps.length}
          </p>
          <p className="font-display text-[14px] font-medium tracking-tight text-ink truncate">
            {current.label}
          </p>
        </div>
        <div
          className="md:hidden mt-2 h-[2px] w-full bg-ink/10 rounded-full overflow-hidden"
          aria-hidden
        >
          <div
            className="h-full bg-marine rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${((currentIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* TABLETTE+ : rail de pastilles. Les étapes passées sont des liens ;
            l'étape actuelle et les suivantes sont de simples spans (pas
            de saut en avant). */}
        <ol className="hidden md:flex items-center gap-1.5 btn-text-sm">
          {steps.map((s, i) => {
            const isCurrent = i === currentIndex;
            const isPast = i < currentIndex;
            const isFuture = i > currentIndex;
            const node = (
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
                  isCurrent && "bg-marine text-white",
                  isPast && "text-ink/70 hover:text-marine",
                  // /55 (~5.7:1 on white) clears AA for these small-caps labels.
                  isFuture && "text-ink/55",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full font-display text-[11px] tabular-nums",
                    isCurrent && "bg-white/15 text-white",
                    isPast && "bg-ink/[0.06] text-ink",
                    isFuture && "bg-ink/[0.04] text-ink/55",
                  )}
                >
                  {i + 1}
                </span>
                {s.label}
              </span>
            );
            return (
              <li key={s.id} className="inline-flex items-center gap-1.5">
                {isPast ? (
                  <Link href={bookingHref(s.id, q)} aria-label={`Revenir à ${s.label}`}>
                    {node}
                  </Link>
                ) : (
                  node
                )}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "h-px w-4 transition-colors",
                      i < currentIndex ? "bg-marine/40" : "bg-ink/15",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
