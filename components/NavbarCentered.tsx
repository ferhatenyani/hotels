"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import SmartLink from "@/components/site/SmartLink";

// Each link names its route (for sub-pages) and the home-page section id so
// SmartLink can scroll-or-navigate at click time per the user's nav contract.
const leftLinks = [
  { label: "Chambres", href: "/rooms", sectionId: "rooms" },
  { label: "Restaurant", href: "/dining", sectionId: "dining" },
  { label: "Événements", href: "/events", sectionId: "events" },
];

const rightLinks = [
  { label: "Contact", href: "/contact", sectionId: "contact" },
];

// Mobile menu surfaces every top-level route so the drawer is the full nav.
const mobileExtraLinks = [
  { label: "Offres", href: "/offers" },
  { label: "Découvrir la région", href: "/decouvrir" },
  { label: "Galerie", href: "/gallery" },
  { label: "À propos", href: "/about" },
];

export default function NavbarCentered() {
  const [open, setOpen] = useState(false);
  // overHero: the hero still occupies the navbar's vertical slice — render in
  // light/inverted mode so the wordmark and controls stay legible against the
  // dark video. Once scrolled past the hero, swap to the white-blur compact
  // bar with dark ink controls. On non-home routes there is no full-bleed
  // video hero, so the bar starts in compact mode immediately.
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [overHero, setOverHero] = useState(onHome);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Off-home: skip the hero detection entirely and stay in compact mode.
    if (!onHome) {
      setOverHero(false);
      return;
    }
    const onScroll = () => {
      // Tie the morph to scroll distance from the top, not the hero's
      // viewport position — the bar should start morphing the instant the
      // user scrolls, not after the hero leaves the viewport. 16px dead
      // zone avoids flipping the state on accidental nudges.
      setOverHero(window.scrollY < 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onHome]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const allMobileLinks = [
    ...leftLinks,
    ...rightLinks,
    ...mobileExtraLinks,
  ];

  return (
    <>
      {/* MOBILE: two stacked bars (pill + edge-to-edge) crossfade with opacity
          only — no layout-affecting properties animate, keeping the swap
          GPU-cheap on phones. The inactive bar gets aria-hidden +
          pointer-events-none so taps go through to the visible one. */}
      <header
        aria-hidden={!overHero}
        className={cn(
          "md:hidden fixed z-[60] top-3 left-3 right-3 h-14 rounded-[28px] grid grid-cols-3 items-center bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(21,19,22,0.18)] px-1.5 border border-ink/[0.08] transition-opacity duration-300 ease-out will-change-[opacity]",
          overHero ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <MobileBarContent onOpen={() => setOpen(true)} open={open} />
      </header>
      <header
        aria-hidden={overHero}
        className={cn(
          "md:hidden fixed z-[60] top-0 left-0 right-0 h-12 grid grid-cols-3 items-center bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(21,19,22,0.18)] px-1.5 border-b border-ink/[0.08] transition-opacity duration-300 ease-out will-change-[opacity]",
          overHero ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <MobileBarContent onOpen={() => setOpen(true)} open={open} />
      </header>

      {/* TABLET/DESKTOP: when at the top of the hero, the bar tucks inside
          the video card's padding (matches md:p-3 / lg:p-5). Once scrolled,
          it returns to a full-width bar at the very top. */}
      <header
        ref={navRef}
        className={cn(
          "hidden md:block fixed z-[60] transition-[top,left,right,background-color,backdrop-filter,height,border-color] duration-300 ease-out",
          overHero
            ? "top-3 left-3 right-3 lg:top-5 lg:left-5 lg:right-5 h-[64px] sm:h-[72px] bg-transparent border-b border-transparent"
            : "top-0 left-0 right-0 h-[56px] bg-white/85 backdrop-blur-md border-b border-ink/10",
        )}
      >
        {/* Horizontal padding matches the hero card's inner padding so the nav
            items visually sit inside the video container, aligned with the
            hero headline below. */}
        <nav className="relative flex h-full w-full items-center px-5 sm:px-10 lg:px-14">
          {/* Left flank — desktop */}
          <div className="hidden md:flex flex-1 items-center text-[11px] font-sans tracking-[0.18em] uppercase">
            {leftLinks.map((link, i) => (
              <span key={link.href} className="flex items-center">
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "mx-2 h-1 w-1 rounded-full transition-colors",
                      overHero ? "bg-white/60" : "bg-ink/40",
                    )}
                  />
                )}
                <SmartLink
                  href={link.href}
                  sectionId={link.sectionId}
                  className={cn(
                    "inline-flex h-11 items-center px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm",
                    overHero
                      ? "text-white hover:text-cream focus-visible:outline-white"
                      : "text-ink hover:text-navy focus-visible:outline-navy",
                  )}
                >
                  {link.label}
                </SmartLink>
              </span>
            ))}
          </div>

          {/* Center wordmark */}
          <div className="flex-1 flex flex-col items-center max-md:items-start">
            <SmartLink
              href="/"
              sectionId="top"
              className={cn(
                "font-display font-semibold tracking-tight transition-[font-size,color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm",
                overHero
                  ? "text-base sm:text-lg text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] focus-visible:outline-white"
                  : "text-[15px] sm:text-base text-ink focus-visible:outline-navy",
              )}
            >
              Notre Hôtel
            </SmartLink>
            <span
              className={cn(
                "hidden md:block text-[10px] font-sans tracking-[0.24em] uppercase transition-[max-height,opacity,margin,color] duration-300 overflow-hidden",
                overHero
                  ? "max-h-4 opacity-100 mt-0.5 text-white/70"
                  : "max-h-0 opacity-0 mt-0 text-ink/55",
              )}
            >
              Votre Ville
            </span>
          </div>

          {/* Right flank — desktop */}
          <div className="hidden md:flex flex-1 items-center justify-end text-[11px] font-sans tracking-[0.18em] uppercase">
            {rightLinks.map((link) => (
              <SmartLink
                key={link.href}
                href={link.href}
                sectionId={link.sectionId}
                className={cn(
                  "inline-flex h-11 items-center px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm",
                  overHero
                    ? "text-white hover:text-cream focus-visible:outline-white"
                    : "text-ink hover:text-navy focus-visible:outline-navy",
                )}
              >
                {link.label}
              </SmartLink>
            ))}
            <span
              aria-hidden
              className={cn(
                "mx-2 h-1 w-1 rounded-full transition-colors",
                overHero ? "bg-white/60" : "bg-ink/40",
              )}
            />
            <SmartLink
              href="/booking/search"
              className={cn(
                "inline-flex h-11 items-center gap-1.5 px-3 font-semibold rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                overHero
                  ? "bg-white text-ink hover:bg-cream focus-visible:outline-white"
                  : "text-ink hover:text-navy focus-visible:outline-navy",
              )}
            >
              Réserver
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </SmartLink>
          </div>

        </nav>
      </header>

      {/* Full-screen mobile overlay menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu du site"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-[80] md:hidden flex flex-col bg-white transition-[opacity,transform] duration-[420ms] ease-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none",
        )}
      >
        <div className="flex h-[72px] items-center px-4">
          <span className="font-display font-semibold text-base text-ink">
            Notre Hôtel
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="ml-auto flex h-11 w-11 items-center justify-center text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-md"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 pt-4 pb-8 flex flex-col">
          <ul className="flex flex-col">
            {allMobileLinks.map((link, i) => {
              const sectionId =
                "sectionId" in link
                  ? (link as { sectionId?: string }).sectionId
                  : undefined;
              return (
                <li
                  key={link.href}
                  className={cn(
                    "border-b border-ink/10",
                    i === 0 && "border-t border-ink/10",
                  )}
                >
                  <SmartLink
                    href={link.href}
                    sectionId={sectionId}
                    onAfterClick={() => setOpen(false)}
                    className="flex min-h-[60px] items-center justify-between font-display text-[28px] font-medium tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                  >
                    {link.label}
                    <ArrowRight
                      className="h-4 w-4 text-ink/40"
                      strokeWidth={1.75}
                    />
                  </SmartLink>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto pt-10">
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/45">
              Votre Ville
            </p>
            <SmartLink
              href="/booking/search"
              onAfterClick={() => setOpen(false)}
              className="mt-4 inline-flex w-full min-h-[56px] items-center justify-center gap-2 rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
            >
              Réserver
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </SmartLink>
          </div>
        </nav>
      </div>
    </>
  );
}

function MobileBarContent({
  onOpen,
  open,
}: {
  onOpen: () => void;
  open: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="justify-self-start flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-ink/[0.04]"
      >
        <span className="block h-[1.5px] w-5 bg-ink" />
        <span className="block h-[1.5px] w-4 bg-ink" />
        <span className="block h-[1.5px] w-5 bg-ink" />
      </button>
      <SmartLink
        href="/"
        sectionId="top"
        className="justify-self-center font-display font-semibold text-[15px] tracking-tight text-ink whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy rounded-sm"
      >
        Notre Hôtel
      </SmartLink>
      <SmartLink
        href="/booking/search"
        className="justify-self-end inline-flex h-10 items-center gap-1 rounded-full bg-marine text-white px-3.5 font-sans text-[10.5px] font-semibold uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine active:bg-marine/90"
      >
        Réserver
        <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
      </SmartLink>
    </>
  );
}
