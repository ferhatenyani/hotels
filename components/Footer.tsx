"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import SmartLink from "@/components/site/SmartLink";

// Two columns: the booking-funnel side of the site, then the marketing /
// storytelling pages. Splitting them in the footer makes the IA legible at a
// glance — what to do (book/manage), and what to read (rooms/dining/events).
const bookLinks = [
  { label: "Rooms", href: "/rooms", sectionId: "rooms" },
  { label: "Offers", href: "/offers" },
  { label: "Reserve", href: "/booking/search" },
  { label: "Find my booking", href: "/booking/lookup" },
];

const exploreLinks = [
  { label: "Dining", href: "/dining", sectionId: "dining" },
  { label: "Events & Meetings", href: "/events", sectionId: "events" },
  { label: "Discover Béjaïa", href: "/discover-bejaia" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact", sectionId: "contact" },
];

const utilityLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Policies", href: "/policies" },
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
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 md:pt-20 lg:pt-[120px] pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand block. Spans 4 on desktop so the link columns get room. */}
          <div className="footer-col md:col-span-4">
            <p className="font-display font-semibold text-2xl">Hôtel du Lac</p>
            <p className="font-sans text-[14px] md:text-[15px] text-white/55 mt-3 md:mt-4 max-w-xs">
              Le Calme au Centre Ville — a quiet hotel on the lake, in the
              heart of Béjaïa.
            </p>
            <p className="font-sans text-[13px] text-white/50 mt-5 leading-[1.7]">
              Rue Hassiba Ben Bouali, Aamriou
              <br />
              06000 Béjaïa, Algérie
            </p>
          </div>

          {/* Book column — booking funnel + offers + lookup. */}
          <div className="footer-col md:col-span-3">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4 md:mb-5">
              Book
            </p>
            <ul className="flex flex-col gap-3 font-sans text-[15px] text-white/75">
              {bookLinks.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    sectionId={"sectionId" in link ? link.sectionId : undefined}
                    className="max-md:flex max-md:items-center max-md:min-h-[44px] hover:text-cream transition-colors"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore column — storytelling pages. */}
          <div className="footer-col md:col-span-3">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4 md:mb-5">
              Explore
            </p>
            <ul className="flex flex-col gap-3 font-sans text-[15px] text-white/75">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    sectionId={"sectionId" in link ? link.sectionId : undefined}
                    className="max-md:flex max-md:items-center max-md:min-h-[44px] hover:text-cream transition-colors"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect column — social + direct contact tiles. */}
          <div className="footer-col md:col-span-2">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4 md:mb-5">
              Connect
            </p>
            <ul className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-3 font-sans text-[14px] md:text-[15px] text-white/75">
              <li>
                <a
                  href="https://www.instagram.com/hotel.du.lac/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-md:flex max-md:items-center max-md:justify-center max-md:min-h-[48px] max-md:rounded-md max-md:border max-md:border-white/10 max-md:bg-white/[0.03] hover:text-cream transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/hoteldulacbejaia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-md:flex max-md:items-center max-md:justify-center max-md:min-h-[48px] max-md:rounded-md max-md:border max-md:border-white/10 max-md:bg-white/[0.03] hover:text-cream transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li className="max-md:col-span-2">
                <a
                  href="mailto:contact@hoteldulacvert.dz"
                  className="max-md:flex max-md:items-center max-md:justify-center max-md:min-h-[48px] max-md:rounded-md max-md:border max-md:border-white/10 max-md:bg-white/[0.03] hover:text-cream transition-colors max-md:text-[13px]"
                >
                  contact@hoteldulacvert.dz
                </a>
              </li>
              <li className="max-md:col-span-2">
                <a
                  href="tel:+21344202022"
                  className="max-md:flex max-md:items-center max-md:justify-center max-md:min-h-[48px] max-md:rounded-md max-md:border max-md:border-white/10 max-md:bg-white/[0.03] hover:text-cream transition-colors"
                >
                  +213 44 20 20 22
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 mt-12 md:mt-20 pt-6 md:pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="font-sans text-[12px] text-white/35">
            © 2026 Hôtel du Lac — Béjaïa, Algérie. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[12px] text-white/40">
            {utilityLinks.map((link) => (
              <li key={link.href}>
                <SmartLink
                  href={link.href}
                  className="hover:text-white/70 transition-colors max-md:min-h-[40px] max-md:inline-flex max-md:items-center"
                >
                  {link.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
