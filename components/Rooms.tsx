"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
        scrollTrigger: {
          trigger: ".rooms-grid",
          start: "top 92%",
          once: true,
        },
        onComplete: () => {
          // Initialize room image parallax after intro completes so transforms don't conflict
          gsap.utils.toArray<HTMLElement>(".room-image-parallax").forEach((img) => {
            gsap.fromTo(img, 
              { yPercent: -6, scale: 1.08 },
              {
                yPercent: 6,
                ease: "none",
                scrollTrigger: {
                  trigger: img.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                }
              }
            );
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="rooms"
      className="bg-white px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="rooms-head mb-14 md:mb-20 max-w-2xl">
          <p className="rooms-eyebrow font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
            Rooms &amp; Suites
          </p>
          <h2 className="rooms-heading font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink text-balance">
            Where to rest, above the lake
          </h2>
          <span
            aria-hidden
            className="rooms-rule mt-6 block h-px w-14 bg-marine"
          />
        </div>

        <div className="rooms-grid grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-14">
          {rooms.map((room) => (
            <article
              key={room.name}
              className="room-card group/card flex flex-col bg-white border border-ink/10 overflow-hidden transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)] hover:border-ink/15 focus-within:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)]"
            >
              <div className="overflow-hidden relative h-[240px] sm:h-[260px] md:h-[220px] lg:h-[240px]">
                <Image
                  src={room.src}
                  alt={room.alt}
                  width={1200}
                  height={900}
                  className="room-image-parallax absolute inset-0 w-full h-full object-cover will-change-transform"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-col flex-1 bg-white p-7 md:p-8">
                <h3 className="font-display font-semibold text-[22px] md:text-[24px] leading-tight tracking-tight text-ink">
                  {room.name}
                </h3>
                <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink/55 mt-3 inline-flex items-center gap-2">
                  <span>Sleeps {room.sleeps}</span>
                  <span
                    aria-hidden
                    className="h-[3px] w-[3px] rounded-full bg-ink/35"
                  />
                  <span>{room.size}</span>
                </p>
                <p className="font-sans font-normal text-[15px] leading-[1.7] text-graybase mt-4">
                  {room.description}
                </p>
                <div className="mt-auto pt-6 border-t border-ink/10 flex flex-wrap items-end justify-between gap-4">
                  <div>
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
      </div>
    </section>
  );
}
