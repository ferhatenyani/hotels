"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const hours = [
  { label: "Breakfast", value: "06:30 – 10:30 · included" },
  { label: "Lunch", value: "12:00 – 14:30" },
  { label: "Dinner", value: "19:00 – 22:00" },
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
      className="grain bg-cream px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <div className="dining-image-container overflow-hidden order-1 lg:order-none relative aspect-[5/4] w-full">
            {/* TODO(demo): real photo of the restaurant with the Lac Mézaïa view. */}
            <Image
              src="/images/exhibit-dining-room.jpg"
              alt="The restaurant at Hôtel du Lac, overlooking Lac Mézaïa"
              width={1200}
              height={1000}
              className="dining-image-parallax absolute inset-0 w-full h-full object-cover will-change-transform"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Copy */}
          <div className="dining-copy lg:pl-4">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
              The restaurant
            </p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink text-balance">
              A table with a view of the water
            </h2>
            <span aria-hidden className="mt-6 block h-px w-14 bg-marine" />
            <p className="mt-7 font-sans font-normal text-[16px] leading-[1.75] text-graybase max-w-xl">
              Our restaurant carries all the comfort of a true house of
              gastronomy — <span className="italic">une carte d&apos;excellence
              ouverte sur le monde</span> — set against a wide, panoramic view of
              Lac Mézaïa. Mornings begin with the breakfast guests so often
              single out: fresh fruit and warm pastries. Lunch and dinner follow
              against the lake and the mountain.
            </p>

            <dl className="mt-9 flex flex-col gap-4 max-w-md">
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
        </div>
      </div>
    </section>
  );
}
