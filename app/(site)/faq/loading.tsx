// /faq loading skeleton — short PageHero + search bar + a few faux groups
// of collapsed question rows. Matches the real layout so the swap-in has no
// shift.

export default function FAQLoading() {
  return (
    <main className="bg-white" aria-busy="true" aria-live="polite">
      {/* PageHero placeholder — short height. */}
      <section className="bg-white pt-[72px] sm:pt-[88px] md:pt-3 lg:pt-5">
        <div className="px-4 md:p-3 lg:p-5">
          <div className="relative w-full overflow-hidden rounded-2xl md:rounded-xl lg:rounded-2xl bg-ink/10 animate-pulse h-[44svh] min-h-[320px] sm:h-[50svh] md:h-[420px] lg:h-[480px]" />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Sticky rail placeholder. */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="h-3 w-16 bg-ink/10 rounded animate-pulse mb-4" />
              <ul className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-4 w-3/4 bg-ink/10 rounded animate-pulse"
                  />
                ))}
              </ul>
            </div>

            {/* Main column. */}
            <div className="lg:col-span-9">
              <div className="h-14 w-full bg-ink/10 rounded-full animate-pulse" />

              <div className="mt-12 md:mt-14 flex flex-col gap-14">
                {Array.from({ length: 2 }).map((_, gi) => (
                  <div key={gi}>
                    <div className="h-3 w-24 bg-ink/10 rounded animate-pulse" />
                    <div className="mt-4 h-9 md:h-10 w-2/3 bg-ink/10 rounded animate-pulse" />
                    <div className="mt-3 h-4 w-full max-w-md bg-ink/10 rounded animate-pulse" />
                    <ul className="mt-6 flex flex-col">
                      {Array.from({ length: 4 }).map((__, ii) => (
                        <li
                          key={ii}
                          className="border-t border-ink/10 last:border-b py-6 flex items-center gap-4"
                        >
                          <div className="h-4 w-6 bg-ink/10 rounded animate-pulse shrink-0" />
                          <div className="flex-1 h-5 bg-ink/10 rounded animate-pulse" />
                          <div className="h-9 w-9 rounded-full bg-ink/10 animate-pulse shrink-0" />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
