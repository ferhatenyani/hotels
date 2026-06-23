"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  { value: "4.3", target: 4.3, suffix: "", label: "Guest rating", stars: true },
  { value: "124", target: 124, suffix: "", label: "Rooms & suites" },
  { value: "498 m²", target: 498, suffix: " m²", label: "Events hall" },
  { value: "Lac Mézaïa", target: null, suffix: "", label: "On the lakefront" },
];

// 86% fill ≈ 4.3 / 5 — a clipped green layer over muted base stars.
function Stars() {
  return (
    <span
      className="relative inline-flex text-[13px] leading-none tracking-[0.1em] select-none"
      aria-hidden
    >
      <span className="text-ink/15">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden text-marine"
        style={{ width: "86%" }}
      >
        ★★★★★
      </span>
    </span>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Staggered entry animation for items
      gsap.from(".stat-item", {
        y: 12,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".stats-list",
          start: "top 100%",
          once: true,
        },
      });

      // Staged count-up animation for numbers
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
        const targetAttr = el.getAttribute("data-target");
        if (!targetAttr) return;
        const target = parseFloat(targetAttr);
        const suffix = el.getAttribute("data-suffix") || "";
        if (isNaN(target)) return;

        const isDecimal = target % 1 !== 0;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 100%",
            once: true,
          },
          onUpdate: () => {
            el.innerText = isDecimal
              ? obj.val.toFixed(1) + suffix
              : Math.floor(obj.val) + suffix;
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="bg-white px-4 sm:px-6 lg:px-10 py-6 md:py-12"
    >
      <div className="max-w-[1100px] mx-auto border-y border-ink/10">
        {/* Mobile: 2x2 grid with hairline dividers between cells. */}
        {/* Tablet+: original single row with vertical separators. */}
        <ul className="stats-list grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-0 sm:gap-x-12 sm:gap-y-7 py-7 sm:py-9 md:py-11">
          {stats.map((s, i) => (
            <Fragment key={s.label}>
              {i > 0 && (
                <li
                  aria-hidden
                  className="hidden sm:block h-9 w-px bg-marine/20"
                />
              )}
              <li
                className={`stat-item text-center py-3 sm:py-0 px-2 sm:px-0 ${
                  // Hairline dividers for the 2x2 mobile grid.
                  i % 2 === 1 ? "sm:border-0 border-l border-ink/10" : ""
                } ${i >= 2 ? "sm:border-0 border-t border-ink/10" : ""}`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  <span
                    className="stat-number font-display font-medium text-[24px] sm:text-[30px] md:text-[34px] leading-none tracking-tight text-ink"
                    data-target={s.target !== null ? s.target : undefined}
                    data-suffix={s.suffix}
                  >
                    {s.value}
                  </span>
                  {s.stars ? <Stars /> : null}
                </div>
                <p className="mt-2 sm:mt-2.5 font-sans text-[10.5px] sm:text-[11px] uppercase tracking-[0.18em] text-ink/55">
                  {s.label}
                </p>
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}
