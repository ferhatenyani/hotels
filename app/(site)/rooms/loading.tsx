// /rooms loading skeleton — quiet, matches the listing layout below the
// PageHero (the hero streams in immediately because it's mostly an image).

export default function RoomsLoading() {
  return (
    <main className="bg-white" aria-busy="true" aria-live="polite">
      {/* PageHero placeholder — same height profile as PageHero "short". */}
      <section className="bg-white pt-[72px] sm:pt-[88px] md:pt-3 lg:pt-5">
        <div className="px-4 md:p-3 lg:p-5">
          <div className="relative w-full overflow-hidden rounded-2xl md:rounded-xl lg:rounded-2xl bg-ink/10 animate-pulse h-[44svh] min-h-[320px] sm:h-[50svh] md:h-[420px] lg:h-[480px]" />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]">
        <div className="max-w-[1280px] mx-auto">
          {/* Section heading placeholder */}
          <div className="max-w-2xl">
            <div className="h-3 w-24 bg-ink/10 rounded animate-pulse" />
            <div className="mt-4 h-9 md:h-12 w-3/4 bg-ink/10 rounded animate-pulse" />
            <div className="mt-5 md:mt-6 h-px w-14 bg-marine/40" />
            <div className="mt-6 h-4 w-full max-w-md bg-ink/10 rounded animate-pulse" />
            <div className="mt-2 h-4 w-5/6 max-w-sm bg-ink/10 rounded animate-pulse" />
          </div>

          {/* Card grid placeholder — mirrors the 1/2/3-col grid */}
          <ul className="mt-10 md:mt-14 lg:mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="border border-ink/10 bg-white overflow-hidden"
              >
                <div className="h-[200px] sm:h-[240px] md:h-[220px] lg:h-[240px] bg-ink/10 animate-pulse" />
                <div className="p-5 md:p-7 lg:p-8">
                  <div className="h-5 md:h-6 w-2/3 bg-ink/10 rounded animate-pulse" />
                  <div className="mt-3 h-3 w-1/2 bg-ink/10 rounded animate-pulse" />
                  <div className="mt-4 h-4 w-full bg-ink/10 rounded animate-pulse" />
                  <div className="mt-2 h-4 w-5/6 bg-ink/10 rounded animate-pulse" />
                  <div className="mt-2 h-4 w-3/4 bg-ink/10 rounded animate-pulse" />
                  <div className="mt-6 pt-5 md:pt-6 border-t border-ink/10 flex items-end justify-between gap-3">
                    <div className="hidden md:block">
                      <div className="h-3 w-12 bg-ink/10 rounded animate-pulse" />
                      <div className="mt-2 h-7 w-24 bg-ink/10 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-28 bg-ink/10 rounded-full animate-pulse ml-auto" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
