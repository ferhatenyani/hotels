// PaymentClient — formulaire de carte simulé. NE DÉBITE JAMAIS DE CARTE.
//
// Ce flux est explicitement une démo. Le formulaire ressemble à un vrai
// formulaire PCI, mais ne fait aucun appel réseau. À la soumission, on :
//   1. Génère une référence de réservation via makeBookingRef.
//   2. Persiste un instantané de la réservation — slug de chambre, dates,
//      voyageur, suppléments, total, ref, horodatage — dans localStorage
//      sous `hdl:bookings`.
//   3. Route vers /booking/confirmation/[ref], où le client retrouve la
//      réservation par ref.
//
// Le numéro de carte / l'expiration / le CVC sont masqués/formatés à
// la saisie, mais ne sont jamais envoyés.

"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

import { Field } from "@/components/site/FormField";
import BookingSummary, {
  BookingSummaryChip,
} from "@/components/booking/BookingSummary";

import { bookingHref, encodeDate } from "@/lib/booking/params";
import { addOns as ALL_ADD_ONS } from "@/lib/booking/types";
import type {
  AddOn,
  BookingQuery,
  BookingSnapshot,
  GuestDetails,
} from "@/lib/booking/types";
import { computeBreakdown, makeBookingRef } from "@/lib/booking/pricing";
import type { Room } from "@/lib/data/rooms";
import { formatDA, hotel } from "@/lib/data/hotel";

const GUEST_KEY = "hdl:booking-guest";
const ADDONS_KEY = "hdl:booking-addons";
const BOOKINGS_KEY = "hdl:bookings";

type Props = {
  room: Room;
  q: BookingQuery;
};

type CardFields = {
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardName: string;
  billingCountry: string;
};

type FieldErrors = Partial<Record<keyof CardFields, string>>;

