// /rooms/[slug] loading skeleton — same shape as the detail page below the
// hero, so the layout doesn't shift when the room data arrives.

export default function RoomDetailLoading() {
  return (
    <main className="bg-white pb-24 md:pb-0" aria-busy="true" aria-live="polite">
      {/* PageHero placeholder */}
      <section className="bg-white pt-[72px] sm:pt-[88px] md:pt-3 lg:pt-5">
        <div className="px-4 md:p-3 lg:p-5">
          <div className="relative w-full overflow-hidden rounded-2xl md:rounded-xl lg:rounded-2xl bg-ink/10 animate-pulse h-[56svh] min-h-[380px] sm:h-[60svh] md:h-[520px] lg:h-[600px]" />
        </div>
      </section>

      {/* Breadcrumb placeholder */}
      <section className="px-4 sm:px-6 lg:px-10 py-6 md:py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="h-3 w-40 bg-ink/10 rounded animate-pulse" />
        </div>
      </section>

      {/* Body: 2-col grid */}
      <section className="px-4 sm:px-6 lg:px-10 pb-14 md:pb-20 lg:pb-[120px]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* LEFT */}
          <div className="lg:col-span-2 min-w-0">
            {/* Gallery placeholder: hero + 2-col */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
              <div className="md:col-span-2 aspect-[16/9] rounded-2xl bg-ink/10 animate-pulse" />
              <div className="aspect-[4/3] rounded-2xl bg-ink/10 animate-pulse" />
              <div className="aspect-[4/3] rounded-2xl bg-ink/10 animate-pulse" />
            </div>

            {/* About */}
            <div className="mt-10 md:mt-14">
              <div className="h-3 w-32 bg-ink/10 rounded animate-pulse" />
              <div className="mt-4 h-8 md:h-10 w-3/4 bg-ink/10 rounded animate-pulse" />
              <div className="mt-5 h-px w-14 bg-marine/40" />
              <div className="mt-6 space-y-2.5 max-w-[64ch]">
                <div className="h-4 w-full bg-ink/10 rounded animate-pulse" />
                <div className="h-4 w-11/12 bg-ink/10 rounded animate-pulse" />
                <div className="h-4 w-10/12 bg-ink/10 rounded animate-pulse" />
                <div className="h-4 w-9/12 bg-ink/10 rounded animate-pulse" />
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-10 md:mt-14">
              <div className="h-3 w-28 bg-ink/10 rounded animate-pulse" />
              <div className="mt-4 h-6 md:h-8 w-1/2 bg-ink/10 rounded animate-pulse" />
              <div className="mt-5 h-px w-10 bg-marine/40" />
              <ul className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-5 bg-ink/10 rounded animate-pulse"
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-1 self-start">
            <div className="border border-ink/10 rounded-2xl bg-white p-5 md:p-6 space-y-4">
              <div className="h-3 w-12 bg-ink/10 rounded animate-pulse" />
              <div className="h-8 w-2/3 bg-ink/10 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-ink/10 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-ink/10 rounded-lg animate-pulse" />
                <div className="h-12 bg-ink/10 rounded-lg animate-pulse" />
              </div>
              <div className="h-12 bg-ink/10 rounded animate-pulse" />
              <div className="h-12 bg-ink/10 rounded animate-pulse" />
              <div className="h-12 bg-marine/30 rounded-full animate-pulse" />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
