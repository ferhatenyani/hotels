// LookupForm — formulaire client pour /booking/lookup.
//
// Cherche dans localStorage `hdl:bookings` un instantané dont la ref
// correspond ET dont l'e-mail stocké correspond à celui saisi
// (insensible à la casse, trim). Si trouvé, route vers
// /booking/confirmation/[ref]. Sinon, affiche un discret « impossible de
// retrouver cette réservation sur cet appareil — appelez la réception ».
//
// Pas de backend, pas d'auth — la philosophie « réservation directe »
// veut que la réception possède les vraies réservations ; ceci est un
// outil libre-service pour retrouver le reçu.

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Phone, Mail } from "lucide-react";

import { Field } from "@/components/site/FormField";
import { hotel } from "@/lib/data/hotel";
import type { BookingSnapshot } from "@/lib/booking/types";

const BOOKINGS_KEY = "hdl:bookings";

export default function LookupForm() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ ref?: string; email?: string }>({});
  const [notFound, setNotFound] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: { ref?: string; email?: string } = {};
    const cleanRef = ref.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanRef) next.ref = "La référence de réservation est requise.";
    if (!cleanEmail) next.email = "L'e-mail est requis.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail))
      next.email = "Utilisez une adresse e-mail valide.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setNotFound(false);
      return;
    }

    try {
      const raw = localStorage.getItem(BOOKINGS_KEY);
      const list: BookingSnapshot[] = raw ? JSON.parse(raw) : [];
      const match = list.find(
        (b) =>
          b.ref.toUpperCase() === cleanRef &&
          b.guest.email.trim().toLowerCase() === cleanEmail,
      );
      if (match) {
        router.push(`/booking/confirmation/${encodeURIComponent(match.ref)}`);
        return;
      }
    } catch {
      /* on avale — on affiche l'état « introuvable » */
    }
    setNotFound(true);
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Trouver votre réservation"
      className="flex flex-col gap-7 pb-24 md:pb-0"
    >
      <Field
        name="ref"
        label="Référence de réservation"
        placeholder="HDL-2026-XXXXX"
        required
        autoComplete="off"
        value={ref}
        onChange={(e) => {
          setRef(e.target.value);
          if (notFound) setNotFound(false);
        }}
        error={errors.ref}
        helper="Ressemble à HDL-2026-7F3A1."
      />
      <Field
        name="email"
        label="E-mail utilisé lors de la réservation"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (notFound) setNotFound(false);
        }}
        error={errors.email}
      />

      {notFound && (
        <div
          role="status"
          className="rounded-2xl border border-ink/15 bg-ink/[0.02] p-5 md:p-6"
        >
          <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            Pas sur cet appareil
          </p>
          <p className="mt-2 font-display text-[16px] md:text-[18px] font-medium text-ink leading-tight">
            Nous n&apos;avons pas trouvé cette réservation sur cet appareil —
            merci d&apos;appeler la réception.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-full bg-marine text-white px-5 py-2.5 min-h-[44px] font-sans text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-marine/90 transition-colors"
            >
              <Phone className="h-4 w-4" strokeWidth={1.75} />
              {hotel.contact.phonePrimary}
            </a>
            <a
              href={`mailto:${hotel.contact.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-5 py-2.5 min-h-[44px] font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/75 hover:bg-ink hover:text-white hover:border-ink transition-colors"
            >
              <Mail className="h-4 w-4" strokeWidth={1.75} />
              Écrire à la réception
            </a>
          </div>
        </div>
      )}

      {/* CTA desktop */}
      <div className="hidden md:flex items-center justify-between gap-6 pt-2">
        <p className="font-sans text-[12px] text-graybase max-w-sm">
          Pas de compte, pas de mot de passe. Juste votre référence et votre
          e-mail.
        </p>
        <button
          type="submit"
          className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white bg-marine border border-marine rounded-full px-8 py-4 transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
        >
          Trouver ma réservation
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
            strokeWidth={2.25}
          />
        </button>
      </div>

      {/* CTA collante mobile */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors active:bg-marine/90"
        >
          Trouver ma réservation
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}
