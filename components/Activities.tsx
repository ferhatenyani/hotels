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
        <div className="mb-12 md:mb-20 max-w-2xl">
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
            Things to do
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink">
            Activities around the house
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {activities.map((a) => (
            <article key={a.name} className="flex flex-col">
              <Image
                src={a.src}
                alt={a.alt}
                width={1000}
                height={700}
                className="w-full aspect-[4/3] object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <h3 className="font-display font-medium text-xl text-ink mt-6">
                {a.name}
              </h3>
              <p className="font-sans text-[15px] text-graybase mt-2">
                {a.description}
              </p>
              <div className="flex items-center justify-between mt-6">
                <span className="font-sans text-[13px] text-graybase">
                  {a.duration} · {a.price}
                </span>
                <a
                  href="#contact"
                  className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent"
                >
                  Reserve →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