export default function PaymentClient({ room, q }: Props) {
  const router = useRouter();
  const [guest, setGuest] = useState<GuestDetails | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<AddOn["id"]>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  const [card, setCard] = useState<CardFields>({
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardName: "",
    billingCountry: hotel.country,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const rawGuest = sessionStorage.getItem(GUEST_KEY);
      if (!rawGuest) {
        router.replace(bookingHref("guest", q));
        return;
      }
      setGuest(JSON.parse(rawGuest) as GuestDetails);
    } catch {
      router.replace(bookingHref("guest", q));
      return;
    }
    try {
      const rawAddOns = sessionStorage.getItem(ADDONS_KEY);
      if (rawAddOns) {
        const ids = JSON.parse(rawAddOns) as AddOn["id"][];
        if (Array.isArray(ids)) setSelectedIds(new Set(ids));
      }
    } catch {
      /* ignore */
    }
    // Pré-remplit le nom du titulaire à partir du voyageur si disponible.
    setHydrated(true);
  }, [router, q]);

  useEffect(() => {
    if (guest && !card.cardName) {
      setCard((prev) => ({
        ...prev,
        cardName: `${guest.firstName} ${guest.lastName}`.trim(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest]);

  const selectedAddOns = useMemo<AddOn[]>(
    () => ALL_ADD_ONS.filter((a) => selectedIds.has(a.id)),
    [selectedIds],
  );

  const breakdown = useMemo(
    () => computeBreakdown(room, q, selectedAddOns),
    [room, q, selectedAddOns],
  );

  const update = <K extends keyof CardFields>(key: K, value: string) => {
    setCard((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Masque le numéro de carte en groupes de 4 (1234 5678 9012 3456).
  // Retire les non-chiffres et limite à 16.
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // Formate la date d'expiration en MM/AA.
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const formatCvc = (value: string) => value.replace(/\D/g, "").slice(0, 4);

  const validate = (c: CardFields): FieldErrors => {
    const next: FieldErrors = {};
    const digits = c.cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) next.cardNumber = "Le numéro de carte doit comporter 16 chiffres.";
    if (!/^\d{2}\/\d{2}$/.test(c.expiry))
      next.expiry = "Utilisez le format MM/AA.";
    else {
      const [mmStr, yyStr] = c.expiry.split("/");
      const mm = Number(mmStr);
      if (mm < 1 || mm > 12) next.expiry = "Mois invalide.";
      else {
        // Vérification naïve de future expiration : on suppose 20AA.
        const yy = Number(yyStr);
        const expDate = new Date(2000 + yy, mm, 0);
        if (expDate < new Date()) next.expiry = "La carte a expiré.";
      }
    }
    if (c.cvc.length < 3 || c.cvc.length > 4)
      next.cvc = "Le CVC doit comporter 3 ou 4 chiffres.";
    if (!c.cardName.trim()) next.cardName = "Le nom du titulaire est requis.";
    if (!c.billingCountry.trim())
      next.billingCountry = "Le pays de facturation est requis.";
    return next;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(card);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (!guest) return;
    setSubmitting(true);

    const ref = makeBookingRef();
    const snapshot: BookingSnapshot = {
      ref,
      createdAt: new Date().toISOString(),
      roomSlug: room.slug,
      // Store as YYYY-MM-DD (date-only) to match the URL serialisation,
      // so re-hydrating on the confirmation page uses the same Date object
      // semantics as elsewhere in the funnel.
      checkIn: encodeDate(q.checkIn) ?? null,
      checkOut: encodeDate(q.checkOut) ?? null,
      adults: q.adults,
      children: q.children,
      promo: q.promo,
      addOnIds: [...selectedIds],
      total: breakdown.total,
      guest,
    };

    try {
      const raw = localStorage.getItem(BOOKINGS_KEY);
      const list: BookingSnapshot[] = raw ? JSON.parse(raw) : [];
      list.unshift(snapshot);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
    } catch {
      /* mode privé tolérant — la page de confirmation rendra encore
         l'instantané par la ref dans l'URL ; si la persistance locale
         échoue, on bascule proprement sur le texte « réservation
         introuvable ». */
    }

    router.push(bookingHref("confirmation", q, ref));
  };

  if (!hydrated || !guest) {
    return (
      <div
        className="mt-10 grid gap-4"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="h-16 bg-ink/[0.05] rounded-2xl animate-pulse" />
        <div className="h-72 bg-ink/[0.05] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mt-8 lg:mt-12 grid lg:grid-cols-3 gap-8 lg:gap-12">
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label="Paiement"
        className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6 md:gap-8 pb-28 lg:pb-0"
      >
        {/* Badge démo uniquement. À CONSERVER. */}
        <div
          role="status"
          className="rounded-2xl border border-marine/30 bg-marine/[0.05] p-5 md:p-6 flex items-start gap-4"
        >
          <span className="hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marine text-white">
            <Lock className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-marine">
              Paiement sécurisé (démo)
            </p>
            <p className="mt-1.5 font-display text-[18px] md:text-[20px] font-medium text-ink leading-tight tracking-tight">
              Démo uniquement — aucune carte n&apos;est débitée.
            </p>
            <p className="mt-2 font-sans text-[13px] leading-[1.6] text-ink/70">
              Cette page est un aperçu fidèle du tunnel de réservation. Rien
              n&apos;est envoyé. Nous confirmons chaque vraie réservation
              nous-mêmes — réservation directe, sans intermédiaire.
            </p>
          </div>
        </div>

        {/* Formulaire de carte */}
        <section
          aria-labelledby="card-title"
          className="rounded-2xl border border-ink/10 bg-white p-5 md:p-7 lg:p-9"
        >
          <div className="flex items-baseline justify-between gap-3 mb-6">
            <h2
              id="card-title"
              className="font-display text-[20px] md:text-[24px] font-medium text-ink leading-tight tracking-tight"
            >
              Détails de la carte
            </h2>
            <span className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.18em] text-ink/55">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              Démo uniquement
            </span>
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            <Field
              name="cardNumber"
              label="Numéro de carte"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              required
              value={card.cardNumber}
              onChange={(e) =>
                update("cardNumber", formatCardNumber(e.target.value))
              }
              error={errors.cardNumber}
            />

            <div className="grid grid-cols-2 gap-6 md:gap-8">
              <Field
                name="expiry"
                label="Expiration"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                required
                value={card.expiry}
                onChange={(e) =>
                  update("expiry", formatExpiry(e.target.value))
                }
                error={errors.expiry}
              />
              <Field
                name="cvc"
                label="CVC"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                required
                value={card.cvc}
                onChange={(e) => update("cvc", formatCvc(e.target.value))}
                error={errors.cvc}
              />
            </div>

            <Field
              name="cardName"
              label="Nom du titulaire"
              autoComplete="cc-name"
              required
              value={card.cardName}
              onChange={(e) => update("cardName", e.target.value)}
              error={errors.cardName}
            />

            <Field
              name="billingCountry"
              label="Pays de facturation"
              autoComplete="country-name"
              required
              value={card.billingCountry}
              onChange={(e) => update("billingCountry", e.target.value)}
              error={errors.billingCountry}
            />
          </div>

          <p className="mt-7 font-sans text-[12px] leading-[1.6] text-ink/55">
            En continuant, vous acceptez nos politiques. Rappel — cette page
            est une démonstration. Aucun prestataire de paiement n&apos;est
            contacté, aucun montant n&apos;est prélevé.
          </p>
        </section>

        {/* CTA desktop */}
        <div className="hidden lg:flex items-center justify-between gap-6 pt-2">
          <p className="font-sans text-[12px] text-graybase max-w-sm">
            Total <span className="font-display tabular-nums text-ink">{formatDA(breakdown.total)}</span> — confirmation de démo uniquement.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white bg-marine border border-marine rounded-full px-8 py-4 transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine disabled:opacity-50"
          >
            {submitting ? "Confirmation…" : "Confirmer la réservation"}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
              strokeWidth={2.25}
            />
          </button>
        </div>

        {/* CTA collante mobile */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors active:bg-marine/90 disabled:opacity-50"
          >
            {submitting
              ? "Confirmation…"
              : `Confirmer · ${formatDA(breakdown.total)}`}
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </form>

      {/* Summary column */}
      <div className="order-1 lg:order-2">
        <div className="lg:hidden mb-2">
          <BookingSummaryChip
            room={room}
            q={q}
            selectedAddOns={selectedAddOns}
          />
        </div>
        <div className="hidden lg:block lg:sticky lg:top-24">
          <BookingSummary
            room={room}
            q={q}
            selectedAddOns={selectedAddOns}
          />
        </div>
      </div>
    </div>
  );
}
