// The room card pattern is hoisted out of Rooms.tsx so /rooms/, /booking/results,
// related-room rails, and offers can all share one visual + behavioural unit.
// Variants:
//  - "default": the full pattern used on the home and /rooms grid
//  - "compact": for related-rooms rails and inside /booking/results

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDA } from "@/lib/data/hotel";
import type { Room } from "@/lib/data/rooms";

type Props = {
  room: Room;
  variant?: "default" | "compact";
  /** Override the primary CTA href (e.g. funnel-aware "Book"). */
  primaryHref?: string;
  /** Override the primary CTA label. */
  primaryLabel?: string;
  /** Secondary CTA (e.g. "View room"). Set to false to hide. */
  secondaryHref?: string | false;
  secondaryLabel?: string;
  /** When the listing knows the quote for the selected stay, show it. */
  quote?: { nights: number; total: number };
};

export default function RoomCard({
  room,
  variant = "default",
  primaryHref,
  primaryLabel = "Reserve",
  secondaryHref,
  secondaryLabel = "View room",
  quote,
}: Props) {
  const detailHref = `/rooms/${room.slug}`;
  const bookHref = primaryHref ?? `/booking/search?room=${room.slug}`;
  const secondHref = secondaryHref === false ? null : (secondaryHref ?? detailHref);

  return (
    <article
      className={cn(
        "room-card group/card flex flex-col bg-white border border-ink/10 overflow-hidden",
        "transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)] hover:border-ink/15 focus-within:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)]",
      )}
    >
      <Link
        href={detailHref}
        className="block overflow-hidden relative h-[200px] sm:h-[240px] md:h-[220px] lg:h-[240px]"
        aria-label={`See ${room.name} details`}
      >
        <Image
          src={room.cover}
          alt={room.coverAlt}
          width={1200}
          height={900}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
          sizes={
            variant === "compact"
              ? "(max-width: 768px) 80vw, 33vw"
              : "(max-width: 768px) 80vw, 33vw"
          }
        />
        {/* Price chip on mobile only — quick scan, no scroll. */}
        <span className="md:hidden absolute top-3 left-3 inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 font-display text-[13px] font-semibold text-ink leading-none shadow-sm">
          from {formatDA(room.priceDA)}
        </span>
      </Link>

      <div
        className={cn(
          "flex flex-col flex-1 bg-white",
          variant === "compact" ? "p-5 md:p-6" : "p-5 md:p-7 lg:p-8",
        )}
      >
        <h3
          className={cn(
            "font-display font-semibold leading-tight tracking-tight text-ink",
            variant === "compact"
              ? "text-[18px] md:text-[20px]"
              : "text-[20px] md:text-[24px]",
          )}
        >
          <Link href={detailHref} className="hover:text-marine transition-colors">
            {room.name}
          </Link>
        </h3>
        <p className="font-sans text-[10.5px] md:text-[11px] uppercase tracking-[0.22em] text-ink/55 mt-2.5 md:mt-3 inline-flex items-center gap-2 flex-wrap">
          <span>Sleeps {room.sleeps}</span>
          <span aria-hidden className="h-[3px] w-[3px] rounded-full bg-ink/35" />
          <span>{room.sizeDisplay}</span>
        </p>
        <p
          className={cn(
            "font-sans font-normal text-graybase mt-3 md:mt-4",
            variant === "compact"
              ? "text-[13.5px] md:text-[14px] leading-[1.6] line-clamp-3"
              : "text-[14px] md:text-[15px] leading-[1.65] md:leading-[1.7]",
          )}
        >
          {room.cardDescription}
        </p>

        <div className="mt-auto pt-5 md:pt-6 border-t border-ink/10 flex flex-wrap items-end justify-between gap-3 md:gap-4">
          <div className="hidden md:block">
            <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55">
              {quote ? `${quote.nights} night${quote.nights > 1 ? "s" : ""}` : "From"}
            </p>
            <p className="font-display font-semibold text-[24px] md:text-[26px] text-ink mt-1.5 leading-none">
              {quote ? formatDA(quote.total) : formatDA(room.priceDA)}
              {!quote && (
                <span className="font-sans text-[12px] font-normal text-graybase ml-1">
                  / night
                </span>
              )}
            </p>
          </div>
          <p className="md:hidden font-sans text-[11px] uppercase tracking-[0.18em] text-ink/55">
            {quote ? `Total · ${quote.nights} night${quote.nights > 1 ? "s" : ""}` : "Per night"}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            {secondHref && (
              <Link
                href={secondHref}
                className="inline-flex items-center justify-center font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70 px-4 py-2.5 max-md:min-h-[44px] transition-colors hover:text-ink"
              >
                {secondaryLabel}
              </Link>
            )}
            <Link
              href={bookHref}
              className="inline-flex items-center justify-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink border border-ink/25 rounded-full px-5 py-2.5 max-md:min-h-[44px] max-md:px-6 transition-colors duration-300 ease-out hover:bg-marine hover:border-marine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
            >
              {primaryLabel}
              <ArrowRight className="h-3 w-3" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
