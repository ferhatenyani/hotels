"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const hours = [
  { label: "Petit-déjeuner", value: "06:30 – 10:30 · inclus" },
  { label: "Déjeuner", value: "12:00 – 14:30" },
  { label: "Dîner", value: "19:00 – 22:00" },
];

export default function Dining() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Set initial clipPath on mount
      gsap.set(".dining-image-container", { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" });

      // Clip path reveal
      gsap.to(".dining-image-container", {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 1.4,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: ".dining-image-container",
          start: "top 85%",
          once: true,
        },
      });

      // Parallax scroll on image
      gsap.fromTo(".dining-image-parallax",
        { yPercent: -8, scale: 1.12 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".dining-image-container",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Staggered copy fade-in
      gsap.from(".dining-copy > *", {
        y: 15,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".dining-copy",
          start: "top 85%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="dining"
      className="grain bg-cream px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* On mobile, lead with the heading/copy so the value proposition
              is the first thing in view. Image follows; hours close it out. */}

          {/* Image — order-2 on mobile (between copy and hours), order-1 on desktop. */}
          <div className="dining-image-container overflow-hidden order-2 lg:order-1 relative aspect-[3/2] sm:aspect-[4/3] lg:aspect-[5/4] w-full">
            {/* TODO(demo): vraie photo du restaurant avec la vue. */}
            <Image
              src="/images/exhibit-dining-room.jpg"
              alt="Le restaurant de l'hôtel, ouvert sur la vue"
              width={1200}
              height={1000}
              className="dining-image-parallax absolute inset-0 w-full h-full object-cover will-change-transform"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Copy + (desktop) hours — order-1 on mobile, order-2 on desktop. */}
          <div className="dining-copy lg:pl-4 order-1 lg:order-2">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3 md:mb-4">
              Le restaurant
            </p>
            <h2 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-ink text-balance">
              Une table avec vue
            </h2>
            <span aria-hidden className="mt-5 md:mt-6 block h-px w-14 bg-marine" />
            <p className="mt-5 md:mt-7 font-sans font-normal text-[15px] md:text-[16px] leading-[1.7] md:leading-[1.75] text-graybase max-w-xl">
              Notre restaurant offre tout le confort d'un véritable haut lieu de
              gastronomie — <span className="italic">une carte d&apos;excellence
              ouverte sur le monde</span> — face à un large panorama. Les matins
              commencent par le petit-déjeuner que nos hôtes citent si souvent :
              fruits frais et viennoiseries chaudes. Le déjeuner et le dîner
              suivent face au paysage.
            </p>

            {/* Desktop hours — original ledger layout, untouched. */}
            <dl className="hidden lg:flex mt-9 flex-col gap-4 max-w-md">
              {hours.map((h) => (
                <div
                  key={h.label}
                  className="flex items-baseline justify-between gap-4 border-t border-ink/15 pt-3"
                >
                  <dt className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60">
                    {h.label}
                  </dt>
                  <dd className="font-sans text-[14px] text-ink text-right">
                    {h.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hours as chips — mobile/tablet only. */}
          <div className="dining-copy order-3 lg:hidden">
            <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55 mb-3">
              Horaires de service
            </p>
            <ul className="flex flex-wrap gap-2">
              {hours.map((h) => (
                <li
                  key={h.label}
                  className="inline-flex items-baseline gap-2 rounded-full bg-white/70 px-3.5 py-2.5 border border-ink/10"
                >
                  <span className="font-sans text-[10.5px] uppercase tracking-[0.18em] text-ink/60">
                    {h.label}
                  </span>
                  <span className="font-sans text-[13px] text-ink">
                    {h.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
