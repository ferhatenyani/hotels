// Global 404 — lives at app/not-found.tsx so it inherits only the root
// layout (no NavbarCentered, no ChatModal, no Footer). That's intentional:
// the page is meant to be a quiet, recover-quickly screen, not a full-site
// surface with all the nav noise.
//
// We render a minimal logo top-left + a Home link, then the apology + the
// four "where you probably meant to go" quick links, then a tiny "Call the
// desk" footer line.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: "Page not found — Hôtel du Lac, Béjaïa",
  description:
    "The page you tried to reach isn't here. Find your way back to the rooms, the booking flow, or the contact desk.",
};

const quickLinks: { href: string; label: string; hint: string }[] = [
  { href: "/", label: "Home", hint: "Back to the front of the house" },
  { href: "/rooms", label: "Rooms", hint: "Six rooms, one lake" },
  {
    href: "/booking/search",
    label: "Reserve",
    hint: "Pick dates and a room",
  },
  {
    href: "/booking/lookup",
    label: "Find my booking",
    hint: "Look up a reservation by reference",
  },
];

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-white text-ink flex flex-col">
      {/* Minimal top bar: wordmark + Home link. No full Navbar — this is a
          recovery page, not a marketing surface. */}
      <header className="px-4 sm:px-6 lg:px-10 py-5 md:py-6 border-b border-ink/[0.06]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display font-semibold text-[20px] md:text-[22px] tracking-tight text-ink hover:text-marine transition-colors"
          >
            Hôtel du Lac
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70 hover:text-ink min-h-[44px] px-3 transition-colors"
          >
            Home
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </Link>
        </div>
      </header>

      {/* The body fills the remaining vertical space and centres the message
          on tablet+. On phones the content reads from the top so the user
          doesn't have to scroll past empty space. */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px] flex">
        <div className="max-w-[920px] mx-auto w-full lg:my-auto">
          <p className="font-sans text-[11px] uppercase tracking-[0.24em] text-marine mb-4 md:mb-5">
            404 · A wrong turn
          </p>
          <h1 className="font-display font-medium text-[32px] xs:text-[36px] sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink text-balance max-w-[18ch]">
            We can&apos;t find that page.
          </h1>
          <span
            aria-hidden
            className="mt-6 md:mt-8 block h-px w-14 bg-marine"
          />
          <p className="mt-6 md:mt-8 font-sans text-[16px] md:text-[17px] leading-[1.7] text-graybase max-w-[52ch]">
            It may have moved, or it was never here. Let&apos;s get you back to
            somewhere calm.
          </p>

          {/* Four quick links — listed as a ledger, marine-rule on hover so
              the page still has a quiet, brand-aligned interaction. */}
          <ul className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {quickLinks.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group/link flex items-start gap-5 border-t border-ink/15 py-5 md:py-6 transition-colors hover:border-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                >
                  <span className="font-display text-[13px] text-marine pt-1 tabular-nums tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display font-medium text-[20px] md:text-[22px] leading-tight tracking-tight text-ink group-hover/link:text-marine transition-colors">
                      {link.label}
                    </span>
                    <span className="mt-1.5 block font-sans text-[13.5px] md:text-[14px] leading-[1.55] text-graybase">
                      {link.hint}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-2 h-4 w-4 text-ink/30 transition-all duration-300 ease-out group-hover/link:translate-x-1 group-hover/link:text-marine"
                    strokeWidth={1.75}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tiny "call the desk" footer — single line, plainly stated. */}
      <footer className="px-4 sm:px-6 lg:px-10 py-6 md:py-8 border-t border-ink/[0.06]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[12.5px] md:text-[13px] text-graybase">
            Need a person?{" "}
            <a
              href={`tel:${hotel.contact.phonePrimary.replace(/\s+/g, "")}`}
              className="text-ink hover:text-marine transition-colors underline decoration-marine/40 underline-offset-2"
            >
              Call the desk · {hotel.contact.phonePrimary}
            </a>
          </p>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/45">
            Hôtel du Lac · Béjaïa
          </p>
        </div>
      </footer>
    </main>
  );
}
