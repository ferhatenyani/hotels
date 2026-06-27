// Client-side FAQ body. Owns the search filter, the accordion state, and
// the sticky group nav rail on lg+. Uses native <details>/<summary> for the
// expand mechanic — zero-dep, fully accessible, and visually customised
// with a rotating chevron and a marine left rule.
//
// Filter: a single search input across q + a text. Filtered groups whose
// items all hide are themselves hidden. Default state: first group's first
// item is open; everything else closed.

"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { faqGroups } from "@/lib/data/faq";

export default function FAQAccordion() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>(slugify(faqGroups[0].title));
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  // Pre-compute the filtered shape so groups whose items all hide are also
  // hidden, and so the rail can list only what's visible.
  const filteredGroups = useMemo(() => {
    if (!hasQuery) return faqGroups.map((g) => ({ group: g, items: g.items }));
    return faqGroups
      .map((g) => ({
        group: g,
        items: g.items.filter(
          (it) =>
            it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q),
        ),
      }))
      .filter(({ items }) => items.length > 0);
  }, [q, hasQuery]);

  const totalMatches = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

  // Sticky-rail observer — highlights the active group as the user scrolls.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the group whose top crosses just under the navbar — i.e. the
        // entry closest to the top with positive boundingClientRect.top will
        // be the "next" one; we want the one just above that.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) setActiveGroup(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: 0 },
    );
    Object.values(groupRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filteredGroups.length]);

  const scrollToGroup = (slug: string) => {
    const el = groupRefs.current[slug];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      {/* ── Sticky rail (lg+) ─────────────────────────────────────────── */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24">
          <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60 mb-4">
            Aller à
          </p>
          <ul className="flex flex-col gap-1">
            {filteredGroups.map(({ group }) => {
              const slug = slugify(group.title);
              const isActive = activeGroup === slug;
              return (
                <li key={slug}>
                  <button
                    type="button"
                    onClick={() => scrollToGroup(slug)}
                    className={cn(
                      "group/jump w-full text-left flex items-start gap-3 py-2.5 pr-2 rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
                      isActive
                        ? "text-ink"
                        : "text-ink/55 hover:text-ink",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-2 h-px w-4 shrink-0 transition-all duration-300",
                        isActive
                          ? "bg-marine w-6"
                          : "bg-ink/25 group-hover/jump:bg-ink/45",
                      )}
                    />
                    <span className="font-sans text-[13px] leading-[1.4]">
                      {group.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────────────────────── */}
      <div className="lg:col-span-9">
        {/* Search — text-[16px] to avoid iOS auto-zoom. */}
        <div className="relative">
          <Search
            aria-hidden
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans les réponses — essayez « petit-déjeuner », « parking », « arrivée »…"
            aria-label="Rechercher dans la FAQ"
            className="w-full font-sans text-[16px] text-ink placeholder:text-ink/40 bg-cream/40 border border-ink/10 rounded-full pl-11 pr-12 py-4 min-h-[56px] outline-none transition-colors focus:border-marine/40 focus:bg-white"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/55 hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
        {hasQuery && (
          <p className="mt-3 font-sans text-[12px] uppercase tracking-[0.2em] text-ink/55">
            {totalMatches} {totalMatches === 1 ? "réponse" : "réponses"} pour{" "}
            <span className="text-ink">&laquo;&nbsp;{query}&nbsp;&raquo;</span>
          </p>
        )}

        {/* Groups */}
        {filteredGroups.length > 0 ? (
          <div className="mt-10 md:mt-14 flex flex-col gap-12 md:gap-16">
            {filteredGroups.map(({ group, items }, gi) => {
              const slug = slugify(group.title);
              return (
                <div
                  key={slug}
                  id={slug}
                  ref={(el) => {
                    groupRefs.current[slug] = el;
                  }}
                  className="scroll-mt-24"
                >
                  <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
                    Groupe · {String(gi + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-display font-medium text-[26px] xs:text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.1] tracking-tight text-ink text-balance">
                    {group.title}
                  </h2>
                  <p className="mt-4 font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase max-w-[60ch]">
                    {group.blurb}
                  </p>

                  <ul className="mt-6 md:mt-8 flex flex-col">
                    {items.map((item, ii) => (
                      <li key={item.q} className="border-t border-ink/10 last:border-b">
                        <details
                          // First item of the first visible group opens by
                          // default; everything else stays closed. When the
                          // user is searching, open every item that survives
                          // the filter so they see the matches at a glance.
                          // Key includes hasQuery so the element remounts when
                          // entering/leaving search mode and the `open` prop
                          // is honoured (React doesn't re-set <details open>
                          // after the first mount).
                          key={`${item.q}-${hasQuery ? "s" : "b"}`}
                          open={hasQuery || (gi === 0 && ii === 0)}
                          className="group/q"
                        >
                          <summary className="flex items-start gap-4 cursor-pointer list-none py-5 md:py-6 min-h-[56px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine">
                            <span
                              aria-hidden
                              className="font-display text-[12px] tabular-nums text-marine pt-1 tracking-tight shrink-0"
                            >
                              {String(ii + 1).padStart(2, "0")}
                            </span>
                            <span className="flex-1 font-display font-medium text-[17px] md:text-[19px] leading-[1.35] text-ink pr-3">
                              {item.q}
                            </span>
                            <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/55 transition-all duration-300 ease-out group-open/q:rotate-180 group-open/q:bg-marine group-open/q:border-marine group-open/q:text-white">
                              <ChevronDown
                                className="h-4 w-4"
                                strokeWidth={1.75}
                              />
                            </span>
                          </summary>
                          <div className="pb-6 md:pb-8 pl-9 pr-12">
                            <p className="font-sans text-[15px] md:text-[16px] leading-[1.75] text-graybase">
                              {item.a}
                            </p>
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 md:mt-14 border border-ink/10 bg-cream/40 rounded-2xl px-6 py-10 md:px-10 md:py-14 text-center">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              Aucun résultat
            </p>
            <p className="mt-3 font-display text-[22px] md:text-[26px] text-ink leading-tight tracking-tight max-w-[40ch] mx-auto text-balance">
              Nous n&apos;avons pas de réponse à cela ici. Écrivez-nous un mot — nous préférons ne pas deviner.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-6 inline-flex items-center justify-center btn-text-sm text-ink border border-ink/30 rounded-full px-5 py-3 min-h-[44px] transition-colors duration-300 ease-out hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              Effacer la recherche
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
