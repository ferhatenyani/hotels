"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const leftLinks = [
  { label: "Exhibit", href: "#exhibit" },
  { label: "Activities", href: "#activities" },
];

const rightLinks = [{ label: "Contact", href: "#contact" }];

export default function NavbarCentered() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-[80px] w-full bg-white">
      <nav className="flex h-full w-full items-center px-4 sm:px-6 lg:px-10">
        {/* Left flank */}
        <div className="hidden md:flex flex-1 items-center text-[11px] font-sans tracking-[0.18em] text-ink uppercase">
          {leftLinks.map((link, i) => (
            <span key={link.href} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className="mx-2 h-1 w-1 rounded-full bg-ink/40"
                />
              )}
              <a
                href={link.href}
                className="inline-flex h-11 items-center px-1 hover:text-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-sm"
              >
                {link.label}
              </a>
            </span>
          ))}
        </div>

        {/* Center wordmark + subscript */}
        <div className="flex-1 flex flex-col items-center">
          <a
            href="#top"
            className="font-display font-semibold text-base sm:text-lg tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy rounded-sm"
          >
            Maison Dorée
          </a>
          <span className="hidden md:block text-[10px] font-sans tracking-[0.24em] text-ink/55 uppercase mt-0.5">
            Saint-Jean-Cap-Ferrat
          </span>
        </div>

        {/* Right flank */}
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

        {/* Mobile hamburger — absolute so it doesn't shift the centered wordmark */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden absolute right-2 flex h-11 w-11 flex-col gap-[5px] items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-md"
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block w-6 h-[2px] bg-ink" />
          <span className="block w-6 h-[2px] bg-ink" />
        </button>
      </nav>

      {open && (
        <div className="absolute left-3 right-3 top-full z-40 mt-2 flex flex-col gap-3 rounded-2xl bg-white px-6 py-5 text-sm shadow-[0_10px_28px_-12px_rgba(21,19,22,0.22)] md:hidden">
          {[...leftLinks, ...rightLinks].map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-[12px] uppercase tracking-[0.18em] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-sm"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] font-semibold text-ink py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy rounded-sm"
          >
            Reserve
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </a>
        </div>
      )}
    </div>
  );
}
