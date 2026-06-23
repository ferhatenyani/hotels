// Photo gallery for /rooms/[slug]. Mobile-first:
//  - 1 image  → just shows it as a single card
//  - 2 images → stacked column on mobile; 2-col grid on tablet+
//  - 3+ images → on mobile becomes a swipeable horizontal strip with snap +
//    dot indicator (mirrors the canonical Rooms.tsx carousel). On tablet+
//    it becomes a 2-col masonry-ish grid (first image spans both cols).
//
// Kept as a Client Component because of the IntersectionObserver dot tracker.

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type GalleryItem = { src: string; alt: string };

type Props = {
  items: GalleryItem[];
  /** Used so the dot button labels and IDs stay descriptive on multiple pages. */
  roomName: string;
};

export default function RoomGallery({ items, roomName }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);

  const isMany = items.length > 2;

  // Track which slide is centered on the mobile strip.
  useEffect(() => {
    if (!isMany) return;
    const track = trackRef.current;
    if (!track) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (cards.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        let bestIdx = active;
        let bestRatio = 0;
        for (const entry of entries) {
          const idx = Number(
            (entry.target as HTMLElement).dataset.slideIndex ?? -1,
          );
          if (idx < 0) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = idx;
          }
        }
        if (bestRatio > 0.5) setActive(bestIdx);
      },
      { root: track, threshold: [0.4, 0.6, 0.8] },
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMany]);

  const scrollToIndex = (i: number) => {
    const card = cardRefs.current[i];
    const track = trackRef.current;
    if (!card || !track) return;
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const padPx = 16;
    const delta = cardRect.left - trackRect.left - padPx;
    track.scrollTo({
      left: track.scrollLeft + delta,
      behavior: "smooth",
    });
  };

  // Simple single-image fallback.
  if (items.length === 1) {
    const it = items[0];
    return (
      <figure className="relative overflow-hidden rounded-2xl bg-ink/5 aspect-[4/3] md:aspect-[16/10]">
        <Image
          src={it.src}
          alt={it.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </figure>
    );
  }

  return (
    <div>
      {/* MOBILE: 3+ images become a horizontal swipe track. 2 images simply
          stack as a single column. */}
      <div
        ref={trackRef}
        className={cn(
          isMany
            ? // Snap-x carousel for >=3 images
              "md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 pl-4 pr-4 pb-2 scroll-pl-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            : // 2 images on mobile: stacked column
              "md:hidden flex flex-col gap-3",
        )}
      >
        {items.map((it, i) => (
          <figure
            key={`${it.src}-${i}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            data-slide-index={i}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-ink/5",
              isMany
                ? "shrink-0 w-[88vw] max-w-[440px] snap-start aspect-[4/3]"
                : "aspect-[4/3] w-full",
            )}
          >
            <Image
              src={it.src}
              alt={it.alt}
              fill
              priority={i === 0}
              sizes={
                isMany
                  ? "88vw"
                  : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              className="object-cover"
            />
          </figure>
        ))}
      </div>

      {/* MOBILE swipe-strip indicator — only when 3+ images. */}
      {isMany && (
        <div className="md:hidden mt-3 flex items-center justify-between">
          <span className="font-sans text-[10.5px] uppercase tracking-[0.18em] text-ink/45">
            {active + 1} / {items.length}
          </span>
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label={`${roomName} gallery`}
          >
            {items.map((it, i) => (
              <button
                key={`${it.src}-dot-${i}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show photo ${i + 1} of ${roomName}`}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 ease-out",
                  i === active
                    ? "w-6 bg-marine"
                    : "w-2 bg-ink/20 hover:bg-ink/35",
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* TABLET+ : 2-col grid. First image spans full width when there are 3+. */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4 lg:gap-5">
        {items.map((it, i) => {
          const spanFull = items.length >= 3 && i === 0;
          return (
            <figure
              key={`grid-${it.src}-${i}`}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-ink/5",
                spanFull
                  ? "md:col-span-2 aspect-[16/9]"
                  : "aspect-[4/3]",
              )}
            >
              <Image
                src={it.src}
                alt={it.alt}
                fill
                priority={i === 0}
                sizes={
                  spanFull
                    ? "(max-width: 1024px) 100vw, 66vw"
                    : "(max-width: 1024px) 50vw, 33vw"
                }
                className="object-cover"
              />
            </figure>
          );
        })}
      </div>
    </div>
  );
}
