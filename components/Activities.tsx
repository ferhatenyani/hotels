import Image from "next/image";

type Activity = {
  src: string;
  alt: string;
  name: string;
  description: string;
  duration: string;
  price: string;
};

const activities: Activity[] = [
  {
    src: "/images/activity-sea-bathing.jpg",
    alt: "Sea bathing off the rocks",
    name: "Sea Bathing",
    description: "Saltwater swims off the private rock terrace.",
    duration: "2 hrs",
    price: "€40",
  },
  {
    src: "/images/activity-vineyard-walk.jpg",
    alt: "A walk through the coastal terraces",
    name: "Vineyard Walk",
    description: "A guided morning through the coastal terraces.",
    duration: "Half day",
    price: "€120",
  },
  {
    src: "/images/activity-hammam.jpg",
    alt: "The hammam ritual",
    name: "Hammam Ritual",
    description: "Steam, cold plunge and oil, taken in silence.",
    duration: "90 min",
    price: "€180",
  },
  {
    src: "/images/activity-sunset-sailing.jpg",
    alt: "A sloop along the cape",
    name: "Sunset Sailing",
    description: "A wooden sloop along the cape at golden hour.",
    duration: "3 hrs",
    price: "€260",
  },
  {
    src: "/images/activity-garden-breakfast.jpg",
    alt: "Breakfast in the garden",
    name: "Garden Breakfast",
    description: "A slow table among the citrus and herbs.",
    duration: "1 hr",
    price: "€55",
  },
  {
    src: "/images/activity-cliff-path.jpg",
    alt: "The customs path to the lighthouse",
    name: "Cliff Path Hike",
    description: "The old customs trail out to the lighthouse.",
    duration: "Half day",
    price: "€70",
  },
];

export default function Activities() {
  return (
    <section
      id="activities"
      className="bg-white px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-14 md:mb-20 max-w-2xl">
          <div className="inline-flex items-center gap-3 mb-4">
            <span aria-hidden className="h-px w-8 bg-marine" />
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase">
              Things to do
            </p>
          </div>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink text-balance">
            Activities around the house
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 md:gap-x-12 lg:gap-x-14 gap-y-14 md:gap-y-20">
          {activities.map((a) => (
            <article key={a.name} className="group/card flex flex-col">
              <div className="overflow-hidden">
                <Image
                  src={a.src}
                  alt={a.alt}
                  width={1200}
                  height={900}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center justify-between gap-5 pt-6">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink/55 inline-flex items-center gap-2">
                    <span>{a.duration}</span>
                    <span
                      aria-hidden
                      className="h-[3px] w-[3px] rounded-full bg-ink/35"
                    />
                    <span>{a.price}</span>
                  </p>
                  <h3 className="font-display font-semibold text-[22px] md:text-[24px] leading-tight tracking-tight text-ink mt-3 transition-colors duration-300 ease-out group-hover/card:text-marine">
                    {a.name}
                  </h3>
                  <p className="font-sans font-normal text-[15px] leading-[1.7] text-graybase mt-3">
                    {a.description}
                  </p>
                </div>
                <a
                  href="#contact"
                  aria-label={`Reserve ${a.name}`}
                  className="group/cta shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border border-ink/25 text-ink transition-colors duration-300 ease-out hover:bg-marine hover:border-marine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
                >
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
                  >
                    →
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
