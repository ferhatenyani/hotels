const stats = [
  { value: "124", label: "Rooms & suites" },
  { value: "4.3★", label: "From 410 reviews" },
  { value: "498 m²", label: "Events hall" },
  { value: "Lac Mézaïa", label: "At the doorstep" },
];

export default function About() {
  return (
    <section
      id="about"
      className="bg-white px-4 sm:px-6 lg:px-10 py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Stat band — a full-width row of figures with hairline separators
            (gap-px reveals the container colour between cells). */}
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden border-y border-ink/10 bg-ink/10">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-9 md:py-14 text-center">
              <dt className="font-display font-medium text-[30px] md:text-[40px] leading-none tracking-tight text-ink">
                {s.value}
              </dt>
              <dd className="mt-3 font-sans text-[11px] uppercase tracking-[0.18em] text-ink/50">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
