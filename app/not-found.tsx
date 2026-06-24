// 404 globale — vit dans app/not-found.tsx, hérite uniquement du layout racine
// (pas de NavbarCentered, pas de ChatModal, pas de Footer). C'est intentionnel :
// la page est faite pour être un écran calme et orienté récupération, pas une
// surface marketing avec tout le bruit du site.
//
// On affiche un logo minimal en haut à gauche + un lien Accueil, puis les
// excuses + les quatre liens rapides « là où vous vouliez probablement aller »,
// puis une petite ligne de bas de page « Appeler la réception ».

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: "Page introuvable — Notre Hôtel",
  description:
    "La page que vous cherchez n'est pas ici. Retrouvez le chemin vers les chambres, la réservation ou la réception.",
};

const quickLinks: { href: string; label: string; hint: string }[] = [
  { href: "/", label: "Accueil", hint: "Revenir à la page d'accueil" },
  { href: "/rooms", label: "Chambres", hint: "Six chambres, une vue" },
  {
    href: "/booking/search",
    label: "Réserver",
    hint: "Choisir des dates et une chambre",
  },
  {
    href: "/booking/lookup",
    label: "Retrouver ma réservation",
    hint: "Rechercher une réservation par référence",
  },
];

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-white text-ink flex flex-col">
      {/* Barre du haut minimale : logo + lien Accueil. Pas de navbar complète —
          c'est une page de récupération, pas une surface marketing. */}
      <header className="px-4 sm:px-6 lg:px-10 py-5 md:py-6 border-b border-ink/[0.06]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display font-semibold text-[20px] md:text-[22px] tracking-tight text-ink hover:text-marine transition-colors"
          >
            {hotel.name}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70 hover:text-ink min-h-[44px] px-3 transition-colors"
          >
            Accueil
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </Link>
        </div>
      </header>

      {/* Le corps occupe l'espace vertical restant et centre le message en
          tablette+. Sur téléphone, le contenu démarre en haut pour éviter
          un scroll inutile. */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px] flex">
        <div className="max-w-[920px] mx-auto w-full lg:my-auto">
          <p className="font-sans text-[11px] uppercase tracking-[0.24em] text-marine mb-4 md:mb-5">
            404 · Un mauvais virage
          </p>
          <h1 className="font-display font-medium text-[32px] xs:text-[36px] sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink text-balance max-w-[18ch]">
            Cette page est introuvable.
          </h1>
          <span
            aria-hidden
            className="mt-6 md:mt-8 block h-px w-14 bg-marine"
          />
          <p className="mt-6 md:mt-8 font-sans text-[16px] md:text-[17px] leading-[1.7] text-graybase max-w-[52ch]">
            Elle a peut-être été déplacée, ou elle n'a jamais existé. Reprenons un chemin tranquille.
          </p>

          {/* Quatre liens rapides — présentés comme un registre, règle marine
              au survol pour garder une interaction calme et alignée avec la
              marque. */}
          <ul className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {quickLinks.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group/link flex items-start gap-5 border-t border-ink/15 py-5 md:py-6 transition-colors hover:border-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                >
                  <span className="font-display text-[13px] text-marine pt-1 tabular-nums tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display font-medium text-[20px] md:text-[22px] leading-tight tracking-tight text-ink group-hover/link:text-marine transition-colors">
                      {link.label}
                    </span>
                    <span className="mt-1.5 block font-sans text-[13.5px] md:text-[14px] leading-[1.55] text-graybase">
                      {link.hint}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-2 h-4 w-4 text-ink/30 transition-all duration-300 ease-out group-hover/link:translate-x-1 group-hover/link:text-marine"
                    strokeWidth={1.75}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Petit pied de page « appeler la réception » — une ligne, sobre. */}
      <footer className="px-4 sm:px-6 lg:px-10 py-6 md:py-8 border-t border-ink/[0.06]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[12.5px] md:text-[13px] text-graybase">
            Besoin de parler à quelqu'un ?{" "}
            <a
              href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`}
              className="text-ink hover:text-marine transition-colors underline decoration-marine/40 underline-offset-2"
            >
              Appeler la réception · {hotel.contact.phonePrimary}
            </a>
          </p>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/45">
            {hotel.name} · {hotel.address.city}
          </p>
        </div>
      </footer>
    </main>
  );
}
