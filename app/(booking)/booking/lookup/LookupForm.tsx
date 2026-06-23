// LookupForm — client form for /booking/lookup.
//
// Searches localStorage `hdl:bookings` for a snapshot whose ref matches AND
// whose stored email matches the entered one (case-insensitive trim). If
// found, route to /booking/confirmation/[ref]. Otherwise show a quiet
// "couldn't find that booking on this device — please call the desk."
//
// No backend, no auth — direct booking philosophy means the desk owns
// real bookings, this is a self-serve receipt finder.

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
    if (!cleanRef) next.ref = "Booking reference is required.";
    if (!cleanEmail) next.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail))
      next.email = "Use a valid email address.";
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
      /* swallow — show the not-found fallback */
    }
    setNotFound(true);
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Find your booking"
      className="flex flex-col gap-7 pb-24 md:pb-0"
    >
      <Field
        index="01"
        name="ref"
        label="Booking reference"
        placeholder="HDL-2026-XXXXX"
        required
        autoComplete="off"
        value={ref}
        onChange={(e) => {
          setRef(e.target.value);
          if (notFound) setNotFound(false);
        }}
        error={errors.ref}
        helper="Looks like HDL-2026-7F3A1."
      />
      <Field
        index="02"
        name="email"
        label="Email used at booking"
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
            Not on this device
          </p>
          <p className="mt-2 font-display text-[16px] md:text-[18px] font-medium text-ink leading-tight">
            We couldn&apos;t find that booking on this device — please call
            the desk.
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
              Email the desk
            </a>
          </div>
        </div>
      )}

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center justify-between gap-6 pt-2">
        <p className="font-sans text-[12px] text-graybase max-w-sm">
          No account, no password. Just your reference and email.
        </p>
        <button
          type="submit"
          className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white bg-marine border border-marine rounded-full px-8 py-4 transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
        >
          Find my booking
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
            strokeWidth={2.25}
          />
        </button>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors active:bg-marine/90"
        >
          Find my booking
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}
