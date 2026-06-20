"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";

type Room = {
  src: string;
  alt: string;
  name: string;
  description: string;
  sleeps: number;
  size: string;
  price: string;
};

const rooms: Room[] = [
  {
    src: "/images/exhibit-suite-dawn.jpg",
    alt: "The Riviera Suite at dawn",
    name: "The Riviera Suite",
    description:
      "Eastern light, the sea on the horizon, a small private terrace for early coffee.",
    sleeps: 2,
    size: "48m²",
    price: "€820",
  },
  {
    src: "/images/exhibit-guest-room.jpg",
    alt: "The Garden Room interior",
    name: "The Garden Room",
    description:
      "Quiet, low-slung, with shutters that open straight onto the citrus garden.",
    sleeps: 2,
    size: "28m²",
    price: "€380",
  },
  {
    src: "/images/exhibit-corner-suite.jpg",
    alt: "The Corner Suite interior",
    name: "The Corner Suite",
    description:
      "Two aspects of the coastline and a long reading bench beneath the window.",
    sleeps: 3,
    size: "56m²",
    price: "€1,040",
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
        clearProps: "all",
        scrollTrigger: {
          trigger: ".rooms-grid",
          start: "top 92%",
          once: true,
        },
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
            Rooms
          </p>
          <h2 className="rooms-heading font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink text-balance">
            Where to stay the night
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
              <div className="overflow-hidden">
                <Image
                  src={room.src}
                  alt={room.alt}
                  width={1200}
                  height={900}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
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
