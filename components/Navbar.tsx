"use client";

import { useState } from "react";

const navLinks = [
  { label: "Exhibit", href: "#exhibit" },
  { label: "Activities", href: "#activities" },
  { label: "Contact", href: "#contact" },
];

// Single source of truth for navy CTA so Navbar + mobile menu stay in lock-step.
const navyCta =
  "inline-flex items-center justify-center rounded-[14px] bg-navy text-white font-sans text-[13px] font-medium tracking-wide transition-colors hover:bg-navy-light";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-[80px] w-full bg-white">
      <nav className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-10">
        <a
          href="#top"
          className="font-display font-semibold text-base sm:text-lg tracking-tight text-ink"
        >
          Maison Dorée
        </a>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex h-9 items-center rounded-full bg-ink/[0.05] px-4 font-sans text-[13px] text-ink transition-colors hover:bg-ink/[0.09]"
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" className={`${navyCta} ml-1 h-11 px-5`}>
            Reserve
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
        <div className="absolute left-3 right-3 top-full z-40 mt-2 flex flex-col gap-4 rounded-2xl bg-white px-6 py-5 text-sm shadow-[0_10px_28px_-12px_rgba(21,19,22,0.22)] md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-1"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className={`${navyCta} mt-2 h-11 self-start px-5`}
          >
            Reserve
          </a>
        </div>
      )}
    </div>
  );
}
