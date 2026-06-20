import Image from "next/image";

const facts = [
  { value: "498 m²", label: "Reception hall" },
  { value: "170", label: "Seated guests" },
  { value: "÷ 2", label: "Divisible halls" },
  { value: "Equipped", label: "Meeting rooms" },
];

export default function Events() {
  return (
    <section
      id="events"
      className="grain bg-ink text-white px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Copy */}
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/45 mb-4">
              Celebrations &amp; conferences
            </p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white text-balance">
              A 498 m² hall for the days that matter
            </h2>
            <span aria-hidden className="mt-6 block h-px w-14 bg-marine" />
            <p className="mt-7 font-sans font-normal text-[16px] leading-[1.75] text-white/70 max-w-xl">
              From weddings and engagements to seminars and conferences, Hôtel du
              Lac is one of Béjaïa&apos;s gathering places. Our reception hall
              seats up to 170 guests and divides into two for smaller occasions;
              our adaptable meeting rooms come equipped with projector,
              microphone, Wi-Fi and coffee-break service — every event met with
              bespoke catering, from a morning coffee break to a full dinner.
            </p>

            <dl className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 max-w-xl">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="font-display font-semibold text-[24px] leading-none tracking-tight text-white">
                    {f.value}
                  </dt>
                  <dd className="mt-2 font-sans text-[10px] uppercase tracking-[0.16em] text-white/45">
                    {f.label}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href="#contact"
              className="group/cta mt-10 inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-ink bg-cream rounded-full px-8 py-4 transition-colors duration-300 ease-out hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
            >
              Plan your event
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          {/* Image */}
          <div className="overflow-hidden">
            {/* TODO(demo): real photo of the 498 m² hall dressed for a wedding. */}
            <Image
              src="/images/exhibit-salon.jpg"
              alt="The 498 m² reception hall at Hôtel du Lac, dressed for an event"
              width={1200}
              height={1000}
              className="w-full aspect-[5/4] object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
