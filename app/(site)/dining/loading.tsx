// /dining loading skeleton — quiet, matches the editorial page rhythm.

export default function DiningLoading() {
  return (
    <main className="bg-white" aria-busy="true" aria-live="polite">
      {/* PageHero placeholder — default height profile. */}
      <section className="bg-white pt-[72px] sm:pt-[88px] md:pt-3 lg:pt-5">
        <div className="px-4 md:p-3 lg:p-5">
          <div className="relative w-full overflow-hidden rounded-2xl md:rounded-xl lg:rounded-2xl bg-ink/10 animate-pulse h-[56svh] min-h-[380px] sm:h-[60svh] md:h-[520px] lg:h-[600px]" />
        </div>
      </section>

      {/* Intro + hours */}
      <section className="px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="h-3 w-24 bg-ink/10 rounded animate-pulse" />
            <div className="mt-4 h-9 md:h-12 w-3/4 bg-ink/10 rounded animate-pulse" />
            <div className="mt-5 md:mt-6 h-px w-14 bg-marine/40" />
            <div className="mt-6 h-4 w-full max-w-md bg-ink/10 rounded animate-pulse" />
            <div className="mt-2 h-4 w-5/6 max-w-sm bg-ink/10 rounded animate-pulse" />
            <div className="mt-2 h-4 w-2/3 max-w-sm bg-ink/10 rounded animate-pulse" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-3 w-24 bg-ink/10 rounded animate-pulse" />
            <ul className="mt-5 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-4 border-t border-ink/15 pt-3"
                >
                  <div className="h-4 w-24 bg-ink/10 rounded animate-pulse" />
                  <div className="ml-auto h-4 w-32 bg-ink/10 rounded animate-pulse" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Menus grid placeholder */}
      <section className="bg-cream px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]">
        <div className="max-w-[1280px] mx-auto">
          <div className="h-3 w-32 bg-ink/10 rounded animate-pulse" />
          <div className="mt-4 h-9 md:h-12 w-2/3 max-w-lg bg-ink/10 rounded animate-pulse" />
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="border border-ink/10 bg-white p-6 md:p-8 lg:p-10"
              >
                <div className="h-3 w-20 bg-ink/10 rounded animate-pulse" />
                <div className="mt-3 h-6 w-1/2 bg-ink/10 rounded animate-pulse" />
                <div className="mt-4 h-px w-10 bg-marine/40" />
                <div className="mt-4 h-3 w-full bg-ink/10 rounded animate-pulse" />
                <div className="mt-2 h-3 w-5/6 bg-ink/10 rounded animate-pulse" />
                <div className="mt-6 flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-4 w-full border-b border-ink/10 pb-3 bg-ink/5 rounded animate-pulse"
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
