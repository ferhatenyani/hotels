// Pied de page du tunnel — ligne directe, e-mail, les deux liens
// utilitaires et la ligne ©. Pas de navigation marketing pour que
// l'utilisateur ne s'écarte pas en cours de réservation. Même langage
// visuel que le Footer marketing (paire de contacts en tuiles sur mobile,
// inline en md+).

import Link from "next/link";
import { Phone, Mail } from "lucide-react";

import { hotel } from "@/lib/data/hotel";

export default function BookingFooter() {
  const telHref = `tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`;
  const mailHref = `mailto:${hotel.contact.email}`;

  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10 py-7 md:py-9">
        {/* Mobile-first : une ligne de réassurance compacte, puis deux tuiles
            côte à côte pour que les options d'aide ne se chevauchent pas. */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex flex-col gap-1">
            <p className="font-sans text-[13px] text-ink/80 leading-snug">
              Besoin d&apos;aide avec votre réservation ?
            </p>
            <p className="font-sans text-[12px] text-ink/55 leading-snug">
              Réservation directe — nous confirmons chaque réservation nous-mêmes.
            </p>
          </div>

          {/* Tuiles de contact. Sur mobile, côte à côte pleine largeur ;
              en md+ on bascule sur des liens inline pour plus de calme. */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            <a
              href={telHref}
              aria-label={`Appeler ${hotel.contact.phonePrimary}`}
              className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-white px-3 py-2.5 min-h-[52px] transition-colors active:bg-ink/[0.03]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine ring-1 ring-marine/15">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/45 leading-none">
                  Appeler
                </span>
                <span className="mt-1 font-sans text-[12px] text-ink leading-tight tabular-nums truncate">
                  {hotel.contact.phonePrimary}
                </span>
              </span>
            </a>
            <a
              href={mailHref}
              aria-label={`Écrire à ${hotel.contact.email}`}
              className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-white px-3 py-2.5 min-h-[52px] transition-colors active:bg-ink/[0.03]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine ring-1 ring-marine/15">
                <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/45 leading-none">
                  E-mail
                </span>
                <span className="mt-1 font-sans text-[11px] text-ink leading-tight truncate">
                  {hotel.contact.email}
                </span>
              </span>
            </a>
          </div>

          {/* Ligne inline desktop — plus discrète que les tuiles, fidèle à
              la posture « pas de détours » du tunnel. */}
          <p className="hidden md:block font-sans text-[12px] text-ink/55">
            Appeler{" "}
            <a
              href={telHref}
              className="text-ink hover:text-marine transition-colors tabular-nums"
            >
              {hotel.contact.phonePrimary}
            </a>{" "}
            · Écrire à{" "}
            <a
              href={mailHref}
              className="text-ink hover:text-marine transition-colors"
            >
              {hotel.contact.email}
            </a>
          </p>
        </div>

        {/* Rail du bas — © + les deux liens utilitaires + la sortie. */}
        <div className="mt-6 md:mt-7 border-t border-ink/[0.07] pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[12px] text-ink/45">
            © 2026 {hotel.name} — {hotel.address.city}, {hotel.address.country}.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 font-sans text-[12px] text-ink/55">
            <li>
              <Link
                href="/policies"
                className="inline-flex items-center min-h-[40px] hover:text-ink transition-colors"
              >
                Politiques
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="inline-flex items-center min-h-[40px] hover:text-ink transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="inline-flex items-center min-h-[40px] hover:text-ink transition-colors"
              >
                Retour au site
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
