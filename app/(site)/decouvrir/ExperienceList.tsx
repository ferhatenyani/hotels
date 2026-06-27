// Sous-composant client pour /decouvrir — la rangée de filtres par catégorie
// + la grille d'expériences. Mobile : une colonne, tablette : 2 colonnes,
// desktop : 3 colonnes. Chaque carte renvoie vers /decouvrir pour l'instant
// (pas de page détail) afin de garder l'arborescence cohérente.

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Filter } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Experience } from "@/lib/data/experiences";

type Category = Experience["category"];

const categoryOrder: Category[] = ["Nature", "Patrimoine", "Côte", "À l'hôtel"];

type Props = {
  experiences: Experience[];
};

export default function ExperienceList({ experiences }: Props) {
  const [active, setActive] = useState<Category | "Tout">("Tout");

  // Only show category chips that actually exist in the data — keeps the row
  // honest if the data layer ever shrinks.
  const categories = useMemo<Category[]>(() => {
    const present = new Set(experiences.map((e) => e.category));
    return categoryOrder.filter((c) => present.has(c));
  }, [experiences]);

  const list = useMemo(
    () =>
      active === "Tout"
        ? experiences
        : experiences.filter((e) => e.category === active),
    [experiences, active],
  );

  return (
    <div>
      {/* Filter chip row. Scrollable on narrow viewports so the row never
          wraps awkwardly. */}
      <div
        role="tablist"
        aria-label="Filtrer par catégorie"
        className="
          flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4
          sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        "
      >
        <span className="hidden md:inline-flex items-center gap-2 mr-2 font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          <Filter className="h-3 w-3" strokeWidth={2} />
          Filtrer
        </span>
        <Chip
          active={active === "Tout"}
          onClick={() => setActive("Tout")}
          label="Tout"
          count={experiences.length}
        />
        {categories.map((c) => (
          <Chip
            key={c}
            active={active === c}
            onClick={() => setActive(c)}
            label={c}
            count={experiences.filter((e) => e.category === c).length}
          />
        ))}
      </div>

      {/* Grid. */}
      {list.length > 0 ? (
        <ul className="mt-7 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
          {list.map((e) => (
            <li key={e.slug} className="flex">
              <ExperienceCard experience={e} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 border border-ink/10 bg-white px-6 py-10 text-center">
          <p className="font-sans text-[14px] text-graybase">
            Rien dans cette catégorie pour le moment — la liste s'allonge avec le temps.
          </p>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] btn-text-sm transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine",
        active
          ? "bg-marine text-white border border-marine"
          : "bg-white text-ink border border-ink/20 hover:border-ink/40",
      )}
    >
      {label}
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 font-display tabular-nums text-[10px] tracking-tight",
          active
            ? "bg-white/20 text-white"
            : "bg-ink/[0.06] text-ink/55",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ExperienceCard({ experience: e }: { experience: Experience }) {
  return (
    <article className="group/card flex flex-col w-full bg-white border border-ink/10 overflow-hidden transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(21,19,22,0.28)] hover:border-ink/15">
      <div className="relative h-[200px] sm:h-[240px] md:h-[220px] lg:h-[240px] overflow-hidden">
        <Image
          src={e.image}
          alt={e.imageAlt}
          width={1200}
          height={900}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Travel time chip overlaid on the image. */}
        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 font-sans text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink leading-none shadow-sm">
          {e.travelTime}
        </span>
        <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-ink/80 backdrop-blur-sm text-white px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.18em] leading-none">
          {e.category}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5 md:p-7 lg:p-8">
        <h3 className="font-display font-medium text-[20px] md:text-[24px] leading-tight tracking-tight text-ink text-balance">
          {e.name}
        </h3>
        <p className="mt-3 font-sans italic text-[13.5px] md:text-[14px] leading-[1.6] text-marine">
          {e.tagline}
        </p>
        <p className="mt-4 font-sans font-normal text-[14px] md:text-[15px] leading-[1.65] md:leading-[1.7] text-graybase">
          {e.description}
        </p>
      </div>
    </article>
  );
}
