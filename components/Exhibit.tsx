import Image from "next/image";

type Tile = {
  src: string;
  alt: string;
  w: number;
  h: number;
  /** Tailwind classes describing the bento cell size + vertical translate. */
  classes: string;
};

const tiles: Tile[] = [
  {
    src: "/images/exhibit-suite-dawn.jpg",
    alt: "Hotel suite at dawn",
    w: 240,
    h: 340,
    classes: "w-[240px] h-[340px] -translate-y-6",
  },
  {
    src: "/images/exhibit-terrace-pool.jpg",
    alt: "The terrace pool",
    w: 440,
    h: 300,
    classes: "w-[440px] h-[300px] translate-y-8",
  },
  {
    src: "/images/exhibit-dining-room.jpg",
    alt: "The dining room",
    w: 280,
    h: 400,
    classes: "w-[280px] h-[400px] -translate-y-10",
  },
  {
    src: "/images/exhibit-spa.jpg",
    alt: "The spa",
    w: 360,
    h: 260,
    classes: "w-[360px] h-[260px] translate-y-4",
  },
  {
    src: "/images/exhibit-guest-room.jpg",
    alt: "A guest room",
    w: 260,
    h: 360,
    classes: "w-[260px] h-[360px] -translate-y-4",
  },
  {
    src: "/images/exhibit-saltwater-pool.jpg",
    alt: "The saltwater pool",
    w: 420,
    h: 290,
    classes: "w-[420px] h-[290px] translate-y-10",
  },
  {
    src: "/images/exhibit-salon.jpg",
    alt: "The salon",
    w: 250,
    h: 330,
    classes: "w-[250px] h-[330px] -translate-y-8",
  },
  {
    src: "/images/exhibit-corner-suite.jpg",
    alt: "The corner suite",
    w: 400,
    h: 270,
    classes: "w-[400px] h-[270px] translate-y-6",
  },
];

export default function Exhibit() {
  // Strip is duplicated so the marquee can loop seamlessly via translateX(-50%).
  const strip = [...tiles, ...tiles];

  return (
    <section
      id="exhibit"
      className="relative z-10 -mt-10 sm:-mt-16 lg:-mt-24 overflow-x-clip bg-white pb-20 md:pb-[120px]"
    >
      <div className="flex w-max gap-4 sm:gap-6 px-4 sm:px-6 animate-marquee hover:[animation-play-state:paused] will-change-transform">
        {strip.map((tile, i) => (
          <div
            key={`${tile.src}-${i}`}
            className={`shrink-0 ${tile.classes}`}
            // Hide the duplicated set from assistive tech to avoid double announcement.
            aria-hidden={i >= tiles.length ? true : undefined}
          >
            <Image
              src={tile.src}
              alt={tile.alt}
              width={tile.w}
              height={tile.h}
              className="w-full h-full object-cover"
              sizes="(max-width: 640px) 70vw, 30vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
