// ReviewClient — client for /booking/review.
//
// Why a client component:
//   - Reads `hdl:booking-guest` from sessionStorage. The server can't see
//     that (and shouldn't — see GuestForm.tsx for the PII-not-in-URL rule).
//   - Toggles add-ons interactively; the price breakdown updates live.
//   - Persists the selected add-on ids to `hdl:booking-addons` so the next
//     step (/payment) reads them on load.
//
// Layout: lg:grid-cols-3 — left has the room + guest + add-ons sections
// (col-span-2), right has the persistent BookingSummary card (col-span-1,
// sticky). On mobile the summary collapses to a tap-to-expand chip pinned
// at the top, and the Continue CTA sits in a sticky bottom action bar.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, Pencil, Check } from "lucide-react";

import BookingSummary, {
  BookingSummaryChip,
} from "@/components/booking/BookingSummary";
import { bookingHref } from "@/lib/booking/params";
import { addOns as ALL_ADD_ONS } from "@/lib/booking/types";
import type {
  AddOn,
  BookingQuery,
  GuestDetails,
} from "@/lib/booking/types";
import type { Room } from "@/lib/data/rooms";
import { formatDA } from "@/lib/data/hotel";
import { cn } from "@/lib/utils";

const GUEST_KEY = "hdl:booking-guest";
const ADDONS_KEY = "hdl:booking-addons";

type Props = {
  room: Room;
  q: BookingQuery;
};

