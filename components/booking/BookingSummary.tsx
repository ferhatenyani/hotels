// Shared booking summary card. Reused by /booking/guest, /booking/review and
// /booking/payment. On desktop it sits in the right column (sticky); on
// mobile it collapses to an expandable summary chip pinned to the top of
// the page ("Total · 25 800 DA · tap to see details").
//
// The component is a Server-Component-friendly shape (no hooks by default).
// We export both:
//  - <BookingSummary> — the full sticky card for the right column.
//  - <BookingSummaryChip> — the collapsible mobile chip that wraps the card.
// Pages compose them: the chip on mobile (above the form), the card on lg+.
//
// All math comes from `computeBreakdown(room, q, addOns)` so the totals on
// every step are coherent.
//
// Layout sizing: the desktop card lives inside a `lg:grid-cols-3` grid; the
// caller decides whether to put it in `lg:col-span-1` or similar.

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDA } from "@/lib/data/hotel";
import type { Room } from "@/lib/data/rooms";
import type { AddOn, BookingQuery } from "@/lib/booking/types";
import { computeBreakdown } from "@/lib/booking/pricing";
import { bookingHref } from "@/lib/booking/params";

type Props = {
  room: Room;
  q: BookingQuery;
  /** Add-ons selected at /booking/review or downstream. */
  selectedAddOns?: AddOn[];
  /** Whether to show the "Edit" links next to each summary line. */
  editable?: boolean;
};

