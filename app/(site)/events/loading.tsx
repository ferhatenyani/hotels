// /events loading skeleton — quiet, matches the page rhythm.

export default function EventsLoading() {
  return (
    <main className="bg-white" aria-busy="true" aria-live="polite">
      {/* PageHero placeholder */}
      <section className="bg-white pt-[72px] sm:pt-[88px] md:pt-3 lg:pt-5">
        <div className="px-4 md:p-3 lg:p-5">
          <div className="relative w-full overflow-hidden rounded-2xl md:rounded-xl lg:rounded-2xl bg-ink/10 animate-pulse h-[56svh] min-h-[380px] sm:h-[60svh] md:h-[520px] lg:h-[600px]" />
        </div>
      </section>

      {/* Stats banner placeholder */}
      <section className="px-4 sm:px-6 lg:px-10 py-10 md:py-14 lg:py-20">
        <div className="max-w-[1100px] mx-auto border-y border-ink/10 py-7 sm:py-9 md:py-11">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto h-8 md:h-10 w-20 bg-ink/10 rounded animate-pulse" />
                <div className="mx-auto mt-3 h-3 w-24 bg-ink/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event types grid */}
      <section className="px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]">
        <div className="max-w-[1280px] mx-auto">
          <div className="h-3 w-24 bg-ink/10 rounded animate-pulse" />
          <div className="mt-4 h-9 md:h-12 w-2/3 max-w-lg bg-ink/10 rounded animate-pulse" />
          <div className="mt-5 md:mt-6 h-px w-14 bg-marine/40" />
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="border border-ink/10 bg-white p-6 md:p-8"
              >
                <div className="h-12 w-12 rounded-full bg-ink/10 animate-pulse" />
                <div className="mt-5 h-6 w-2/3 bg-ink/10 rounded animate-pulse" />
                <div className="mt-4 h-px w-10 bg-marine/40" />
                <div className="mt-4 h-4 w-full bg-ink/10 rounded animate-pulse" />
                <div className="mt-2 h-4 w-5/6 bg-ink/10 rounded animate-pulse" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
