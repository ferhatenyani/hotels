// /rooms/[slug] booking widget. Two faces, one piece of state:
//   - lg sticky sidebar card (price + dates + guests + Reserve)
//   - mobile bottom action bar (price + Reserve that opens the same card
//     inline above the bar when the user taps "Pick dates")
//
// On submit we navigate to /booking/results with the room slug, dates and
// guest counts prefilled — keeping the funnel's URL-as-state contract intact.

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import { ArrowRight, Bed, Maximize2, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import Stepper from "@/components/site/Stepper";
import { formatDA } from "@/lib/data/hotel";
import { bookingHref } from "@/lib/booking/params";
import type { Room } from "@/lib/data/rooms";

type Props = {
  room: Room;
  /** Initial values lifted from the URL — let visitors deep-link an inquiry. */
  initial?: {
    checkIn?: Date;
    checkOut?: Date;
    adults?: number;
    children?: number;
  };
};

const today = () => {
  // YYYY-MM-DD for native <input type="date" min>.
  return format(new Date(), "yyyy-MM-dd");
};

const tomorrow = () => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return format(t, "yyyy-MM-dd");
};

export default function BookThisRoom({ room, initial }: Props) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState(
    initial?.checkIn ? format(initial.checkIn, "yyyy-MM-dd") : "",
  );
  const [checkOut, setCheckOut] = useState(
    initial?.checkOut ? format(initial.checkOut, "yyyy-MM-dd") : "",
  );
  const [adults, setAdults] = useState(
    Math.min(Math.max(initial?.adults ?? 2, 1), room.sleeps),
  );
  const [childrenCount, setChildrenCount] = useState(
    Math.max(initial?.children ?? 0, 0),
  );

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const a = parseISO(checkIn);
    const b = parseISO(checkOut);
    const n = differenceInCalendarDays(b, a);
    return n > 0 ? n : 0;
  }, [checkIn, checkOut]);

  const totalGuests = adults + childrenCount;
  const overCapacity = totalGuests > room.sleeps;
  const datesValid = nights > 0;

  const ctaDisabled = overCapacity || (checkIn !== "" && !datesValid);
  const liveTotal = datesValid ? room.priceDA * nights : null;

  const submit = () => {
    if (ctaDisabled) return;
    const url = bookingHref("results", {
      roomSlug: room.slug,
      checkIn: checkIn ? parseISO(checkIn) : undefined,
      checkOut: checkOut ? parseISO(checkOut) : undefined,
      adults,
      children: childrenCount,
    });
    router.push(url);
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  // ─── DESKTOP CARD ─────────────────────────────────────────────────────────
  const card = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="border border-ink/10 bg-white rounded-2xl shadow-[0_18px_44px_-24px_rgba(21,19,22,0.22)] overflow-hidden"
      aria-label={`Book the ${room.name}`}
    >
      {/* Header: price + per-night */}
      <div className="px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-ink/10">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55">
          From
        </p>
        <p className="mt-1.5 font-display font-semibold text-[28px] md:text-[30px] text-ink leading-none">
          {formatDA(room.priceDA)}
          <span className="font-sans text-[12px] font-normal text-graybase ml-1.5">
            / night
          </span>
        </p>
        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[12px] text-graybase">
          <li className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-ink/55" strokeWidth={1.75} />
            Sleeps {room.sleeps}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Maximize2
              className="h-3.5 w-3.5 text-ink/55"
              strokeWidth={1.75}
            />
            {room.sizeDisplay}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Bed className="h-3.5 w-3.5 text-ink/55" strokeWidth={1.75} />
            {room.beds
              .map((b) => `${b.count} ${b.type}${b.count > 1 ? "s" : ""}`)
              .join(" · ")}
          </li>
        </ul>
      </div>

      {/* Dates */}
      <div className="px-5 md:px-6 py-4 grid grid-cols-2 gap-3 border-b border-ink/10">
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55">
            Check-in
          </span>
          <input
            type="date"
            min={today()}
            value={checkIn}
            onChange={(e) => {
              const v = e.target.value;
              setCheckIn(v);
              // Auto-bump check-out to keep nights >= 1.
              if (v && checkOut && checkOut <= v) {
                const d = parseISO(v);
                d.setDate(d.getDate() + 1);
                setCheckOut(format(d, "yyyy-MM-dd"));
              }
            }}
            className="font-sans text-[14px] text-ink bg-transparent border border-ink/15 rounded-lg px-3 py-2.5 min-h-[44px] outline-none focus:border-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55">
            Check-out
          </span>
          <input
            type="date"
            min={checkIn || tomorrow()}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="font-sans text-[14px] text-ink bg-transparent border border-ink/15 rounded-lg px-3 py-2.5 min-h-[44px] outline-none focus:border-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
          />
        </label>
      </div>

      {/* Steppers */}
      <div className="px-5 md:px-6 py-2 divide-y divide-ink/10 border-b border-ink/10">
        <Stepper
          label="Adults"
          hint="13+ years"
          value={adults}
          min={1}
          max={Math.max(room.sleeps, 1)}
          onChange={setAdults}
        />
        <Stepper
          label="Children"
          hint="0–12 years"
          value={childrenCount}
          min={0}
          max={Math.max(room.sleeps - 1, 0)}
          onChange={setChildrenCount}
        />
      </div>

      {/* Footer: total + CTA */}
      <div className="px-5 md:px-6 py-4">
        {liveTotal ? (
          <div className="mb-3 flex items-baseline justify-between font-sans text-[13px] text-graybase">
            <span>
              {formatDA(room.priceDA)} × {nights} night
              {nights === 1 ? "" : "s"}
            </span>
            <span className="font-display font-semibold text-[16px] text-ink">
              {formatDA(liveTotal)}
            </span>
          </div>
        ) : (
          <p className="mb-3 font-sans text-[12px] text-ink/55">
            Pick dates to see the room total.
          </p>
        )}
        {overCapacity && (
          <p
            role="alert"
            className="mb-3 font-sans text-[12px] text-destructive"
          >
            This room sleeps {room.sleeps}. Try the {" "}
            <a
              href="/rooms"
              className="underline underline-offset-2 hover:text-marine"
            >
              listing
            </a>{" "}
            for larger spaces.
          </p>
        )}
        <button
          type="submit"
          disabled={ctaDisabled}
          className={cn(
            "group/btn inline-flex w-full items-center justify-center gap-2 min-h-[52px] rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ease-out hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          Reserve
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5"
            strokeWidth={2.25}
          />
        </button>
        <p className="mt-3 font-sans text-[11px] text-ink/55 text-center">
          No payment required to hold a room.
        </p>
      </div>
    </form>
  );

  return (
    <>
      {/* DESKTOP / TABLET sidebar */}
      <div className="hidden md:block">{card}</div>

      {/* MOBILE expandable card — appears above the sticky bar when toggled */}
      <div
        className={cn(
          "md:hidden transition-[max-height,opacity] duration-300 ease-out overflow-hidden",
          mobileOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0",
        )}
        id="mobile-book-card"
        aria-hidden={!mobileOpen}
      >
        <div className="pt-4 pb-2">{card}</div>
      </div>

      {/* MOBILE sticky bottom action bar — visible below md. Tap the price
          to expand the card; tap Reserve to either submit (if dates known)
          or open the picker first. */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-18px_rgba(21,19,22,0.25)]">
        <div className="max-w-[1280px] mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-book-card"
            className="flex flex-col items-start text-left min-h-[44px] justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine rounded-sm"
          >
            <span className="font-display font-semibold text-[18px] text-ink leading-none">
              {liveTotal ? formatDA(liveTotal) : formatDA(room.priceDA)}
            </span>
            <span className="mt-1 font-sans text-[11px] uppercase tracking-[0.18em] text-ink/55">
              {liveTotal
                ? `Total · ${nights} night${nights === 1 ? "" : "s"}`
                : mobileOpen
                  ? "Close picker"
                  : "Pick dates"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!datesValid) {
                setMobileOpen(true);
                return;
              }
              submit();
            }}
            disabled={overCapacity}
            className={cn(
              "ml-auto inline-flex items-center justify-center gap-1.5 min-h-[52px] flex-1 max-w-[200px] rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ease-out hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            Reserve
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </>
  );
}
