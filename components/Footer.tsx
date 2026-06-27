"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";

import SmartLink from "@/components/site/SmartLink";
import { hotel } from "@/lib/data/hotel";

function InstagramGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
function FacebookGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const utilityLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Conditions", href: "/policies" },
];

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${hotel.name} ${hotel.address.street} ${hotel.address.city}`,
)}`;

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".footer-fade", {
        autoAlpha: 0,
        y: 14,
        stagger: 0.06,
        duration: 0.6,
        ease: "expo.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 88%",
          once: true,
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const telHref = `tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`;
  const mailHref = `mailto:${hotel.contact.email}`;

  return (
    <footer ref={footerRef} className="grain relative bg-ink text-white">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-10 pt-10 md:pt-14 pb-7 md:pb-8">
        {/* SOCIAL — focal point, top-anchored. Mobile: centered row;
            desktop: same row, slightly larger tap tiles. */}
        <div className="footer-fade flex flex-col items-center gap-3 pb-8 md:pb-10 border-b border-white/10">
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-white/40">
            Nous suivre
          </p>
          <ul className="flex items-center gap-3">
            <li>
              <a
                href={hotel.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${hotel.name} sur Instagram`}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/85 transition-colors hover:border-marine/70 hover:bg-marine/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                <InstagramGlyph className="h-[19px] w-[19px]" />
              </a>
            </li>
            <li>
              <a
                href={hotel.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${hotel.name} sur Facebook`}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/85 transition-colors hover:border-marine/70 hover:bg-marine/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                <FacebookGlyph className="h-[19px] w-[19px]" />
              </a>
            </li>
          </ul>
        </div>

        {/* BRAND + RESERVATIONS — two-row on mobile (brand → tiles),
            two-column on desktop. */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-x-10 md:gap-y-10 pt-9 md:pt-12">
          <div className="footer-fade md:col-span-5">
            <p className="font-display text-[24px] sm:text-[26px] font-semibold leading-none tracking-tight">
              {hotel.name}
            </p>
            <p className="mt-2.5 font-display italic text-[14px] sm:text-[15px] text-cream/85 leading-snug">
              {hotel.tagline}
            </p>
            <span aria-hidden className="mt-5 block h-px w-10 bg-marine" />
            <p className="mt-4 font-sans text-[13px] leading-[1.65] text-white/55 max-w-[34ch]">
              Un hôtel tranquille, au cœur de la ville.
            </p>
          </div>

          <div className="footer-fade md:col-span-7">
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-white/40 mb-3">
              Réservations
            </p>
            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
              <a
                href={telHref}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 min-h-[60px] transition-colors hover:border-marine/60 hover:bg-marine/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marine/20 text-marine ring-1 ring-marine/30">
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/45 leading-none">
                    Appeler
                  </span>
                  <span className="mt-1 font-sans text-[13.5px] text-white leading-tight tabular-nums truncate">
                    {hotel.contact.phonePrimary}
                  </span>
                </span>
              </a>
              <a
                href={mailHref}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 min-h-[60px] transition-colors hover:border-marine/60 hover:bg-marine/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marine/20 text-marine ring-1 ring-marine/30">
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/45 leading-none">
                    Email
                  </span>
                  <span className="mt-1 font-sans text-[12.5px] text-white leading-tight truncate">
                    {hotel.contact.email}
                  </span>
                </span>
              </a>
            </div>

            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 group/addr flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 min-h-[60px] transition-colors hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/80 ring-1 ring-white/15">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/45 leading-none">
                  Nous trouver
                </span>
                <span className="mt-1 font-sans text-[12.5px] text-white/85 leading-[1.55]">
                  {hotel.address.street} — {hotel.address.postalCode} {hotel.address.city}
                </span>
              </span>
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ease-out group-hover/addr:-translate-y-0.5 group-hover/addr:translate-x-0.5"
                strokeWidth={1.75}
              />
            </a>
          </div>
        </div>

        {/* BOTTOM RAIL — compact. */}
        <div className="footer-fade mt-9 md:mt-12 border-t border-white/10 pt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[11.5px] text-white/40">
            © 2026 {hotel.name} — {hotel.address.city}, {hotel.address.country}.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 font-sans text-[11.5px] text-white/45">
            {utilityLinks.map((link) => (
              <li key={link.href}>
                <SmartLink
                  href={link.href}
                  className="inline-flex items-center min-h-[36px] transition-colors hover:text-white/85 focus-visible:outline-none focus-visible:text-white/90"
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
