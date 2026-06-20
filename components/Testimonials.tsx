// Real guest reviews drawn from public sources (Google, Expedia/ZenHotels pool,
// TripAdvisor). Lightly tidied for length; attributions kept to platform/source
// for privacy. Nothing here is invented.
const testimonials = [
  {
    quote:
      "My highlight is definitely the breakfast — fresh fruits and good pastries!",
    source: "Guest review · Expedia pool",
  },
  {
    quote:
      "Super hotel, very clean, very comfortable room — exactly as in the photos, and a hearty breakfast.",
    source: "Guest review · Google",
  },
  {
    quote:
      "L'emplacement de l'hôtel est parfait, proche de tout.",
    translation: "The location is perfect, close to everything.",
    source: "Avis client · Google",
  },
  {
    quote:
      "L'accueil était chaleureux, le personnel très professionnel… Je reviendrai avec grand plaisir.",
    translation:
      "A warm welcome, a very professional team… I'll gladly return.",
    source: "Avis client · Google",
  },
  {
    quote: "Well located, family-run hotel, and very quiet.",
    source: "Guest review · TripAdvisor",
  },
  {
    quote: "Impeccable cleanliness, friendly staff.",
    source: "Guest review · Google",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-white px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-14 md:mb-20 max-w-2xl">
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
            Guest voices
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink text-balance">
            What guests remember
          </h2>
          <p className="mt-6 font-sans font-normal text-[15px] leading-[1.7] text-graybase">
            Rated 4.3 out of 5 across more than 400 guest reviews — most often
            for the breakfast, the cleanliness and the location.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t) => (
            <li
              key={t.quote}
              className="flex flex-col border border-ink/10 p-7 md:p-8"
            >
              <span
                aria-hidden
                className="font-display text-[40px] leading-none text-marine/30"
              >
                &ldquo;
              </span>
              <blockquote className="mt-2 flex-1 font-sans font-normal text-[16px] leading-[1.7] text-ink">
                {t.quote}
              </blockquote>
              {t.translation ? (
                <p className="mt-3 font-sans text-[13px] italic leading-[1.6] text-graybase">
                  {t.translation}
                </p>
              ) : null}
              <p className="mt-6 pt-4 border-t border-ink/10 font-sans text-[10px] uppercase tracking-[0.2em] text-ink/55">
                {t.source}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
