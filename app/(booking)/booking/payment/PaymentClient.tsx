// PaymentClient — mocked card form. NEVER CHARGES ANY CARD.
//
// The orchestrator brief is explicit: this is a demo flow. The form looks
// like a real PCI card form but does no network call. On submit we:
//   1. Generate a booking reference via makeBookingRef.
//   2. Persist a booking snapshot — room slug, dates, guest, add-ons,
//      total, ref, timestamp — to localStorage under `hdl:bookings`.
//   3. Route to /booking/confirmation/[ref], where the client can find the
//      booking again by ref.
//
// Card number/expiry/CVC are masked/formatted on input but never sent.

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
import { formatDA } from "@/lib/data/hotel";

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
    billingCountry: "Algeria",
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
    // Pre-fill the cardholder name from the guest if available.
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

  // Mask card number into groups of 4 (1234 5678 9012 3456). Strips
  // non-digits and caps at 16.
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // Format expiry as MM/YY.
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const formatCvc = (value: string) => value.replace(/\D/g, "").slice(0, 4);

  const validate = (c: CardFields): FieldErrors => {
    const next: FieldErrors = {};
    const digits = c.cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) next.cardNumber = "Card number must be 16 digits.";
    if (!/^\d{2}\/\d{2}$/.test(c.expiry))
      next.expiry = "Use MM/YY.";
    else {
      const [mmStr, yyStr] = c.expiry.split("/");
      const mm = Number(mmStr);
      if (mm < 1 || mm > 12) next.expiry = "Invalid month.";
      else {
        // Naive expiry future check: assume 20YY.
        const yy = Number(yyStr);
        const expDate = new Date(2000 + yy, mm, 0);
        if (expDate < new Date()) next.expiry = "Card has expired.";
      }
    }
    if (c.cvc.length < 3 || c.cvc.length > 4)
      next.cvc = "CVC must be 3 or 4 digits.";
    if (!c.cardName.trim()) next.cardName = "Cardholder name is required.";
    if (!c.billingCountry.trim())
      next.billingCountry = "Billing country is required.";
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
      /* private-mode safe — confirmation page will still render the
         snapshot in URL ref; if local persistence fails it gracefully
         degrades to the "couldn't find this reservation" copy. */
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
        aria-label="Payment"
        className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6 md:gap-8 pb-28 lg:pb-0"
      >
        {/* Demo-only badge. THIS IS LOAD-BEARING per the brief. */}
        <div
          role="status"
          className="rounded-2xl border border-marine/30 bg-marine/[0.05] p-5 md:p-6 flex items-start gap-4"
        >
          <span className="hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marine text-white">
            <Lock className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-marine">
              Secure (demo) payment
            </p>
            <p className="mt-1.5 font-display text-[18px] md:text-[20px] font-medium text-ink leading-tight tracking-tight">
              Demo only — no card is charged.
            </p>
            <p className="mt-2 font-sans text-[13px] leading-[1.6] text-ink/70">
              This page is a faithful preview of the booking flow. Nothing is
              sent anywhere. We confirm every real reservation ourselves —
              direct booking, no third parties.
            </p>
          </div>
        </div>

        {/* Card form */}
        <section
          aria-labelledby="card-title"
          className="rounded-2xl border border-ink/10 bg-white p-5 md:p-7 lg:p-9"
        >
          <div className="flex items-baseline justify-between gap-3 mb-6">
            <h2
              id="card-title"
              className="font-display text-[20px] md:text-[24px] font-medium text-ink leading-tight tracking-tight"
            >
              Card details
            </h2>
            <span className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.18em] text-ink/55">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              Demo only
            </span>
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            <Field
              index="01"
              name="cardNumber"
              label="Card number"
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
                index="02"
                name="expiry"
                label="Expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                required
                value={card.expiry}
                onChange={(e) =>
                  update("expiry", formatExpiry(e.target.value))
                }
                error={errors.expiry}
              />
              <Field
                index="03"
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
              index="04"
              name="cardName"
              label="Cardholder name"
              autoComplete="cc-name"
              required
              value={card.cardName}
              onChange={(e) => update("cardName", e.target.value)}
              error={errors.cardName}
            />

            <Field
              index="05"
              name="billingCountry"
              label="Billing country"
              autoComplete="country-name"
              required
              value={card.billingCountry}
              onChange={(e) => update("billingCountry", e.target.value)}
              error={errors.billingCountry}
            />
          </div>

          <p className="mt-7 font-sans text-[12px] leading-[1.6] text-ink/55">
            By continuing you agree to our policies. Reminder — this is a
            demonstration page. No payment provider is contacted, no money
            moves.
          </p>
        </section>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center justify-between gap-6 pt-2">
          <p className="font-sans text-[12px] text-graybase max-w-sm">
            Total <span className="font-display tabular-nums text-ink">{formatDA(breakdown.total)}</span> — demo confirmation only.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white bg-marine border border-marine rounded-full px-8 py-4 transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine disabled:opacity-50"
          >
            {submitting ? "Confirming…" : "Confirm reservation"}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
              strokeWidth={2.25}
            />
          </button>
        </div>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors active:bg-marine/90 disabled:opacity-50"
          >
            {submitting
              ? "Confirming…"
              : `Confirm · ${formatDA(breakdown.total)}`}
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