export default function BookingSummary({
  room,
  q,
  selectedAddOns = [],
  editable = true,
}: Props) {
  const breakdown = computeBreakdown(room, q, selectedAddOns);
  const nightsLabel =
    breakdown.nights === 1 ? "1 nuit" : `${breakdown.nights} nuits`;
  const guestsLabel =
    q.children > 0
      ? `${q.adults} adulte${q.adults === 1 ? "" : "s"} · ${q.children} enfant${q.children === 1 ? "" : "s"}`
      : `${q.adults} adulte${q.adults === 1 ? "" : "s"}`;

  return (
    <aside
      aria-label="Récapitulatif de votre réservation"
      className="rounded-2xl border border-ink/10 bg-white shadow-[0_24px_50px_-30px_rgba(21,19,22,0.18)] overflow-hidden"
    >
      {/* Image de couverture */}
      <div className="relative h-[160px] md:h-[180px] bg-ink/5">
        <Image
          src={room.cover}
          alt={room.coverAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 360px"
          className="object-cover"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/0 to-ink/0"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/80">
            Votre séjour
          </p>
          <p className="mt-1 font-display text-[18px] md:text-[20px] font-medium text-white leading-tight tracking-tight">
            {room.name}
          </p>
        </div>
      </div>

      <div className="p-5 md:p-6">
        {/* Dates + voyageurs */}
        <dl className="flex flex-col gap-4 text-[14px] font-sans">
          <SummaryRow
            label="Arrivée"
            value={
              q.checkIn ? format(q.checkIn, "EEE d MMM yyyy") : "Non définie"
            }
            editHref={editable ? bookingHref("search", q) : undefined}
          />
          <SummaryRow
            label="Départ"
            value={
              q.checkOut ? format(q.checkOut, "EEE d MMM yyyy") : "Non défini"
            }
            editHref={editable ? bookingHref("search", q) : undefined}
          />
          <SummaryRow
            label="Durée"
            value={nightsLabel}
          />
          <SummaryRow
            label="Voyageurs"
            value={guestsLabel}
            editHref={editable ? bookingHref("search", q) : undefined}
          />
        </dl>

        <span aria-hidden className="mt-5 mb-5 block h-px bg-ink/10" />

        {/* Détail du prix */}
        <div className="flex flex-col gap-2.5 font-sans text-[13.5px] text-ink/75">
          <PriceLine
            label={`${room.name} · ${nightsLabel}`}
            amount={breakdown.roomSubtotal}
          />
          <PriceLine
            label={`Taxe de séjour · ${breakdown.guests} voyageur${breakdown.guests === 1 ? "" : "s"}`}
            amount={breakdown.tourismTax}
          />
          {breakdown.addOnsTotal > 0 && (
            <PriceLine label="Suppléments" amount={breakdown.addOnsTotal} />
          )}
          {breakdown.discount > 0 && (
            <PriceLine
              label={breakdown.promoLabel ?? "Réduction promo"}
              amount={-breakdown.discount}
              tone="discount"
            />
          )}
        </div>

        <span aria-hidden className="mt-5 mb-4 block h-px bg-ink/10" />

        <div className="flex items-end justify-between gap-3">
          <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            Total
          </span>
          <span className="font-display text-[26px] md:text-[28px] font-semibold text-ink leading-none">
            {formatDA(breakdown.total)}
          </span>
        </div>
        <p className="mt-3 font-sans text-[11.5px] leading-[1.55] text-ink/60">
          Taxe de séjour incluse. Pas de frais d&apos;intermédiaires, pas de
          surprises à la réception.
        </p>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  editHref,
}: {
  label: string;
  value: string;
  editHref?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-[88px] shrink-0 font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55 pt-[2px]">
        {label}
      </dt>
      <dd className="flex-1 min-w-0 flex items-start justify-between gap-3">
        <span className="font-sans text-[14px] text-ink truncate">
          {value}
        </span>
        {editHref && (
          <Link
            href={editHref}
            // Crayon + libellé nécessite 44px de hauteur tactile sur mobile ;
            // px-1 empêche le bouton de se rétrécir quand le parent dl est
            // contraint.
            className="shrink-0 inline-flex items-center gap-1 px-1 min-h-[44px] font-sans text-[11px] uppercase tracking-[0.18em] text-marine hover:text-marine/80 transition-colors"
            aria-label={`Modifier ${label.toLowerCase()}`}
          >
            <Pencil className="h-3 w-3" strokeWidth={1.75} />
            Modifier
          </Link>
        )}
      </dd>
    </div>
  );
}

function PriceLine({
  label,
  amount,
  tone = "default",
}: {
  label: string;
  amount: number;
  tone?: "default" | "discount";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="min-w-0 truncate">{label}</span>
      <span
        className={cn(
          "font-display tabular-nums text-ink shrink-0",
          tone === "discount" && "text-marine",
        )}
      >
        {tone === "discount"
          ? `− ${formatDA(Math.abs(amount))}`
          : formatDA(amount)}
      </span>
    </div>
  );
}

/**
 * Pastille mobile qui condense le récapitulatif en une pilule à dérouler en
 * haut de page. Enveloppe {@link BookingSummary} quand ouverte.
 */
export function BookingSummaryChip({
  room,
  q,
  selectedAddOns = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const breakdown = computeBreakdown(room, q, selectedAddOns);
  const nights =
    q.checkIn && q.checkOut
      ? differenceInCalendarDays(q.checkOut, q.checkIn)
      : 0;

  return (
    <div className="lg:hidden rounded-2xl border border-ink/10 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="booking-summary-chip"
        className="w-full flex items-center justify-between gap-4 px-4 py-3 min-h-[56px] text-left transition-colors active:bg-ink/[0.025]"
      >
        <div className="flex flex-col min-w-0">
          <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55 leading-none">
            Total · {nights} nuit{nights === 1 ? "" : "s"}
          </span>
          <span className="mt-1.5 font-display text-[18px] font-semibold text-ink leading-none">
            {formatDA(breakdown.total)}
          </span>
        </div>
        <span className="shrink-0 flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.18em] text-marine">
          {open ? "Masquer" : "Détails"}
          {open ? (
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </span>
      </button>
      {open && (
        <div id="booking-summary-chip" className="border-t border-ink/10">
          <BookingSummary room={room} q={q} selectedAddOns={selectedAddOns} />
        </div>
      )}
    </div>
  );
}
