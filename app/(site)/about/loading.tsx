// /about loading skeleton — quiet, matches the editorial page rhythm.

export default function AboutLoading() {
  return (
    <main className="bg-white" aria-busy="true" aria-live="polite">
      {/* PageHero placeholder */}
      <section className="bg-white pt-[72px] sm:pt-[88px] md:pt-3 lg:pt-5">
        <div className="px-4 md:p-3 lg:p-5">
          <div className="relative w-full overflow-hidden rounded-2xl md:rounded-xl lg:rounded-2xl bg-ink/10 animate-pulse h-[56svh] min-h-[380px] sm:h-[60svh] md:h-[520px] lg:h-[600px]" />
        </div>
      </section>

      {/* Narrow story column */}
      <section className="px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]">
        <div className="max-w-[920px] mx-auto">
          <div className="h-3 w-20 bg-ink/10 rounded animate-pulse" />
          <div className="mt-4 h-9 md:h-12 w-3/4 bg-ink/10 rounded animate-pulse" />
          <div className="mt-5 md:mt-6 h-px w-14 bg-marine/40" />
          <div className="mt-7 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full bg-ink/10 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stat band */}
      <section className="bg-cream px-4 sm:px-6 lg:px-10 py-10 md:py-14 lg:py-20">
        <div className="max-w-[1100px] mx-auto border-y border-ink/15 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto h-10 md:h-12 w-20 bg-ink/10 rounded animate-pulse" />
                <div className="mx-auto mt-3 h-3 w-24 bg-ink/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
