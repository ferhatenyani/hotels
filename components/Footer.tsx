"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";

import SmartLink from "@/components/site/SmartLink";
import { hotel } from "@/lib/data/hotel";

// Brand glyphs as inline SVGs — the installed lucide-react (1.21) predates
// the brand-icon set, and Lucide later removed them over trademark concerns.
// Drawn at 18×18 to match the surrounding lucide stroke language.
function InstagramGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
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
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

// Two columns: the booking-funnel side of the site, then the marketing /
// storytelling pages. Splitting them in the footer makes the IA legible at a
// glance — what to do (book/manage), and what to read (rooms/dining/events).
const bookLinks = [
  { label: "Chambres", href: "/rooms", sectionId: "rooms" },
  { label: "Offres", href: "/offers" },
  { label: "Réserver", href: "/booking/search" },
  { label: "Retrouver ma réservation", href: "/booking/lookup" },
];

const exploreLinks = [
  { label: "Restaurant", href: "/dining", sectionId: "dining" },
  { label: "Événements & Réunions", href: "/events", sectionId: "events" },
  { label: "Découvrir la région", href: "/decouvrir" },
  { label: "Galerie", href: "/gallery" },
  { label: "À propos", href: "/about" },
  { label: "Contact", href: "/contact", sectionId: "contact" },
];

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
      gsap.from(".footer-col", {
        autoAlpha: 0,
        y: 18,
        stagger: 0.08,
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

  const telHref = `tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`;
  const mailHref = `mailto:${hotel.contact.email}`;

  return (
    <footer ref={footerRef} className="grain relative bg-ink text-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-14 md:pt-20 lg:pt-[120px] pb-8 md:pb-10">
        {/* ── Mobile-first: brand → contact CTAs → quick links → social.
            Desktop reflows to a 12-col grid that re-uses the same blocks. */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-x-8 md:gap-y-12">
          {/* Brand block — anchored top-left on every breakpoint. */}
          <div className="footer-col md:col-span-5 lg:col-span-4">
            <p className="font-display text-[26px] sm:text-[28px] font-semibold leading-none tracking-tight">
              {hotel.name}
            </p>
            <p className="mt-3 font-display italic text-[15px] sm:text-[16px] text-cream/85 leading-snug">
              {hotel.tagline}
            </p>
            <p className="mt-4 font-sans text-[14px] leading-[1.65] text-white/55 max-w-[36ch]">
              Un hôtel tranquille, au cœur de la ville.
            </p>

            {/* Slim accent line. Marine green = brand. Sits just above the
                contact tiles so the eye keeps moving downward. */}
            <span
              aria-hidden
              className="mt-7 block h-px w-12 bg-marine"
            />
          </div>

          {/* Contact tiles — phone + email. On mobile, the primary funnel
              entry off-hours; on desktop, a parallel column. Each tile is a
              full tap target (≥64px) with icon + label + value. */}
          <div className="footer-col md:col-span-7 lg:col-span-5">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/40 mb-3.5">
              Réservations
            </p>
            <div className="grid grid-cols-1 gap-2.5 xs:grid-cols-2">
              <a
                href={telHref}
                className="group/tile flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 min-h-[64px] transition-colors hover:border-marine/60 hover:bg-marine/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marine/20 text-marine ring-1 ring-marine/30">
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/45 leading-none">
                    Appeler
                  </span>
                  <span className="mt-1.5 font-sans text-[14px] text-white leading-tight tabular-nums truncate">
                    {hotel.contact.phonePrimary}
                  </span>
                </span>
              </a>
              <a
                href={mailHref}
                className="group/tile flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 min-h-[64px] transition-colors hover:border-marine/60 hover:bg-marine/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marine/20 text-marine ring-1 ring-marine/30">
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/45 leading-none">
                    Email
                  </span>
                  <span className="mt-1.5 font-sans text-[13px] text-white leading-tight truncate">
                    {hotel.contact.email}
                  </span>
                </span>
              </a>
            </div>

            {/* Address card with an "open in maps" affordance. */}
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 group/addr flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 min-h-[64px] transition-colors hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/80 ring-1 ring-white/15">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/45 leading-none">
                  Nous trouver
                </span>
                <span className="mt-1.5 font-sans text-[13px] text-white/85 leading-[1.55]">
                  {hotel.address.street}
                  <br />
                  {hotel.address.postalCode} {hotel.address.city},{" "}
                  {hotel.address.country}
                </span>
              </span>
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ease-out group-hover/addr:-translate-y-0.5 group-hover/addr:translate-x-0.5"
                strokeWidth={1.75}
              />
            </a>
          </div>

          {/* Spacer for desktop — Brand + Reservations sit on row 1, the link
              columns flow on row 2 on lg+; on md they reflow under. */}
          <div aria-hidden className="hidden lg:block lg:col-span-3" />

          {/* Book column. */}
          <div className="footer-col md:col-span-6 lg:col-span-3">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/40 mb-4">
              Réserver
            </p>
            <ul className="flex flex-col gap-0.5 font-sans text-[15px] text-white/75">
              {bookLinks.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    sectionId={"sectionId" in link ? link.sectionId : undefined}
                    className="group/link inline-flex items-center gap-2 py-2.5 min-h-[44px] transition-colors hover:text-cream focus-visible:outline-none focus-visible:text-cream"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-white/30 transition-all duration-300 ease-out group-hover/link:text-cream group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore column. */}
          <div className="footer-col md:col-span-6 lg:col-span-3">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/40 mb-4">
              Découvrir
            </p>
            <ul className="flex flex-col gap-0.5 font-sans text-[15px] text-white/75">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    sectionId={"sectionId" in link ? link.sectionId : undefined}
                    className="group/link inline-flex items-center gap-2 py-2.5 min-h-[44px] transition-colors hover:text-cream focus-visible:outline-none focus-visible:text-cream"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-white/30 transition-all duration-300 ease-out group-hover/link:text-cream group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect column — social. Square icon tiles on mobile so the
              hit area stays generous; same rhythm on desktop, stacked. */}
          <div className="footer-col md:col-span-12 lg:col-span-3">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/40 mb-4">
              Nous suivre
            </p>
            <ul className="flex items-center gap-3">
              <li>
                <a
                  href={hotel.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${hotel.name} sur Instagram`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/80 transition-colors hover:border-marine/60 hover:bg-marine/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                >
                  <InstagramGlyph className="h-[18px] w-[18px]" />
                </a>
              </li>
              <li>
                <a
                  href={hotel.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${hotel.name} sur Facebook`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/80 transition-colors hover:border-marine/60 hover:bg-marine/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                >
                  <FacebookGlyph className="h-[18px] w-[18px]" />
                </a>
              </li>
            </ul>
            <p className="mt-5 font-sans text-[12px] leading-[1.6] text-white/45 max-w-[28ch]">
              Des nouvelles de l'hôtel — chambres, événements et un aperçu de la vue.
            </p>
          </div>
        </div>

        {/* Bottom rail. Tighter on mobile, side-by-side on md+. */}
        <div className="mt-12 md:mt-16 lg:mt-20 border-t border-white/10 pt-6 md:pt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[12px] text-white/40">
            © 2026 {hotel.name} — {hotel.address.city}, {hotel.address.country}.
            Tous droits réservés.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 font-sans text-[12px] text-white/45">
            {utilityLinks.map((link) => (
              <li key={link.href}>
                <SmartLink
                  href={link.href}
                  className="inline-flex items-center min-h-[40px] transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:text-white/90"
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