export default function ReviewClient({ room, q }: Props) {
  const router = useRouter();

  const [guest, setGuest] = useState<GuestDetails | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<AddOn["id"]>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    try {
      const raw = sessionStorage.getItem(GUEST_KEY);
      if (!raw) {
        // No guest details → bounce to /guest. Preserve the URL query so
        // they don't re-pick room and dates.
        router.replace(bookingHref("guest", q));
        return;
      }
      const parsed = JSON.parse(raw) as GuestDetails;
      if (!cancelled) setGuest(parsed);
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

    setHydrated(true);
    return () => {
      cancelled = true;
    };
  }, [router, q]);

  const selectedAddOns = useMemo<AddOn[]>(
    () => ALL_ADD_ONS.filter((a) => selectedIds.has(a.id)),
    [selectedIds],
  );

  const toggleAddOn = (id: AddOn["id"]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        sessionStorage.setItem(ADDONS_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const onContinue = () => {
    // Add-ons already persisted via toggleAddOn. Just route forward.
    router.push(bookingHref("payment", q));
  };

  if (!hydrated || !guest) {
    return (
      <div
        className="mt-10 grid gap-4"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="h-24 bg-ink/[0.05] rounded-2xl animate-pulse" />
        <div className="h-48 bg-ink/[0.05] rounded-2xl animate-pulse" />
        <div className="h-64 bg-ink/[0.05] rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Friendly date strings used in multiple slots.
  const checkInDate = q.checkIn ? format(q.checkIn, "EEE, d MMM") : "—";
  const checkOutDate = q.checkOut
    ? format(q.checkOut, "EEE, d MMM yyyy")
    : "—";
  const nights = q.checkIn && q.checkOut ? Math.max(1, Math.round((q.checkOut.getTime() - q.checkIn.getTime()) / 86_400_000)) : 0;

  return (
    <div className="mt-8 lg:mt-12 grid lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6 md:gap-8 pb-28 lg:pb-0">
        {/* Room — full-bleed photo with the room name and an in-image
            "Change room" link. Photo-first, not card-first. */}
        <section
          aria-label="Your room"
          className="relative overflow-hidden rounded-2xl border border-ink/10 bg-ink/5 isolate"
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9]">
            <Image
              src={room.cover}
              alt={room.coverAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/15 to-ink/0"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 md:p-7">
              <div className="min-w-0">
                <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-white/75">
                  Your room
                </p>
                <p className="mt-2 font-display text-[22px] md:text-[26px] font-medium text-white leading-tight tracking-tight text-balance">
                  {room.name}
                </p>
                <p className="mt-1.5 font-sans text-[12.5px] text-white/75">
                  Sleeps {room.sleeps} · {room.sizeDisplay}
                </p>
              </div>
              <Link
                href={bookingHref("results", q)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/95 hover:bg-white text-ink px-3.5 py-2 min-h-[44px] font-sans text-[10.5px] font-semibold uppercase tracking-[0.18em] backdrop-blur transition-colors"
              >
                <Pencil className="h-3 w-3" strokeWidth={2} />
                Change room
              </Link>
            </div>
          </div>
        </section>

        {/* Stay — dates-led typography. Big tabular dates with the arrow
            between, party + service times underneath, edit hugs the right. */}
        <section
          aria-label="Your stay"
          className="rounded-2xl border border-ink/10 bg-cream/40 p-5 md:p-7"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/60">
              Your stay
            </p>
            <Link
              href={bookingHref("search", q)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-3.5 py-1.5 min-h-[44px] font-sans text-[10.5px] uppercase tracking-[0.18em] text-ink/70 hover:text-ink hover:border-ink/40 transition-colors"
            >
              <Pencil className="h-3 w-3" strokeWidth={2} />
              Change dates
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p className="font-display text-[22px] md:text-[28px] font-medium text-ink tracking-tight leading-none tabular-nums">
              {checkInDate}
            </p>
            <span
              aria-hidden
              className="font-display text-[20px] md:text-[24px] text-marine leading-none"
            >
              →
            </span>
            <p className="font-display text-[22px] md:text-[28px] font-medium text-ink tracking-tight leading-none tabular-nums">
              {checkOutDate}
            </p>
            {nights > 0 && (
              <span className="font-sans text-[12px] uppercase tracking-[0.2em] text-ink/55">
                · {nights} night{nights === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <p className="mt-4 font-sans text-[13.5px] text-ink/70">
            {q.adults} adult{q.adults === 1 ? "" : "s"}
            {q.children > 0
              ? ` · ${q.children} child${q.children === 1 ? "" : "ren"}`
              : ""}
            <span className="text-ink/40 mx-2">·</span>
            Check-in from 14:00, check-out by 12:00.
          </p>
        </section>

        {/* Guest — letter-style. Name leads, ledger of details below,
            edit affordance smaller and inline. The dl shape sets it apart
            from the photo card above and the dates card. */}
        <section
          aria-label="Lead guest"
          className="rounded-2xl border border-ink/10 bg-white p-5 md:p-7"
        >
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <div className="min-w-0">
              <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/60">
                Lead guest
              </p>
              <h2 className="mt-1.5 font-display text-[20px] md:text-[24px] font-medium text-ink leading-tight tracking-tight">
                {guest.firstName} {guest.lastName}
              </h2>
            </div>
            <Link
              href={bookingHref("guest", q)}
              className="shrink-0 inline-flex items-center gap-1.5 font-sans text-[10.5px] uppercase tracking-[0.18em] text-marine hover:text-marine/80 transition-colors min-h-[44px] px-1"
            >
              <Pencil className="h-3 w-3" strokeWidth={2} />
              Edit details
            </Link>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 font-sans">
            <div className="border-t border-ink/10 pt-3">
              <dt className="text-[10px] uppercase tracking-[0.22em] text-ink/60">
                Email
              </dt>
              <dd className="mt-1.5 text-[14px] text-ink truncate">
                {guest.email}
              </dd>
            </div>
            <div className="border-t border-ink/10 pt-3">
              <dt className="text-[10px] uppercase tracking-[0.22em] text-ink/60">
                Phone
              </dt>
              <dd className="mt-1.5 text-[14px] text-ink truncate">
                {guest.phone}
              </dd>
            </div>
            {guest.arrivalTime && (
              <div className="border-t border-ink/10 pt-3">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-ink/60">
                  Arrival
                </dt>
                <dd className="mt-1.5 text-[14px] text-ink">
                  {guest.arrivalTime}
                </dd>
              </div>
            )}
            {guest.notes && (
              <div className="border-t border-ink/10 pt-3 sm:col-span-2">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-ink/60">
                  Notes for the desk
                </dt>
                <dd className="mt-1.5 text-[14px] text-ink whitespace-pre-line leading-[1.6]">
                  {guest.notes}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Add-ons */}
        <section
          aria-labelledby="addons-title"
          className="rounded-2xl border border-ink/10 bg-white p-5 md:p-7"
        >
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <div>
              <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                Add-ons
              </p>
              <h2
                id="addons-title"
                className="mt-1.5 font-display text-[20px] md:text-[22px] font-medium text-ink leading-tight tracking-tight"
              >
                A few small touches.
              </h2>
            </div>
            {selectedAddOns.length > 0 && (
              <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-marine">
                {selectedAddOns.length} added
              </span>
            )}
          </div>

          <ul className="flex flex-col gap-3">
            {ALL_ADD_ONS.map((a) => {
              const selected = selectedIds.has(a.id);
              const inputId = `addon-${a.id}`;
              return (
                <li key={a.id}>
                  {/* Real <input type="checkbox"> visually hidden but a11y-
                      reachable; the styled <label> carries the chrome. */}
                  <input
                    id={inputId}
                    type="checkbox"
                    className="peer sr-only"
                    checked={selected}
                    onChange={() => toggleAddOn(a.id)}
                  />
                  <label
                    htmlFor={inputId}
                    className={cn(
                      "group/addon w-full flex items-start gap-4 rounded-xl border p-4 md:p-5 text-left cursor-pointer transition-colors",
                      "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marine",
                      selected
                        ? "border-marine bg-marine/[0.04]"
                        : "border-ink/10 bg-white hover:border-ink/25",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                        selected
                          ? "bg-marine border-marine text-white"
                          : "bg-white border-ink/30 text-transparent",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-display text-[15px] md:text-[16px] font-medium text-ink leading-tight">
                          {a.label}
                        </span>
                        <span className="font-display tabular-nums text-[14px] md:text-[15px] text-ink">
                          {formatDA(a.priceDA)}
                          {a.perNight && (
                            <span className="ml-1 font-sans text-[12px] text-ink/60">
                              / night
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="mt-1.5 block font-sans text-[13px] leading-[1.55] text-ink/70">
                        {a.blurb}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center justify-between gap-6 pt-2">
          <Link
            href={bookingHref("guest", q)}
            className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/65 hover:text-ink transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            Back to details
          </Link>
          <button
            type="button"
            onClick={onContinue}
            className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white bg-marine border border-marine rounded-full px-8 py-4 transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
          >
            Continue to payment
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
              strokeWidth={2.25}
            />
          </button>
        </div>
      </div>

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

      {/* Mobile sticky bottom action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors active:bg-marine/90"
        >
          Continue to payment
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

