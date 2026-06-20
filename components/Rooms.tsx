import Image from "next/image";

type Room = {
  src: string;
  alt: string;
  name: string;
  description: string;
  sleeps: number;
  size: string;
  price: string;
};

const rooms: Room[] = [
  {
    src: "/images/exhibit-suite-dawn.jpg",
    alt: "The Riviera Suite at dawn",
    name: "The Riviera Suite",
    description:
      "Eastern light, the sea on the horizon, a small private terrace for early coffee.",
    sleeps: 2,
    size: "48m²",
    price: "€820",
  },
  {
    src: "/images/exhibit-guest-room.jpg",
    alt: "The Garden Room interior",
    name: "The Garden Room",
    description:
      "Quiet, low-slung, with shutters that open straight onto the citrus garden.",
    sleeps: 2,
    size: "28m²",
    price: "€380",
  },
  {
    src: "/images/exhibit-corner-suite.jpg",
    alt: "The Corner Suite interior",
    name: "The Corner Suite",
    description:
      "Two aspects of the coastline and a long reading bench beneath the window.",
    sleeps: 3,
    size: "56m²",
    price: "€1,040",
  },
];

export default function Rooms() {
  return (
    <section
      id="rooms"
      className="bg-white px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-12 md:mb-20 max-w-2xl">
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
            Rooms
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink">
            Where to stay the night
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {rooms.map((room) => (
            <article key={room.name} className="flex flex-col">
              <div className="overflow-hidden">
                <Image
                  src={room.src}
                  alt={room.alt}
                  width={900}
                  height={1100}
                  className="w-full aspect-[4/5] object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="font-display font-medium text-xl text-ink mt-6">
                {room.name}
              </h3>
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mt-2">
                Sleeps {room.sleeps} · {room.size}
              </p>
              <p className="font-sans text-[15px] text-graybase mt-3">
                {room.description}
              </p>
              <div className="flex items-end justify-between mt-6 pt-5 border-t border-ink/10">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-graybase">
                    From
                  </p>
                  <p className="font-display font-semibold text-xl text-ink mt-1">
                    {room.price}
                    <span className="font-sans text-[12px] font-normal text-graybase ml-1">
                      / night
                    </span>
                  </p>
                </div>
                <a
                  href="#contact"
                  className="group/cta inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-marine underline decoration-marine/30 decoration-1 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine rounded-sm"
                >
                  Reserve
                  <span
                    aria-hidden
                    className="inline-block transition-transform group-hover/cta:translate-x-0.5"
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
