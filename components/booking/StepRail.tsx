// Step indicator for the booking funnel. Surfaces the user's position in
// the 6-step flow so they always know how far they have left. Mobile reads
// "Step 2 of 5 · Choose room" with a thin progress rule; tablet+ shows the
// full chip rail. Past steps are still tappable so the user can edit
// upstream choices (rule from UX guidelines: predictable back behavior).

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { bookingHref, searchParamsToBooking } from "@/lib/booking/params";
import { cn } from "@/lib/utils";

type Step = {
  id: "search" | "results" | "guest" | "review" | "payment" | "confirmation";
  label: string;
  shortLabel: string;
};

const steps: Step[] = [
  { id: "search", label: "Dates & guests", shortLabel: "Dates" },
  { id: "results", label: "Choose room", shortLabel: "Room" },
  { id: "guest", label: "Your details", shortLabel: "Details" },
  { id: "review", label: "Review", shortLabel: "Review" },
  { id: "payment", label: "Payment", shortLabel: "Payment" },
  { id: "confirmation", label: "Confirmation", shortLabel: "Done" },
];

export default function StepRail() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParamsToBooking(searchParams);

  const currentId = steps.find((s) =>
    pathname.startsWith(`/booking/${s.id}`),
  )?.id;
  const currentIndex = currentId ? steps.findIndex((s) => s.id === currentId) : -1;

  // Lookup is a side-route, not part of the rail.
  if (pathname.startsWith("/booking/lookup")) return null;
  if (currentIndex < 0) return null;

  const current = steps[currentIndex];

  return (
    <div className="border-b border-ink/10 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-3 md:py-4">
        {/* MOBILE: compact "Step X of N · Label" + thin progress bar. */}
        <div className="md:hidden flex items-center justify-between gap-3">
          <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            Step {currentIndex + 1} of {steps.length}
          </p>
          <p className="font-display text-[14px] font-medium tracking-tight text-ink truncate">
            {current.label}
          </p>
        </div>
        <div
          className="md:hidden mt-2 h-[2px] w-full bg-ink/10 rounded-full overflow-hidden"
          aria-hidden
        >
          <div
            className="h-full bg-marine rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${((currentIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* TABLET+: chip rail. Past steps are links; current and future steps
            render as plain spans (no back-skipping forward). */}
        <ol className="hidden md:flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.18em]">
          {steps.map((s, i) => {
            const isCurrent = i === currentIndex;
            const isPast = i < currentIndex;
            const isFuture = i > currentIndex;
            const node = (
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
                  isCurrent && "bg-marine text-white",
                  isPast && "text-ink/70 hover:text-marine",
                  // /55 (~5.7:1 on white) clears AA for these small-caps labels.
                  isFuture && "text-ink/55",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full font-display text-[11px] tabular-nums",
                    isCurrent && "bg-white/15 text-white",
                    isPast && "bg-ink/[0.06] text-ink",
                    isFuture && "bg-ink/[0.04] text-ink/55",
                  )}
                >
                  {i + 1}
                </span>
                {s.label}
              </span>
            );
            return (
              <li key={s.id} className="inline-flex items-center gap-1.5">
                {isPast ? (
                  <Link href={bookingHref(s.id, q)} aria-label={`Go back to ${s.label}`}>
                    {node}
                  </Link>
                ) : (
                  node
                )}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "h-px w-4 transition-colors",
                      i < currentIndex ? "bg-marine/40" : "bg-ink/15",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
