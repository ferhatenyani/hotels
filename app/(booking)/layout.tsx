// Booking funnel layout — slim, focused, conversion-first. No main nav,
// no chat FAB. Step rail above the content, and the same marketing Footer
// as the rest of the site below so the chrome stays consistent end-to-end.

import { Suspense } from "react";

import BookingHeader from "@/components/booking/BookingHeader";
import Footer from "@/components/Footer";
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
      <Footer />
    </div>
  );
}
