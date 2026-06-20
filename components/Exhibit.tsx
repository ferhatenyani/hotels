import Image from "next/image";

type Tile = {
  src: string;
  alt: string;
  w: number;
  h: number;
  /**
   * Tailwind classes for size + optional `row-span-2`. Tiles without span
   * take a single row (230px tall); tiles with `row-span-2` fill both rows
   * of the grid column (230 + gap-6 + 230 = 484px tall).
   */
  classes: string;
};

// Single bento grid laid out column-by-column via `grid-flow-col` +
// `grid-rows-2`. Pattern is T S S T S where T = tall (one tile spanning
// both rows) and S = stacked pair (two tiles, one per row). Column widths
// vary deliberately so no two adjacent columns share a rhythm.
const tiles: Tile[] = [
  // Col 1 — tall portrait
  {
    src: "/images/exhibit-suite-dawn.jpg",
    alt: "Hotel suite at dawn",
    w: 300,
    h: 484,
    classes: "w-[300px] h-[484px] row-span-2",
  },
  // Col 2 — wide landscape stack
  {
    src: "/images/exhibit-terrace-pool.jpg",
    alt: "The terrace pool",
    w: 440,
    h: 230,
    classes: "w-[440px] h-[230px]",
  },
  {
    src: "/images/exhibit-spa.jpg",
    alt: "The spa",
    w: 440,
    h: 230,
    classes: "w-[440px] h-[230px]",
  },
  // Col 3 — tighter landscape stack
  {
    src: "/images/exhibit-salon.jpg",
    alt: "The salon",
    w: 320,
    h: 230,
    classes: "w-[320px] h-[230px]",
  },
  {
    src: "/images/exhibit-guest-room.jpg",
    alt: "A guest room",
    w: 320,
    h: 230,
    classes: "w-[320px] h-[230px]",
  },
  // Col 4 — tall portrait
  {
    src: "/images/exhibit-dining-room.jpg",
    alt: "The dining room",
    w: 280,
    h: 484,
    classes: "w-[280px] h-[484px] row-span-2",
  },
  // Col 5 — landscape stack
  {
    src: "/images/exhibit-saltwater-pool.jpg",
    alt: "The saltwater pool",
    w: 400,
    h: 230,
    classes: "w-[400px] h-[230px]",
  },
  {
    src: "/images/exhibit-corner-suite.jpg",
    alt: "The corner suite",
    w: 400,
    h: 230,
    classes: "w-[400px] h-[230px]",
  },
];

export default function Exhibit() {
  // Duplicated once so the marquee can loop seamlessly via translateX(-50%).
  // The duplicate continues the same T S S T S column pattern, so the bento
  // rhythm reads as one continuous grid rather than a restart at the seam.
  const grid = [...tiles, ...tiles];

  return (
    <section
      id="exhibit"
      className="relative overflow-x-clip bg-white py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pb-10 md:pb-14">
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
          A look around
        </p>
        <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink max-w-2xl">
          Spaces and quiet corners
        </h2>
      </div>

      <div className="marquee-mask">
        <div
          className="grid grid-flow-col grid-rows-2 auto-cols-max gap-6 px-4 sm:px-6 w-max animate-marquee hover:[animation-play-state:paused] will-change-transform"
        >
          {grid.map((tile, i) => (
            <div
              key={`${tile.src}-${i}`}
              className={`overflow-hidden ${tile.classes}`}
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
      </div>
    </section>
  );
}
