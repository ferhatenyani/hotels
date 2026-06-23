// /gallery loading skeleton — mirrors the PageHero and the bento grid below.
// Tiles use the same span / aspect rhythm as the real grid so the swap-in
// has no layout shift.

export default function GalleryLoading() {
  // A handful of representative span/aspect classes that mirror the grid.
  const placeholders = [
    "md:col-span-2 lg:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-square",
    "aspect-[4/5]",
    "aspect-[4/5]",
    "lg:col-span-2 aspect-[16/10] lg:aspect-[16/9]",
    "aspect-[4/5]",
    "md:col-span-2 lg:col-span-2 aspect-[16/10] lg:aspect-[16/9]",
    "aspect-[4/5]",
    "aspect-[4/5]",
    "md:col-span-2 aspect-[16/10]",
  ];

  return (
    <main className="bg-white" aria-busy="true" aria-live="polite">
      {/* PageHero placeholder — short height. */}
      <section className="bg-white pt-[72px] sm:pt-[88px] md:pt-3 lg:pt-5">
        <div className="px-4 md:p-3 lg:p-5">
          <div className="relative w-full overflow-hidden rounded-2xl md:rounded-xl lg:rounded-2xl bg-ink/10 animate-pulse h-[44svh] min-h-[320px] sm:h-[50svh] md:h-[420px] lg:h-[480px]" />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[120px]">
        <div className="max-w-[1440px] mx-auto">
          {/* Filter strip placeholder. */}
          <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-11 w-24 bg-ink/10 rounded-full animate-pulse"
              />
            ))}
          </div>

          {/* Bento grid placeholder. */}
          <ul className="mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
            {placeholders.map((cls, i) => (
              <li key={i} className={cls.split(" ").filter((c) => c.includes("col-span") || c.includes("row-span")).join(" ") || ""}>
                <div className={`bg-ink/10 animate-pulse ${cls}`} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
