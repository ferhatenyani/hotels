"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const facts = [
  { value: "498 m²", target: 498, suffix: " m²", label: "Salle de réception" },
  { value: "170", target: 170, suffix: "", label: "Invités assis" },
  { value: "÷ 2", target: null, suffix: "", label: "Salles divisibles" },
  { value: "Équipées", target: null, suffix: "", label: "Salles de réunion" },
];

export default function Events() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Set initial clipPath on mount
      gsap.set(".events-image-container", { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" });

      // Clip path reveal
      gsap.to(".events-image-container", {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 1.4,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: ".events-image-container",
          start: "top 85%",
          once: true,
        },
      });

      // Parallax scroll on image
      gsap.fromTo(".events-image-parallax",
        { yPercent: -8, scale: 1.12 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".events-image-container",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Staggered copy fade-in
      gsap.from(".events-copy > *", {
        y: 15,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".events-copy",
          start: "top 85%",
          once: true,
        },
      });

      // Count up stats
      gsap.utils.toArray<HTMLElement>(".event-stat-number").forEach((el) => {
        const targetAttr = el.getAttribute("data-target");
        if (!targetAttr) return;
        const target = parseFloat(targetAttr);
        const suffix = el.getAttribute("data-suffix") || "";
        if (isNaN(target)) return;

        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            once: true,
          },
          onUpdate: () => {
            el.innerText = Math.floor(obj.val) + suffix;
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="events"
      className="grain bg-ink text-white px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Image — first on mobile to mirror Dining's rhythm; second on desktop. */}
          <div className="events-image-container overflow-hidden relative aspect-[3/2] sm:aspect-[4/3] lg:aspect-[5/4] w-full order-1 lg:order-2">
            {/* TODO(demo): vraie photo de la salle de 498 m² habillée pour un mariage. */}
            <Image
              src="/images/exhibit-salon.jpg"
              alt="La salle de réception de 498 m² de l'hôtel, habillée pour un événement"
              width={1200}
              height={1000}
              className="events-image-parallax absolute inset-0 w-full h-full object-cover will-change-transform"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Copy */}
          <div className="events-copy order-2 lg:order-1">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/45 mb-3 md:mb-4">
              Célébrations &amp; conférences
            </p>
            <h2 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-white text-balance">
              Une salle de 498 m² pour les grands jours
            </h2>
            <span aria-hidden className="mt-5 md:mt-6 block h-px w-14 bg-marine" />
            <p className="mt-5 md:mt-7 font-sans font-normal text-[15px] md:text-[16px] leading-[1.7] md:leading-[1.75] text-white/70 max-w-xl">
              Des mariages et fiançailles aux séminaires et conférences, notre
              hôtel est l'un des lieux de rassemblement reconnus de la ville.
              Notre salle de réception accueille jusqu'à 170 invités et se divise
              en deux pour les occasions plus intimes ; nos salles de réunion
              modulables sont équipées d'un vidéoprojecteur, d'un microphone, du
              Wi-Fi et d'un service pause-café — chaque événement bénéficie d'une
              restauration sur mesure, du café du matin au dîner complet.
            </p>

            {/* CTA hoisted above stats on mobile so it appears earlier in the
                scroll. On desktop, restored below stats via lg:order-2. */}
            <a
              href="#contact"
              className="group/cta mt-7 inline-flex lg:hidden items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-ink bg-cream rounded-full px-7 py-3.5 min-h-[48px] transition-colors duration-300 ease-out hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
            >
              Organiser votre événement
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </a>

            <dl className="mt-7 md:mt-9 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 md:gap-y-6 max-w-xl">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt
                    className="event-stat-number font-display font-semibold text-[22px] md:text-[24px] leading-none tracking-tight text-white"
                    data-target={f.target !== null ? f.target : undefined}
                    data-suffix={f.suffix}
                  >
                    {f.value}
                  </dt>
                  <dd className="mt-2 font-sans text-[10px] uppercase tracking-[0.16em] text-white/45">
                    {f.label}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Desktop CTA — original position preserved. */}
            <a
              href="#contact"
              className="group/cta mt-10 hidden lg:inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-ink bg-cream rounded-full px-8 py-4 transition-colors duration-300 ease-out hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
            >
              Organiser votre événement
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
