import { Fragment } from "react";

const stats = [
  { value: "4.3", label: "Guest rating", stars: true },
  { value: "124", label: "Rooms & suites" },
  { value: "498 m²", label: "Events hall" },
  { value: "Lac Mézaïa", label: "On the lakefront" },
];

// 86% fill ≈ 4.3 / 5 — a clipped green layer over muted base stars.
function Stars() {
  return (
    <span
      className="relative inline-flex text-[13px] leading-none tracking-[0.1em] select-none"
      aria-hidden
    >
      <span className="text-ink/15">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden text-marine"
        style={{ width: "86%" }}
      >
        ★★★★★
      </span>
    </span>
  );
}

export default function About() {
  return (
    <section
      id="about"
      className="bg-white px-4 sm:px-6 lg:px-10 py-8 md:py-12"
    >
      <div className="max-w-[1100px] mx-auto border-y border-ink/10">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-7 py-9 md:py-11">
          {stats.map((s, i) => (
            <Fragment key={s.label}>
              {i > 0 && (
                <li
                  aria-hidden
                  className="hidden sm:block h-9 w-px bg-marine/20"
                />
              )}
              <li className="text-center">
                <div className="flex items-center justify-center gap-2.5">
                  <span className="font-display font-medium text-[30px] md:text-[34px] leading-none tracking-tight text-ink">
                    {s.value}
                  </span>
                  {s.stars ? <Stars /> : null}
                </div>
                <p className="mt-2.5 font-sans text-[11px] uppercase tracking-[0.18em] text-ink/55">
                  {s.label}
                </p>
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}
