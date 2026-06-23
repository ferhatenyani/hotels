// ConfirmationClient — receives a booking ref and resolves the reservation
// snapshot from localStorage `hdl:bookings`. If the user opens this page on
// a different device (or with a wiped browser) we can't help — we lean
// honest and point them to the desk, mirroring the brand promise that "we
// confirm every reservation ourselves".
//
// The success layout mirrors the Confirmation component in Contact.tsx:
// a small marine seal, an italic display headline, and a quiet supporting
// paragraph. We pile the practical bits (booking ref, dates, total, ICS
// download) underneath.

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { Check, Copy, CalendarPlus, Phone, Mail } from "lucide-react";

import { Button } from "@/components/site/Button";
import { hotel, formatDA } from "@/lib/data/hotel";
import { getRoomBySlug } from "@/lib/data/rooms";
import { addOns as ALL_ADD_ONS } from "@/lib/booking/types";
import type { BookingSnapshot } from "@/lib/booking/types";

const BOOKINGS_KEY = "hdl:bookings";

type Props = {
  ref: string;
};

export default function ConfirmationClient({ ref: bookingRef }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [snapshot, setSnapshot] = useState<BookingSnapshot | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOOKINGS_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const list = JSON.parse(raw) as BookingSnapshot[];
      const match = list.find((b) => b.ref === bookingRef) ?? null;
      setSnapshot(match);
    } catch {
      /* ignore — null snapshot triggers the helpful fallback below */
    }
    setHydrated(true);
  }, [bookingRef]);

  const room = snapshot ? getRoomBySlug(snapshot.roomSlug) : undefined;
  const checkIn = snapshot?.checkIn ? parseISO(snapshot.checkIn) : undefined;
  const checkOut = snapshot?.checkOut
    ? parseISO(snapshot.checkOut)
    : undefined;

  const selectedAddOns = useMemo(
    () =>
      snapshot
        ? ALL_ADD_ONS.filter((a) => snapshot.addOnIds.includes(a.id))
        : [],
    [snapshot],
  );

  const onCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(bookingRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const icsHref = useMemo(() => {
    if (!snapshot || !room || !checkIn || !checkOut) return null;
    return buildIcsHref({
      ref: snapshot.ref,
      summary: `Stay at Hôtel du Lac — ${room.name}`,
      description: `Reservation ${snapshot.ref}. Lead guest: ${snapshot.guest.firstName} ${snapshot.guest.lastName}.`,
      location: `${hotel.name}, ${hotel.address.street}, ${hotel.address.postalCode} ${hotel.address.city}, ${hotel.address.country}`,
      start: checkIn,
      end: checkOut,
    });
  }, [snapshot, room, checkIn, checkOut]);

  if (!hydrated) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-live="polite">
        <div className="h-12 w-48 bg-ink/[0.05] rounded animate-pulse" />
        <div className="h-16 w-3/4 bg-ink/[0.05] rounded animate-pulse" />
        <div className="h-64 bg-ink/[0.05] rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Not-found state.
  if (!snapshot || !room || !checkIn || !checkOut) {
    return (
      <section className="flex flex-col items-start gap-6 py-2">
        <div className="flex items-center gap-3">
          <span className="font-display text-[12px] tabular-nums text-marine tracking-tight">
            {bookingRef}
          </span>
        </div>
        <h1 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance">
          We couldn&apos;t find this reservation in your browser.
        </h1>
        <p className="font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase max-w-[44ch]">
          You may have opened the link on a different device, or your browser
          storage has been cleared. We confirm every reservation ourselves —
          please call the desk and we&apos;ll find you in a moment.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white bg-marine border border-marine rounded-full px-6 py-3.5 min-h-[48px] hover:bg-marine/90 transition-colors"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} />
            {hotel.contact.phonePrimary}
          </a>
          <a
            href={`mailto:${hotel.contact.email}`}
            className="inline-flex items-center justify-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-ink border border-ink/30 rounded-full px-6 py-3.5 min-h-[48px] hover:bg-ink hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} />
            Email the desk
          </a>
          <Link
            href="/booking/lookup"
            className="inline-flex items-center justify-center font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/70 hover:text-ink min-h-[48px] px-2 transition-colors"
          >
            Find another booking
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article className="flex flex-col gap-8">
      {/* Success seal — mirrors the Confirmation component in Contact.tsx */}
      <header className="flex flex-col items-start gap-6 pb-2">
        <div className="flex items-center gap-4">
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-marine/30">
            <span className="absolute inset-1 rounded-full bg-marine/10" />
            <Check
              className="relative h-4 w-4 text-marine"
              strokeWidth={2}
              aria-hidden
            />
          </span>
          <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-marine">
            Sealed and sent
          </p>
        </div>
        <h1 className="font-display text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance max-w-[24ch]">
          Your reservation is on the desk.{" "}
          <span className="italic font-normal text-graybase">
            We&apos;ll be expecting you.
          </span>
        </h1>
        <p className="font-sans text-[15px] leading-[1.7] text-graybase max-w-[44ch]">
          A copy has been saved to this browser — a real email confirmation
          would follow in production. If a date is pressing, do telephone the
          hotel directly.
        </p>
      </header>

      {/* Booking ref — large, copyable */}
      <section
        aria-label="Booking reference"
        className="rounded-2xl border border-ink/10 bg-cream/30 p-5 md:p-7"
      >
        <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          Booking reference
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <p className="font-display text-[28px] xs:text-[32px] md:text-[42px] tracking-tight text-ink tabular-nums leading-none">
            {bookingRef}
          </p>
          <button
            type="button"
            onClick={onCopyRef}
            className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-4 py-2.5 min-h-[44px] font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/75 hover:bg-ink hover:text-white hover:border-ink transition-colors"
            aria-live="polite"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-3 font-sans text-[12.5px] text-ink/55 leading-[1.6] max-w-[52ch]">
          Keep this somewhere safe — you can use it to find your booking
          later from any device on the lookup page.
        </p>
      </section>

      {/* Room + dates + total */}
      <section
        aria-label="Stay summary"
        className="rounded-2xl border border-ink/10 bg-white overflow-hidden"
      >
        <div className="relative h-[180px] md:h-[220px] bg-ink/5">
          <Image
            src={room.cover}
            alt={room.coverAlt}
            fill
            sizes="(max-width: 920px) 100vw, 920px"
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-ink/0"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-white/80">
              Your room
            </p>
            <p className="mt-1.5 font-display text-[22px] md:text-[26px] font-medium text-white leading-tight tracking-tight">
              {room.name}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink/10">
          <SummaryStat
            label="Check-in"
            value={format(checkIn, "EEE, d MMM yyyy")}
            hint="From 14:00"
          />
          <SummaryStat
            label="Check-out"
            value={format(checkOut, "EEE, d MMM yyyy")}
            hint="By 12:00"
          />
          <SummaryStat
            label="Guests"
            value={
              snapshot.children > 0
                ? `${snapshot.adults} adult${snapshot.adults === 1 ? "" : "s"} · ${snapshot.children} child${snapshot.children === 1 ? "" : "ren"}`
                : `${snapshot.adults} adult${snapshot.adults === 1 ? "" : "s"}`
            }
            hint={snapshot.guest.firstName + " " + snapshot.guest.lastName}
          />
        </dl>
        <div className="p-5 md:p-7 border-t border-ink/10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              Total · demo
            </p>
            <p className="mt-1.5 font-display text-[26px] md:text-[30px] font-semibold text-ink leading-none">
              {formatDA(snapshot.total)}
            </p>
            {selectedAddOns.length > 0 && (
              <p className="mt-2 font-sans text-[12.5px] text-ink/55">
                Includes {selectedAddOns.length} add-on
                {selectedAddOns.length === 1 ? "" : "s"}:{" "}
                {selectedAddOns.map((a) => a.label).join(", ")}.
              </p>
            )}
          </div>
          {icsHref && (
            <a
              href={icsHref}
              download={`hotel-du-lac-${bookingRef}.ics`}
              className="inline-flex items-center gap-2 rounded-full bg-marine text-white px-5 py-3 min-h-[44px] font-sans text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-marine/90 transition-colors"
            >
              <CalendarPlus className="h-4 w-4" strokeWidth={1.75} />
              Add to calendar
            </a>
          )}
        </div>
      </section>

      {/* Practical next steps */}
      <section
        aria-label="What's next"
        className="rounded-2xl border border-ink/10 bg-white p-5 md:p-7"
      >
        <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          What&apos;s next
        </p>
        <h2 className="mt-1.5 font-display text-[18px] md:text-[20px] font-medium text-ink leading-tight tracking-tight">
          A few practical notes.
        </h2>
        <ul className="mt-4 space-y-3 font-sans text-[14px] leading-[1.65] text-ink/75">
          <li>
            <span className="font-medium text-ink">Check-in:</span> from 14:00,
            at the front desk in the lobby. Please bring a valid ID, and a
            marriage booklet for couples.
          </li>
          <li>
            <span className="font-medium text-ink">Need to amend?</span>{" "}
            Telephone the desk on{" "}
            <a
              href={`tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`}
              className="text-marine hover:underline"
            >
              {hotel.contact.phonePrimary}
            </a>{" "}
            — we confirm and change every reservation ourselves.
          </li>
          <li>
            <span className="font-medium text-ink">Save your reference</span>{" "}
            — you can{" "}
            <Link
              href="/booking/lookup"
              className="text-marine hover:underline"
            >
              find your booking later
            </Link>{" "}
            with your reference and email.
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3 pb-4">
        <Button href="/" variant="primary" size="default" arrow>
          Back to the hotel
        </Button>
        <Button href="/booking/lookup" variant="secondary" size="default">
          Find a booking
        </Button>
      </div>
    </article>
  );
}

function SummaryStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="p-5 md:p-6">
      <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
        {label}
      </p>
      <p className="mt-2 font-display text-[16px] md:text-[18px] font-medium text-ink leading-tight">
        {value}
      </p>
      {hint && (
        <p className="mt-1.5 font-sans text-[12px] text-ink/55">{hint}</p>
      )}
    </div>
  );
}

// --- ICS download builder --------------------------------------------------

type IcsInput = {
  ref: string;
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
};

/** Build a data: URI for an .ics calendar event the user can download. */
function buildIcsHref({
  ref,
  summary,
  description,
  location,
  start,
  end,
}: IcsInput): string {
  // .ics expects all-day events as DATE values in YYYYMMDD form. Hotel
  // stays naturally map to all-day events; DTEND is exclusive.
  const fmt = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hotel du Lac//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ref}@hoteldulacvert.dz`,
    `DTSTAMP:${fmt(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${fmt(start)}`,
    `DTEND;VALUE=DATE:${fmt(end)}`,
    `SUMMARY:${escape(summary)}`,
    `LOCATION:${escape(location)}`,
    `DESCRIPTION:${escape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const ics = lines.join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
