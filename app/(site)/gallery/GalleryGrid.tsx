// Client-side gallery body. Owns the filter chip state, the bento grid, and
// mounts the Lightbox dialog. Lives next to the page so the route can stay
// a Server Component (and ship a metadata export).
//
// Bento grid layout:
//   mobile: 2-col uniform
//   tablet: 3-col with the occasional 2-col-spanning tile for visual rhythm
//   desktop: 4-col with deliberate 2-col / row-span tiles that break the grid
//     into editorial chunks

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import Lightbox, { type LightboxImage } from "@/components/site/Lightbox";
import { cn } from "@/lib/utils";

type Category = "rooms" | "restaurant" | "events" | "around";

type Tile = LightboxImage & {
  category: Category;
  /** Tailwind classes for grid spanning (column / row). */
  span?: string;
  /** Aspect ratio class — drives the tile's intrinsic height. */
  aspect?: string;
};

const tiles: Tile[] = [
  // ── Chambres ──────────────────────────────────────────────────────
  {
    src: "/images/exhibit-suite-dawn.jpg",
    alt: "Lumière de l'aube à travers la fenêtre de la Suite Senior",
    caption: "La Suite Senior, juste après le lever du soleil.",
    category: "rooms",
    span: "md:col-span-2 lg:col-span-2 lg:row-span-2",
    aspect: "aspect-[4/3] lg:aspect-square",
  },
  {
    src: "/images/exhibit-corner-suite.jpg",
    alt: "Le coin salon de la Suite Senior",
    caption: "Coin salon de la Suite Senior — 52 m² et une vue qui se suffit à elle-même.",
    category: "rooms",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/images/exhibit-guest-room.jpg",
    alt: "Une Chambre Double — Vue, la chambre que nos habitués demandent",
    caption: "Chambre Double — Vue. Le confort quotidien pour lequel les clients reviennent.",
    category: "rooms",
    aspect: "aspect-[4/5]",
  },

  // ── Restaurant ────────────────────────────────────────────────────
  {
    src: "/images/exhibit-dining-room.jpg",
    alt: "Le restaurant, dressé pour le service du soir",
    caption:
      "Le restaurant — « une carte d'excellence ouverte sur le monde ».",
    category: "restaurant",
    span: "lg:col-span-2",
    aspect: "aspect-[16/10] lg:aspect-[16/9]",
  },
  {
    src: "/images/activity-garden-breakfast.jpg",
    alt: "Fruits frais et viennoiseries du buffet petit-déjeuner",
    caption: "Petit-déjeuner — le repas dont nos clients parlent le plus, servi de 6h30 à 10h30.",
    category: "restaurant",
    aspect: "aspect-[4/5]",
  },

  // ── Salle et événements ───────────────────────────────────────────
  {
    src: "/images/exhibit-salon.jpg",
    alt: "La salle de 498 m², dressée pour une célébration en soirée",
    caption: "La salle de 498 m² — jusqu'à 170 convives assis, divisible pour les plus petites occasions.",
    category: "events",
    span: "md:col-span-2 lg:col-span-2",
    aspect: "aspect-[16/10] lg:aspect-[16/9]",
  },

  // ── Aux alentours ─────────────────────────────────────────────────
  {
    src: "/images/activity-cliff-path.jpg",
    alt: "Un sentier côtier sur les hauteurs",
    caption: "Parc naturel — à sept à quinze minutes en voiture.",
    category: "around",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/images/activity-sea-bathing.jpg",
    alt: "Une baigneuse sur l'une des plages de la côte",
    caption:
      "La côte — quelques plages à courte distance en voiture.",
    category: "around",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/images/exhibit-suite-dawn.jpg",
    alt: "La vue depuis une fenêtre de chambre au crépuscule",
    caption: "La vue au crépuscule — depuis les fenêtres de l'hôtel.",
    category: "around",
    span: "md:col-span-2",
    aspect: "aspect-[16/10]",
  },
];

const filters: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "rooms", label: "Chambres" },
  { id: "restaurant", label: "Restaurant" },
  { id: "events", label: "Salle et événements" },
  { id: "around", label: "Aux alentours" },
];

export default function GalleryGrid() {
  const [active, setActive] = useState<Category | "all">("all");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "all" ? tiles : tiles.filter((t) => t.category === active)),
    [active],
  );

  return (
    <>
      {/* Filter strip — radio-group pattern. Active = marine chip. */}
      <div
        role="radiogroup"
        aria-label="Filtrer la galerie"
        className="flex flex-wrap items-center gap-2 md:gap-2.5"
      >
        {filters.map((f) => {
          const isActive = active === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => {
                setActive(f.id);
                setOpenIdx(null);
              }}
              className={cn(
                "inline-flex items-center justify-center btn-text-sm md:btn-text-md rounded-full px-5 py-3 min-h-[44px] transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
                isActive
                  ? "bg-marine text-white border border-marine"
                  : "bg-white text-ink border border-ink/20 hover:border-ink/40",
              )}
            >
              {f.label}
            </button>
          );
        })}
        <span className="ml-auto font-sans text-[11px] uppercase tracking-[0.18em] text-ink/55">
          {filtered.length} image{filtered.length === 1 ? "" : "s"}
        </span>{/* image / images — French plural is identical */}
      </div>

      {/* Bento grid. Mobile: 2-col. Tablet: 3-col. Desktop: 4-col. */}
      {filtered.length > 0 ? (
        <ul className="mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 auto-rows-auto">
          {filtered.map((tile, i) => (
            <li key={`${tile.src}-${i}`} className={cn("relative", tile.span)}>
              <button
                type="button"
                onClick={() => setOpenIdx(i)}
                aria-label={`Ouvrir ${tile.alt}`}
                className={cn(
                  "group/tile relative block w-full h-full overflow-hidden bg-ink/5",
                  tile.aspect ?? "aspect-[4/5]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
                )}
              >
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-out group-hover/tile:scale-[1.04]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 ease-out group-hover/tile:bg-ink/15"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 font-sans text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ink/80 opacity-0 translate-y-1 transition-all duration-300 ease-out group-hover/tile:opacity-100 group-hover/tile:translate-y-0"
                >
                  {filters.find((f) => f.id === tile.category)?.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 border border-ink/10 bg-cream/40 rounded-2xl px-6 py-12 text-center">
          <p className="font-display text-[20px] md:text-[24px] text-ink leading-tight tracking-tight">
            Rien dans cette collection pour le moment.
          </p>
        </div>
      )}

      <Lightbox
        images={filtered}
        index={openIdx}
        onClose={() => setOpenIdx(null)}
        onChange={setOpenIdx}
      />
    </>
  );
}
