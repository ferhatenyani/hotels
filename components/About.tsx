const stats = [
  { value: "124", label: "Rooms & suites" },
  { value: "4.3★", label: "From 410 reviews" },
  { value: "498 m²", label: "Events hall" },
  { value: "Lac Mézaïa", label: "At the doorstep" },
];

const amenities = [
  "Free private parking",
  "24-hour reception",
  "Free Wi-Fi throughout",
  "Air-conditioned rooms",
  "Restaurant & cafeteria",
  "Breakfast included",
  "Room service",
  "Multilingual team (AR · FR · EN)",
];

export default function About() {
  return (
    <section
      id="about"
      className="bg-white px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Heading */}
        <div className="max-w-3xl">
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
            The house on the lake
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink text-balance">
            Quiet, central, and yours for the stay
          </h2>
          <span aria-hidden className="mt-6 block h-px w-14 bg-marine" />
        </div>

        {/* Body — two editorial columns */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-5 max-w-4xl">
          <p className="font-sans font-normal text-[16px] leading-[1.8] text-graybase">
            Hôtel du Lac sits in the Aamriou district, in the very heart of
            Béjaïa, with the rare calm of a lake at its doorstep. One hundred and
            twenty-four modern rooms look out over Lac Mézaïa and the green
            slopes of Gouraya — close to the seafront, the market and the old
            town, yet held a step apart from the noise.
          </p>
          <p className="font-sans font-normal text-[16px] leading-[1.8] text-graybase">
            For business or for family, the promise is the same: clean,
            comfortable and calm, with a warm welcome at any hour. Rated 4.3 / 5
            by more than 400 guests — most often for the breakfast, the
            cleanliness, and a location that puts all of Béjaïa within reach.
          </p>
        </div>

        {/* Stat strip — a full-width editorial band with hairline separators
            (gap-px reveals the container colour between cells), replacing the
            old floating 2×2 panel. */}
        <dl className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden border-y border-ink/10 bg-ink/10">
          {stats.map((s) => (
            <div key={s.label} className="bg-white py-8 md:py-10">
              <dt className="font-display font-medium text-[28px] md:text-[34px] leading-none tracking-tight text-ink">
                {s.value}
              </dt>
              <dd className="mt-3 font-sans text-[11px] uppercase tracking-[0.18em] text-ink/50">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>

        {/* Amenities */}
        <div className="mt-14 md:mt-16">
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-5">
            Everything you need
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-3">
            {amenities.map((a) => (
              <li
                key={a}
                className="font-sans text-[13px] text-ink/80 border border-ink/15 rounded-full px-4 py-2"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
