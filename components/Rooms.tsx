"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Room = {
  src: string;
  alt: string;
  name: string;
  description: string;
  sleeps: number;
  size: string;
  price: string;
};

// TODO(demo): replace `src` with real Hôtel du Lac room photography. Sizes,
// prices (DA) and types are from the hotel's own listings; the Double's exact
// m² is unpublished, so we show its defining feature (lake view) instead.
const rooms: Room[] = [
  {
    src: "/images/exhibit-corner-suite.jpg",
    alt: "The Suite Senior's living corner, overlooking the lake",
    name: "Suite Senior",
    description:
      "Fifty-two square metres of calm — a living corner, a dressing room, and a wide window over Lac Mézaïa and Gouraya.",
    sleeps: 2,
    size: "52 m²",
    price: "12 500 DA",
  },
  {
    src: "/images/exhibit-guest-room.jpg",
    alt: "A Chambre Double with a view of Lac Mézaïa",
    name: "Chambre Double — Vue Lac",
    description:
      "A bright, modern room with a lounge corner and a walk-in shower, the lake at the window — the everyday comfort guests come back for.",
    sleeps: 2,
    size: "Lake view",
    price: "8 300 DA",
  },
  {
    src: "/images/exhibit-suite-dawn.jpg",
    alt: "The Appartement at dawn, above the water",
    name: "Appartement",
    description:
      "Our largest space — one hundred and two square metres, with a full bathtub and room for the whole family, above the water.",
    sleeps: 4,
    size: "102 m²",
    price: "15 500 DA",
  },
];

