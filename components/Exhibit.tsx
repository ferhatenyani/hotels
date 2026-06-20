"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useLenis } from "./SmoothScroll";

type Tile = {
  src: string;
  alt: string;
  w: number;
  h: number;
  /**
   * Tailwind classes for size + optional `row-span-2`. Tiles without span
   * take a single row (230px tall); tiles with `row-span-2` fill both rows
   * of the grid column (230 + gap-6 + 230 = 484px tall).
   */
  classes: string;
};

// Single bento grid laid out column-by-column via `grid-flow-col` +
// `grid-rows-2`. Pattern is T S S T S where T = tall (one tile spanning
// both rows) and S = stacked pair (two tiles, one per row). Column widths
// vary deliberately so no two adjacent columns share a rhythm.
const tiles: Tile[] = [
  // Col 1 — tall portrait
  {
    src: "/images/exhibit-suite-dawn.jpg",
    alt: "Hotel suite at dawn",
    w: 300,
    h: 484,
    classes: "w-[300px] h-[484px] row-span-2",
  },
  // Col 2 — wide landscape stack
  {
    src: "/images/exhibit-terrace-pool.jpg",
    alt: "The terrace pool",
    w: 440,
    h: 230,
    classes: "w-[440px] h-[230px]",
  },
  {
    src: "/images/exhibit-spa.jpg",
    alt: "The spa",
    w: 440,
    h: 230,
    classes: "w-[440px] h-[230px]",
  },
  // Col 3 — tighter landscape stack
  {
    src: "/images/exhibit-salon.jpg",
    alt: "The salon",
    w: 320,
    h: 230,
    classes: "w-[320px] h-[230px]",
  },
  {
    src: "/images/exhibit-guest-room.jpg",
    alt: "A guest room",
    w: 320,
    h: 230,
    classes: "w-[320px] h-[230px]",
  },
  // Col 4 — tall portrait
  {
    src: "/images/exhibit-dining-room.jpg",
    alt: "The dining room",
    w: 280,
    h: 484,
    classes: "w-[280px] h-[484px] row-span-2",
  },
  // Col 5 — landscape stack
  {
    src: "/images/exhibit-saltwater-pool.jpg",
    alt: "The saltwater pool",
    w: 400,
    h: 230,
    classes: "w-[400px] h-[230px]",
  },
  {
    src: "/images/exhibit-corner-suite.jpg",
    alt: "The corner suite",
    w: 400,
    h: 230,
    classes: "w-[400px] h-[230px]",
  },
];

export default function Exhibit() {
  // Duplicated once so the marquee can loop seamlessly via translateX(-50%).
  const grid = [...tiles, ...tiles];

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const hoveredRef = useRef(false);
  const lenis = useLenis();

  // Heading reveal + marquee tween.
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (!prefersReduced) {
        gsap.from(".exhibit-eyebrow", {
          autoAlpha: 0,
          y: 10,
          duration: 0.55,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".exhibit-head",
            start: "top 82%",
            once: true,
          },
        });
        gsap.from(".exhibit-heading", {
          autoAlpha: 0,
          y: 18,
          duration: 0.75,
          ease: "expo.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: ".exhibit-head",
            start: "top 82%",
            once: true,
          },
        });
      }

      if (trackRef.current) {
        // -50% lands on the start of the duplicated half — seamless loop.
        tweenRef.current = gsap.to(trackRef.current, {
          xPercent: -50,
          duration: 80,
          ease: "none",
          repeat: -1,
        });
        if (prefersReduced) tweenRef.current.pause();
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      tweenRef.current = null;
    };
  }, []);

  // Couple marquee speed to Lenis scroll velocity. Idle = 1×, scrolling fast
  // = up to ~2.6×. Returns to 1 with a soft decay when scrolling stops.
  useEffect(() => {
    if (!lenis || !tweenRef.current) return;
    let target = 1;
    let current = 1;
    let raf = 0;

    const onScroll = (e: { velocity?: number }) => {
      const v = Math.min(Math.abs(e?.velocity ?? 0), 80);
      target = 1 + v / 50; // 1 → ~2.6
    };
    lenis.on("scroll", onScroll);

    const tick = () => {
      current += (target - current) * 0.08;
      target += (1 - target) * 0.02;
      if (!hoveredRef.current) tweenRef.current?.timeScale(current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  const onEnter = () => {
    hoveredRef.current = true;
    tweenRef.current?.pause();
  };
  const onLeave = () => {
    hoveredRef.current = false;
    tweenRef.current?.play();
  };

  return (
    <section
      ref={sectionRef}
      id="exhibit"
      className="relative overflow-x-clip bg-white py-20 md:py-[120px]"
    >
      <div className="exhibit-head max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pb-10 md:pb-14">
        <p className="exhibit-eyebrow font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
          A look around
        </p>
        <h2 className="exhibit-heading font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink max-w-2xl">
          Spaces and quiet corners
        </h2>
      </div>

      <div className="marquee-mask">
        <div
          ref={trackRef}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="grid grid-flow-col grid-rows-2 auto-cols-max gap-6 px-4 sm:px-6 w-max will-change-transform"
        >
          {grid.map((tile, i) => (
            <div
              key={`${tile.src}-${i}`}
              className={`overflow-hidden ${tile.classes}`}
              aria-hidden={i >= tiles.length ? true : undefined}
            >
              <Image
                src={tile.src}
                alt={tile.alt}
                width={tile.w}
                height={tile.h}
                className="w-full h-full object-cover"
                sizes="(max-width: 640px) 70vw, 30vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
