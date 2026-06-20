"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Exhibit", href: "#exhibit" },
  { label: "Activities", href: "#activities" },
  { label: "Contact", href: "#contact" },
];

export default function NavbarUtilityStrip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full bg-white">
      {/* Top utility strip — hotel metadata, hidden on mobile */}
      <div className="hidden md:flex h-7 items-center justify-between px-4 sm:px-6 lg:px-10 text-[10px] font-sans tracking-[0.22em] text-ink/55 uppercase border-b border-ink/[0.06]">
        <div className="flex gap-3">
          <span>Saint-Jean-Cap-Ferrat</span>
          <span aria-hidden>·</span>
          <span>+33 4 93 00 00 00</span>
        </div>
        <span>Concierge</span>
      </div>

      <nav className="flex h-[64px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <a
          href="#top"
          className="font-display font-semibold text-base sm:text-lg tracking-tight text-ink"
        >
          Maison Dorée
        </a>

        <div className="hidden md:flex items-center gap-8 text-[13px] font-sans text-ink">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-navy transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-ink/20 px-5 text-[13px] font-medium text-ink hover:border-ink/40 transition-colors"
          >
            Book a stay
            <ArrowRight className="h-3.5 w-3.5" />
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
              className="text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-ink/20 px-5 text-[13px] font-medium text-ink self-start mt-2"
          >
            Book a stay
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
