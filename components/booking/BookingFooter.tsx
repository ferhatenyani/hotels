// Minimal funnel footer — direct line, email, the two utility links, and
// the © line. No marketing nav so the user doesn't drift mid-booking.

import Link from "next/link";

import { hotel } from "@/lib/data/hotel";

export default function BookingFooter() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-4 font-sans text-[12px] text-ink/55">
        <div className="flex flex-col gap-1">
          <p>
            Need help? Call{" "}
            <a
              href={`tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`}
              className="text-ink hover:text-marine transition-colors"
            >
              {hotel.contact.phonePrimary}
            </a>{" "}
            or email{" "}
            <a
              href={`mailto:${hotel.contact.email}`}
              className="text-ink hover:text-marine transition-colors"
            >
              {hotel.contact.email}
            </a>
            .
          </p>
          <p className="text-ink/55">
            Direct booking. We confirm every reservation ourselves.
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <li>
            <Link
              href="/policies"
              className="hover:text-ink transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
            >
              Policies
            </Link>
          </li>
          <li>
            <Link
              href="/faq"
              className="hover:text-ink transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
            >
              FAQ
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className="hover:text-ink transition-colors max-md:min-h-[44px] max-md:inline-flex max-md:items-center"
            >
              Back to site
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
