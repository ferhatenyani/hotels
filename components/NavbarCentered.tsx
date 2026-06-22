"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const leftLinks = [
  { label: "Rooms", href: "#rooms" },
  { label: "Dining", href: "#dining" },
  { label: "Events", href: "#events" },
];

const rightLinks = [{ label: "Contact", href: "#contact" }];

export default function NavbarCentered() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Compact-on-scroll: shrink and become opaque after the user crosses ~80px.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setCompact(y > 64);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const allMobileLinks = [...leftLinks, ...rightLinks];

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "fixed inset-x-0 top-0 z-[60] w-full transition-[background-color,backdrop-filter,height,border-color] duration-300 ease-out",
          compact
            ? "h-[56px] bg-white/85 backdrop-blur-md border-b border-ink/10"
            : "h-[72px] bg-white/0 border-b border-transparent",
        )}
      >
        <nav className="flex h-full w-full items-center px-4 sm:px-6 lg:px-10">
          {/* Left flank — desktop */}
          <div className="hidden md:flex flex-1 items-center text-[11px] font-sans tracking-[0.18em] uppercase">
            {leftLinks.map((link, i) => (
              <span key={link.href} className="flex items-center">
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "mx-2 h-1 w-1 rounded-full transition-colors",
                      compact ? "bg-ink/40" : "bg-ink/40",
                    )}
                  />
                )}
                <a
                  href={link.href}
                  className={cn(
                    "inline-flex h-11 items-center px-1 transition-colors hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-sm",
                    compact ? "text-ink" : "text-ink",
                  )}
                >
                  {link.label}
                </a>
              </span>
            ))}
          </div>

          {/* Center wordmark */}
          <div className="flex-1 flex flex-col items-center max-md:items-start max-md:pl-2">
            <a
              href="#top"
              className={cn(
                "font-display font-semibold tracking-tight transition-[font-size] duration-300 text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy rounded-sm",
                compact ? "text-[15px] sm:text-base" : "text-base sm:text-lg",
              )}
            >
              Hôtel du Lac
            </a>
            <span
              className={cn(
                "hidden md:block text-[10px] font-sans tracking-[0.24em] text-ink/55 uppercase transition-[max-height,opacity,margin] duration-300 overflow-hidden",
                compact ? "max-h-0 opacity-0 mt-0" : "max-h-4 opacity-100 mt-0.5",
              )}
            >
              Béjaïa, Algérie
            </span>
          </div>

          {/* Right flank — desktop */}
          <div className="hidden md:flex flex-1 items-center justify-end text-[11px] font-sans tracking-[0.18em] text-ink uppercase">
            {rightLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex h-11 items-center px-1 hover:text-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-sm"
              >
                {link.label}
              </a>
            ))}
            <span
              aria-hidden
              className="mx-2 h-1 w-1 rounded-full bg-ink/40"
            />
            <a
              href="#contact"
              className="inline-flex h-11 items-center gap-1.5 px-1 font-semibold text-ink hover:text-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-sm"
            >
              Reserve
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </a>
          </div>

          {/* Mobile right cluster: Reserve pill + hamburger */}
          <div className="md:hidden flex items-center gap-1.5 ml-auto">
            <a
              href="#contact"
              className={cn(
                "inline-flex h-9 items-center gap-1 rounded-full px-3 font-sans text-[10.5px] font-semibold uppercase tracking-[0.16em] transition-[background-color,color,opacity] duration-300",
                compact
                  ? "bg-marine text-white"
                  : "bg-ink/5 text-ink hover:bg-ink/10",
              )}
            >
              Reserve
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-md"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span className="block h-[2px] w-6 bg-ink" />
              <span className="block h-[2px] w-4 bg-ink" />
              <span className="block h-[2px] w-6 bg-ink" />
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen mobile overlay menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
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
            Hôtel du Lac
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="ml-auto flex h-11 w-11 items-center justify-center text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-md"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 pt-4 pb-8 flex flex-col">
          <ul className="flex flex-col">
            {allMobileLinks.map((link, i) => (
              <li
                key={link.href}
                className={cn(
                  "border-b border-ink/10",
                  i === 0 && "border-t border-ink/10",
                )}
              >
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[60px] items-center justify-between font-display text-[28px] font-medium tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-ink/40" strokeWidth={1.75} />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-10">
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/45">
              Béjaïa, Algérie
            </p>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-full min-h-[56px] items-center justify-center gap-2 rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
            >
              Reserve
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
