"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { gsap } from "gsap";

import NavbarCentered from "./NavbarCentered";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const personOptions = Array.from({ length: 10 }, (_, i) => i + 1);

// Shared field surface — sits flush inside the white pill bar with no border
// of its own. The vertical dividers between fields are drawn on the wrapper
// divs. `!h-16` is needed for the shadcn SelectTrigger because its
// `data-[size=default]:h-8` rule outweighs an unsuffixed `h-16` on specificity.
const fieldTrigger =
  "relative !h-16 w-full px-5 bg-transparent text-left flex flex-col items-start justify-center gap-0.5 font-sans transition-colors hover:bg-ink/[0.035] focus-visible:bg-ink/[0.05] focus-visible:outline-none";

const fieldLabel =
  "text-[10px] uppercase tracking-[0.2em] text-ink/55 font-sans leading-none";

const fieldValueBase = "text-[14px] font-sans leading-tight truncate";

// Pure-ink CTA. Slightly lifted on hover with a hint of bronze warmth; ink/90
// over the white bar's edge reads as a softer black, not a different colour.
const ctaButton =
  "h-16 w-full md:w-56 inline-flex items-center justify-center gap-2 bg-ink text-white font-sans text-[14px] font-medium tracking-[0.04em] transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// Refined-ledger calendar overrides. The classNames are spread last inside
// shadcn's Calendar so these win over the defaults; --cell-size sets each
// day cell to 36 px — compact, still touch-friendly.
const calendarClassNames = {
  caption_label: "font-display text-[13px] font-medium select-none",
  weekday:
    "flex-1 text-[10px] uppercase tracking-[0.2em] font-medium text-ink/55 select-none",
  day_button:
    "h-(--cell-size) w-full select-none rounded-md text-[13px] hover:bg-ink/[0.05] data-[selected-single=true]:bg-ink data-[selected-single=true]:text-white data-[selected-single=true]:hover:bg-ink",
} as const;

// Editorial-ledger row: Quicksand numeral on the left, small-caps label on
// the right. Selected state mirrors the calendar's selected day (ink fill +
// white text); `[&>span.absolute]:hidden` removes shadcn's default check icon
// since the ink fill already makes selection unmistakable.
const selectItemBase =
  "group/item flex w-full items-center rounded-md px-3 py-2.5 transition-colors cursor-pointer [&>span.absolute]:hidden";

export default function Hero() {
  const [persons, setPersons] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Desktop-only video parallax. mm.add gates by media query and tears
      // down its triggers when the query no longer matches.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (pointer: fine)", () => {
        if (!videoRef.current || !sectionRef.current) return;
        gsap.to(videoRef.current, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const personsNum = persons ? Number.parseInt(persons, 10) : 0;
  const personsLabel = persons
    ? `${persons} ${personsNum === 1 ? "guest" : "guests"}`
    : "Add guests";

  return (
    <>
      <section
        ref={sectionRef}
        id="top"
        className="bg-white h-[100dvh] flex flex-col"
      >
        <h1 className="sr-only">
          Maison Dorée — coastal hotel in Saint-Jean-Cap-Ferrat
        </h1>
        <NavbarCentered />

        <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-5 pb-3 sm:pb-4 lg:pb-5">
          <div className="flex-1 relative w-full overflow-hidden rounded-2xl bg-ink min-h-0 shadow-[0_30px_80px_-30px_rgba(21,19,22,0.35)]">
            <video
              ref={videoRef}
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/images/hero-poster.jpg"
            >
              <source
                src="/hero/12693444_1920_1080_60fps.mp4"
                type="video/mp4"
              />
            </video>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/5 to-ink/45"
            />

            {/* Reservation bar — solid white pill with vertical hairlines
                between fields. CTA at the right end carries the colour and
                sits on a deliberately uneven, narrower width. */}
            <div className="absolute left-1/2 bottom-6 sm:bottom-10 w-[94%] sm:w-[88%] lg:w-[80%] max-w-[1180px] -translate-x-1/2 rounded-2xl bg-white border border-ink/10 shadow-[0_18px_40px_-12px_rgba(21,19,22,0.25)] overflow-hidden">
              <form
                onSubmit={(e) => e.preventDefault()}
                aria-label="Check availability"
                className="flex flex-col md:flex-row md:items-stretch"
              >
                {/* Guests */}
                <div className="flex-1 md:border-r border-ink/10">
                  <Select
                    value={persons}
                    onValueChange={(v) => v && setPersons(v)}
                  >
                    <SelectTrigger
                      aria-label="Number of guests"
                      className={cn(
                        fieldTrigger,
                        "[&_svg]:absolute [&_svg]:right-5 [&_svg]:top-1/2 [&_svg]:-translate-y-1/2 [&_svg]:text-ink/55",
                      )}
                    >
                      <span className={fieldLabel}>Guests</span>
                      <span
                        className={cn(
                          fieldValueBase,
                          persons ? "text-ink font-medium" : "text-ink/65",
                        )}
                      >
                        {personsLabel}
                      </span>
                    </SelectTrigger>
                    <SelectContent
                      side="top"
                      align="start"
                      sideOffset={10}
                      alignItemWithTrigger={false}
                      className="min-w-[--anchor-width] min-h-[280px] max-h-[280px] p-1.5 scroll-dark"
                    >
                      {personOptions.map((n) => {
                        const isSelected = persons === String(n);
                        return (
                          <SelectItem
                            key={n}
                            value={String(n)}
                            className={cn(
                              selectItemBase,
                              isSelected
                                ? "bg-ink text-white"
                                : "text-ink hover:bg-ink/[0.04] data-[highlighted]:bg-ink/[0.04]",
                            )}
                          >
                            <span className="flex w-full items-center justify-between">
                              <span className="font-display text-[18px] font-semibold leading-none tracking-tight">
                                {n}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] uppercase tracking-[0.22em] leading-none font-medium",
                                  isSelected ? "text-white/75" : "text-ink/55",
                                )}
                              >
                                {n === 1 ? "guest" : "guests"}
                              </span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Check-in */}
                <div className="flex-1 border-t md:border-t-0 md:border-r border-ink/10">
                  <DateField
                    label="Check-in"
                    placeholder="Add date"
                    value={checkIn}
                    onSelect={setCheckIn}
                  />
                </div>

                {/* Check-out */}
                <div className="flex-1 border-t md:border-t-0 md:border-r border-ink/10">
                  <DateField
                    label="Check-out"
                    placeholder="Add date"
                    value={checkOut}
                    onSelect={setCheckOut}
                  />
                </div>

                {/* CTA — narrower than the field columns on desktop so the
                    grid reads as 3+1 rather than 4 equal cells. */}
                <button
                  type="submit"
                  className={cn(ctaButton, "border-t border-ink/10 md:border-t-0")}
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function DateField({
  label,
  placeholder,
  value,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger aria-label={label} className={fieldTrigger}>
        <span className={fieldLabel}>{label}</span>
        <span
          className={cn(
            fieldValueBase,
            value ? "text-ink font-medium" : "text-ink/65",
          )}
        >
          {value ? format(value, "MMM d, yyyy") : placeholder}
        </span>
        <CalendarIcon className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/55" />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={10}
        className="w-auto p-0"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onSelect}
          className="[--cell-size:--spacing(9)] p-2"
          classNames={calendarClassNames}
        />
      </PopoverContent>
    </Popover>
  );
}
