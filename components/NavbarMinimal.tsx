"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Exhibit", href: "#exhibit" },
  { label: "Activities", href: "#activities" },
  { label: "Contact", href: "#contact" },
];

export default function NavbarMinimal() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-[64px] w-full bg-white">
      <nav className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-10">
        <a
          href="#top"
          className="font-display font-semibold text-base sm:text-lg tracking-tight text-ink"
        >
          Maison Dorée
        </a>

        <div className="hidden md:flex items-center text-[11px] font-sans tracking-[0.18em] text-ink uppercase">
          {navLinks.map((link, i) => (
            <span key={link.href} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="mx-5 h-3 w-px bg-ink/15" />
              )}
              <a
                href={link.href}
                className="hover:text-navy transition-colors"
              >
                {link.label}
              </a>
            </span>
          ))}
          <span aria-hidden className="mx-5 h-3 w-px bg-ink/15" />
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-navy transition-colors"
          >
            Book your stay
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px] p-2"
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block w-6 h-[2px] bg-ink" />
          <span className="block w-6 h-[2px] bg-ink" />
        </button>
      </nav>

      {open && (
        <div className="absolute left-3 right-3 top-full z-40 mt-2 flex flex-col gap-3 rounded-2xl bg-white px-6 py-5 text-sm shadow-[0_10px_28px_-12px_rgba(21,19,22,0.22)] md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-[12px] uppercase tracking-[0.18em] text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] font-semibold text-ink"
          >
            Book your stay
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </a>
        </div>
      )}
    </div>
  );
}
