// Booking funnel layout — slim, focused, conversion-first. No main nav,
// no chat FAB, no marketing footer. Just a logo + support line, the step
// rail, the page, and a minimal footer with the policy/FAQ links.

import { Suspense } from "react";

import BookingHeader from "@/components/booking/BookingHeader";
import BookingFooter from "@/components/booking/BookingFooter";
import StepRail from "@/components/booking/StepRail";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <BookingHeader />
      {/* StepRail reads usePathname/useSearchParams — wrap in Suspense per
          Next.js 16 requirement for hooks that opt routes into dynamic. */}
      <Suspense fallback={null}>
        <StepRail />
      </Suspense>
      <main className="flex-1 flex flex-col">{children}</main>
      <BookingFooter />
    </div>
  );
}
