"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const navigateLinks = [
  { label: "Exhibit", href: "#exhibit" },
  { label: "Activities", href: "#activities" },
  { label: "Contact", href: "#contact" },
  { label: "Reservations", href: "#top" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".footer-col", {
        autoAlpha: 0,
        y: 18,
        stagger: 0.1,
        duration: 0.7,
        ease: "expo.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="grain relative bg-ink text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 md:pt-[120px] pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="footer-col">
            <p className="font-display font-semibold text-2xl">Maison Dorée</p>
            <p className="font-sans text-[15px] text-white/55 mt-4 max-w-xs">
              A small house on the Riviera, kept for the unhurried.
            </p>
          </div>

          <div className="footer-col md:justify-self-center">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/40 mb-5">
              Navigate
            </p>
            <ul className="flex flex-col gap-3 font-sans text-[15px] text-white/75">
              {navigateLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-cream transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col md:justify-self-end">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/40 mb-5">
              Connect
            </p>
            <ul className="flex flex-col gap-3 font-sans text-[15px] text-white/75">
              <li>
                <a href="#" className="hover:text-cream transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cream transition-colors">
                  Journal
                </a>
              </li>
              <li>
                <a
                  href="mailto:reservations@maisondoree.fr"
                  className="hover:text-cream transition-colors"
                >
                  reservations@maisondoree.fr
                </a>
              </li>
              <li>
                <a href="tel:+33493000000" className="hover:text-cream transition-colors">
                  +33 4 93 00 00 00
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 mt-16 md:mt-24 pt-8">
          <p className="font-sans text-[12px] text-white/35">
            © 2026 Maison Dorée — Saint-Jean-Cap-Ferrat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