export default function Rooms() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const headTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".rooms-head",
          start: "top 95%",
          once: true,
        },
      });
      headTl
        .from(".rooms-eyebrow", {
          autoAlpha: 0,
          y: 8,
          duration: 0.4,
          ease: "expo.out",
        })
        .from(
          ".rooms-heading",
          {
            autoAlpha: 0,
            y: 14,
            duration: 0.55,
            ease: "expo.out",
          },
          "-=0.28",
        )
        .from(
          ".rooms-rule",
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.55,
            ease: "expo.out",
          },
          "-=0.35",
        );

      gsap.from(".room-card", {
        autoAlpha: 0,
        y: 22,
        stagger: 0.07,
        duration: 0.65,
        ease: "expo.out",
        clearProps: "all",
        scrollTrigger: {
          // Trigger on the section header so the cards animate the moment the
          // section enters the viewport, not when the cards' row is reached.
          trigger: ".rooms-head",
          start: "top 95%",
          once: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".room-image-parallax").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -6, scale: 1.08 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Track which card is centered in the mobile scroll track.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (cards.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersection ratio.
        let bestIdx = activeIndex;
        let bestRatio = 0;
        for (const entry of entries) {
          const idx = Number(
            (entry.target as HTMLElement).dataset.cardIndex ?? -1,
          );
          if (idx < 0) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = idx;
          }
        }
        if (bestRatio > 0.5) setActiveIndex(bestIdx);
      },
      { root: track, threshold: [0.4, 0.6, 0.8] },
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToIndex = (i: number) => {
    const card = cardRefs.current[i];
    const track = trackRef.current;
    if (!card || !track) return;
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    // Match the scroll-padding-left used by the snap (24px on base, 32px on sm+)
    // so taps on the dot indicator land the card at the same offset the snap
    // would.
    const padPx = window.matchMedia("(min-width: 640px)").matches ? 32 : 24;
    const delta = cardRect.left - trackRect.left - padPx;
    track.scrollTo({
      left: track.scrollLeft + delta,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="rooms"
      className="bg-white px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="rooms-head mb-8 md:mb-14 lg:mb-20 max-w-2xl">
          <p className="rooms-eyebrow font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3 md:mb-4">
            Rooms &amp; Suites
          </p>
          <h2 className="rooms-heading font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-5xl tracking-tight text-ink text-balance leading-[1.08]">
            Where to rest, above the lake
          </h2>
          <span
            aria-hidden
            className="rooms-rule mt-5 md:mt-6 block h-px w-14 bg-marine"
          />
        </div>

        <div
          ref={trackRef}
          className={cn(
            // Mobile: horizontal scroll track. Asymmetric padding (24px left,
            // 16px right) gives the first card breathing room while preserving
            // a peek of the next card on the right. scroll-pl matches so snap
            // points land at the padded position, not the track edge.
            "rooms-grid flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 pl-6 pr-4 pb-3 scroll-pl-6 scroll-smooth",
            "sm:-mx-6 sm:pl-8 sm:pr-6 sm:scroll-pl-8",
            // Tablet+: revert to grid.
            "md:mx-0 md:p-0 md:overflow-visible md:snap-none md:scroll-pl-0",
            "md:grid md:grid-cols-3 md:gap-8 lg:gap-12",
            // Hide scrollbar on mobile.
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          )}
        >
          {rooms.map((room, i) => (
            <article
              key={room.name}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              data-card-index={i}
              className={cn(
                "room-card group/card flex flex-col bg-white border border-ink/10 overflow-hidden",
                // Mobile carousel sizing
                "shrink-0 w-[80vw] max-w-[360px] snap-start",
                // Tablet+: revert
                "md:shrink md:w-auto md:max-w-none md:snap-align-none",
                // Hover lift only on hover-capable devices
                "transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)] hover:border-ink/15 focus-within:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)]",
              )}
            >
              <div className="overflow-hidden relative h-[200px] sm:h-[240px] md:h-[220px] lg:h-[240px]">
                <Image
                  src={room.src}
                  alt={room.alt}
                  width={1200}
                  height={900}
                  className="room-image-parallax absolute inset-0 w-full h-full object-cover will-change-transform"
                  sizes="(max-width: 768px) 80vw, 33vw"
                />
                {/* Price chip on mobile only — surfaces price without scrolling */}
                <span className="md:hidden absolute top-3 left-3 inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 font-display text-[13px] font-semibold text-ink leading-none shadow-sm">
                  from {room.price}
                </span>
              </div>
              <div className="flex flex-col flex-1 bg-white p-5 md:p-7 lg:p-8">
                <h3 className="font-display font-semibold text-[20px] md:text-[24px] leading-tight tracking-tight text-ink">
                  {room.name}
                </h3>
                <p className="font-sans text-[10.5px] md:text-[11px] uppercase tracking-[0.22em] text-ink/55 mt-2.5 md:mt-3 inline-flex items-center gap-2">
                  <span>Sleeps {room.sleeps}</span>
                  <span
                    aria-hidden
                    className="h-[3px] w-[3px] rounded-full bg-ink/35"
                  />
                  <span>{room.size}</span>
                </p>
                <p className="font-sans font-normal text-[14px] md:text-[15px] leading-[1.65] md:leading-[1.7] text-graybase mt-3 md:mt-4">
                  {room.description}
                </p>
                <div className="mt-auto pt-5 md:pt-6 border-t border-ink/10 flex flex-wrap items-end justify-between gap-3 md:gap-4">
                  <div className="hidden md:block">
                    <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55">
                      From
                    </p>
                    <p className="font-display font-semibold text-[26px] text-ink mt-1.5 leading-none">
                      {room.price}
                      <span className="font-sans text-[12px] font-normal text-graybase ml-1">
                        / night
                      </span>
                    </p>
                  </div>
                  {/* Mobile: inline "per night" reminder */}
                  <p className="md:hidden font-sans text-[11px] uppercase tracking-[0.18em] text-ink/55">
                    Per night
                  </p>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink border border-ink/25 rounded-full px-5 py-2.5 max-md:min-h-[44px] max-md:px-6 transition-colors duration-300 ease-out hover:bg-marine hover:border-marine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
                  >
                    Reserve
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile-only dot indicator + swipe hint */}
        <div className="md:hidden mt-5 flex items-center justify-between">
          <span className="font-sans text-[10.5px] uppercase tracking-[0.18em] text-ink/45">
            Swipe to compare
          </span>
          <div className="flex items-center gap-2" role="tablist" aria-label="Rooms">
            {rooms.map((room, i) => (
              <button
                key={room.name}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Show ${room.name}`}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 ease-out",
                  i === activeIndex
                    ? "w-6 bg-marine"
                    : "w-2 bg-ink/20 hover:bg-ink/35",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
