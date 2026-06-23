// Generic booking-funnel shimmer. Matches the rhythm of the funnel pages
// (narrow content area, sticky right-column summary placeholder on lg+).
// The booking layout already renders header + step rail above this.

export default function BookingLoading() {
  return (
    <div
      className="px-4 sm:px-6 lg:px-10 py-10 md:py-14 lg:py-20"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header placeholder */}
        <div className="max-w-[44ch]">
          <div className="h-3 w-32 bg-ink/10 rounded animate-pulse" />
          <div className="mt-4 h-10 md:h-12 w-3/4 bg-ink/10 rounded animate-pulse" />
          <div className="mt-5 md:mt-6 h-px w-14 bg-marine/40" />
          <div className="mt-6 h-4 w-full max-w-md bg-ink/10 rounded animate-pulse" />
          <div className="mt-2 h-4 w-5/6 max-w-sm bg-ink/10 rounded animate-pulse" />
        </div>

        {/* Two-column body placeholder */}
        <div className="mt-8 md:mt-12 grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="h-24 bg-ink/[0.05] rounded-2xl animate-pulse" />
            <div className="h-32 bg-ink/[0.05] rounded-2xl animate-pulse" />
            <div className="h-64 bg-ink/[0.05] rounded-2xl animate-pulse" />
          </div>
          <div className="hidden lg:block">
            <div className="h-[420px] bg-ink/[0.05] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
