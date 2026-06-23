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

  return (
    <div className="mt-8 lg:mt-12 grid lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6 md:gap-8 pb-28 lg:pb-0">
        {/* Room summary */}
        <ReviewCard
          eyebrow="Your room"
          title={room.name}
          editHref={bookingHref("results", q)}
          editLabel="Change room"
        >
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-xl bg-ink/5">
              <Image
                src={room.cover}
                alt={room.coverAlt}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                Sleeps {room.sleeps} · {room.sizeDisplay}
              </p>
              <p className="mt-2 font-sans text-[13.5px] leading-[1.55] text-ink/75 line-clamp-3">
                {room.cardDescription}
              </p>
            </div>
          </div>
        </ReviewCard>

        {/* Dates */}
        <ReviewCard
          eyebrow="Your stay"
          title={
            q.checkIn && q.checkOut
              ? `${format(q.checkIn, "EEE, d MMM")} → ${format(q.checkOut, "EEE, d MMM yyyy")}`
              : "Dates pending"
          }
          editHref={bookingHref("search", q)}
          editLabel="Change dates"
        >
          <p className="font-sans text-[13.5px] text-ink/70">
            {q.adults} adult{q.adults === 1 ? "" : "s"}
            {q.children > 0
              ? ` · ${q.children} child${q.children === 1 ? "" : "ren"}`
              : ""}
            {" · "}
            Check-in from 14:00, check-out by 12:00.
          </p>
        </ReviewCard>

        {/* Guest */}
        <ReviewCard
          eyebrow="Lead guest"
          title={`${guest.firstName} ${guest.lastName}`}
          editHref={bookingHref("guest", q)}
          editLabel="Edit details"
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-[13.5px] text-ink/75">
            <div>
              <dt className="text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                Email
              </dt>
              <dd className="mt-1 text-ink truncate">{guest.email}</dd>
            </div>
            <div>
              <dt className="text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                Phone
              </dt>
              <dd className="mt-1 text-ink truncate">{guest.phone}</dd>
            </div>
            {guest.arrivalTime && (
              <div>
                <dt className="text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  Arrival
                </dt>
                <dd className="mt-1 text-ink">{guest.arrivalTime}</dd>
              </div>
            )}
            {guest.notes && (
              <div className="sm:col-span-2">
                <dt className="text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                  Notes
                </dt>
                <dd className="mt-1 text-ink whitespace-pre-line">
                  {guest.notes}
                </dd>
              </div>
            )}
          </dl>
        </ReviewCard>

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
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    onClick={() => toggleAddOn(a.id)}
                    className={cn(
                      "group/addon w-full flex items-start gap-4 rounded-xl border p-4 md:p-5 text-left transition-colors",
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
                            <span className="ml-1 font-sans text-[12px] text-ink/55">
                              / night
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="mt-1.5 block font-sans text-[13px] leading-[1.55] text-ink/65">
                        {a.blurb}
                      </span>
                    </span>
                  </button>
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

function ReviewCard({
  eyebrow,
  title,
  editHref,
  editLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  editHref?: string;
  editLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 md:p-7">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 font-display text-[18px] md:text-[20px] font-medium text-ink leading-tight tracking-tight">
            {title}
          </h2>
        </div>
        {editHref && (
          <Link
            href={editHref}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 font-sans text-[10.5px] uppercase tracking-[0.18em] text-ink/70 hover:text-ink hover:border-ink/30 transition-colors max-md:min-h-[40px]"
          >
            <Pencil className="h-3 w-3" strokeWidth={2} />
            {editLabel ?? "Edit"}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
