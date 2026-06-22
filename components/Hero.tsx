"use client";

import { useEffect, useRef, useState } from "react";
import { format, differenceInCalendarDays, startOfToday } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  CalendarDays,
  Users,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";
import { gsap } from "gsap";

import NavbarCentered from "./NavbarCentered";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Field surface shared by the Guests and Dates triggers. Sits flush inside the
// white pill; dividers are drawn by the form's `divide` utilities.
const fieldShell =
  "group/field relative flex h-[72px] max-md:h-[60px] w-full flex-col items-start justify-center gap-1 px-5 max-md:px-4 text-left transition-colors hover:bg-ink/[0.025] focus-visible:outline-none focus-visible:bg-ink/[0.04]";
const fieldLabel =
  "flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink/45 font-medium leading-none";
const fieldValue = "text-[15px] leading-tight truncate font-sans";

const calendarClassNames = {
  caption_label:
    "font-display text-[15px] font-medium tracking-tight select-none",
  weekday:
    "flex-1 text-[10px] uppercase tracking-[0.16em] font-medium text-ink/45 select-none",
} as const;

export default function Hero() {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [range, setRange] = useState<DateRange>();
  const [datesOpen, setDatesOpen] = useState(false);
  const [months, setMonths] = useState(1);
  const [videoReady, setVideoReady] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const today = startOfToday();

  useEffect(() => {
    const v = videoRef.current;
    if (v && v.readyState >= 2) setVideoReady(true);
  }, []);

  // Two-month range picker on desktop, single month on phones.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setMonths(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Intro timeline
      const tl = gsap.timeline();
      tl.from(".hero-sub", {
        y: 12,
        opacity: 0,
        duration: 0.65,
        ease: "power2.out",
      })
      .from(".hero-title-line", {
        yPercent: 100,
        duration: 0.85,
        stagger: 0.08,
        ease: "power3.out",
      }, "-=0.45")
      .from(".hero-desc", {
        y: 12,
        opacity: 0,
        duration: 0.65,
        ease: "power2.out",
      }, "-=0.5")
      .from(".hero-booking", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.55");

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

  const guestsLabel =
    adults + children === 0
      ? "Add guests"
      : [
          `${adults} adult${adults > 1 ? "s" : ""}`,
          children > 0 ? `${children} child${children > 1 ? "ren" : ""}` : null,
        ]
          .filter(Boolean)
          .join(" · ");

  const nights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;

  const onRangeSelect = (next: DateRange | undefined) => {
    setRange(next);
    // Auto-close once both ends are chosen — one less click.
    if (next?.from && next?.to) setDatesOpen(false);
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="bg-white h-[100dvh] min-h-[640px] flex flex-col"
    >
      <h1 className="sr-only">
        Hôtel du Lac — lakeside city hotel in Béjaïa, Algeria
      </h1>
      <NavbarCentered />

      <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-5 pb-3 sm:pb-4 lg:pb-5">
        <div className="flex-1 relative w-full overflow-hidden rounded-2xl bg-ink min-h-0 shadow-[0_30px_80px_-30px_rgba(21,19,22,0.35)]">
          <video
            ref={videoRef}
            aria-hidden
            className={`absolute inset-0 h-full w-full object-cover will-change-transform transition-[opacity,filter] duration-[500ms] ease-out ${
              videoReady ? "opacity-100 blur-[0px]" : "opacity-0 blur-[8px]"
            }`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
          >
            {/* TODO(demo): swap for a real Hôtel du Lac clip — a slow pan over
                Lac Mézaïa toward Yemma Gouraya, or the facade at golden hour. */}
            <source src="/hero/hero.webm" type="video/webm" />
            <source src="/hero/hero.mp4" type="video/mp4" />
          </video>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/15 to-ink/55"
          />

          {/* Hero headline */}
          <div className="absolute left-0 right-0 top-0 px-5 sm:px-10 lg:px-14 pt-8 sm:pt-14 lg:pt-20 pointer-events-none">
            <div className="overflow-hidden">
              <p className="hero-sub font-sans text-[10px] sm:text-[12px] uppercase tracking-[0.24em] text-white/85">
                Hôtel du Lac · Béjaïa
              </p>
            </div>
            <h2 className="mt-3 font-display font-medium text-white text-[28px] sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight max-w-[16ch] text-balance [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
              <span className="block overflow-hidden">
                <span className="hero-title-line block">The calm at the</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-title-line block">heart of the city</span>
              </span>
            </h2>
            <div className="overflow-hidden mt-3 sm:mt-4">
              <p className="hero-desc font-sans font-normal text-[13px] sm:text-[16px] leading-[1.6] text-white/85 max-w-[40ch] [text-shadow:0_1px_16px_rgba(0,0,0,0.35)]">
                On the edge of Lac Mézaïa, facing Yemma Gouraya — comfort and
                quiet, whether you come for business or with family.
              </p>
            </div>
          </div>

          {/* Reservation bar */}
          <div className="hero-booking absolute left-1/2 bottom-3 sm:bottom-10 w-[94%] sm:w-[90%] lg:w-[82%] max-w-[1180px] -translate-x-1/2">
            <div className="rounded-[20px] bg-white/95 backdrop-blur-sm border border-ink/10 shadow-[0_24px_50px_-16px_rgba(21,19,22,0.28)] overflow-hidden">
              <form
                onSubmit={(e) => e.preventDefault()}
                aria-label="Check availability"
                className="flex flex-col md:flex-row md:items-stretch divide-y md:divide-y-0 md:divide-x divide-ink/10"
              >
                {/* Guests */}
                <Popover>
                  <PopoverTrigger
                    aria-label="Guests"
                    className={cn(fieldShell, "md:flex-1")}
                  >
                    <span className={fieldLabel}>
                      <Users className="h-3 w-3 text-ink/40" strokeWidth={2} />
                      Guests
                    </span>
                    <span
                      className={cn(
                        fieldValue,
                        adults + children > 0
                          ? "text-ink font-medium"
                          : "text-ink/45",
                      )}
                    >
                      {guestsLabel}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={12}
                    className="w-[320px] max-w-[calc(100vw-1.5rem)] p-2"
                  >
                    <Stepper
                      label="Adults"
                      hint="Ages 13+"
                      value={adults}
                      min={1}
                      max={10}
                      onChange={setAdults}
                    />
                    <div className="h-px bg-ink/10 mx-3" />
                    <Stepper
                      label="Children"
                      hint="Ages 0–12"
                      value={children}
                      min={0}
                      max={6}
                      onChange={setChildren}
                    />
                  </PopoverContent>
                </Popover>

                {/* Dates — one range picker behind two displays */}
                <Popover open={datesOpen} onOpenChange={setDatesOpen}>
                  <PopoverTrigger
                    aria-label="Check-in and check-out dates"
                    className="group/field relative flex md:flex-[1.7] items-stretch text-left transition-colors hover:bg-ink/[0.025] focus-visible:outline-none focus-visible:bg-ink/[0.04]"
                  >
                    <span className="flex flex-1 flex-col items-start justify-center gap-1 px-5 max-md:px-4 h-[72px] max-md:h-[60px]">
                      <span className={fieldLabel}>Check-in</span>
                      <span
                        className={cn(
                          fieldValue,
                          range?.from ? "text-ink font-medium" : "text-ink/45",
                        )}
                      >
                        {range?.from ? format(range.from, "EEE, MMM d") : "Add date"}
                      </span>
                    </span>
                    <span aria-hidden className="my-3 w-px bg-ink/10" />
                    <span className="flex flex-1 flex-col items-start justify-center gap-1 px-5 max-md:px-4 h-[72px] max-md:h-[60px]">
                      <span className={fieldLabel}>Check-out</span>
                      <span
                        className={cn(
                          fieldValue,
                          range?.to ? "text-ink font-medium" : "text-ink/45",
                        )}
                      >
                        {range?.to ? format(range.to, "EEE, MMM d") : "Add date"}
                      </span>
                    </span>
                    <CalendarDays
                      className="self-center mr-5 h-4 w-4 text-ink/40 shrink-0"
                      strokeWidth={1.75}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={12}
                    className="w-auto max-w-[calc(100vw-1.5rem)] p-3"
                  >
                    <Calendar
                      mode="range"
                      numberOfMonths={months}
                      selected={range}
                      onSelect={onRangeSelect}
                      defaultMonth={range?.from}
                      disabled={{ before: today }}
                      className="[--cell-size:--spacing(9)] p-0"
                      classNames={calendarClassNames}
                    />
                    <div className="mt-2 flex items-center justify-between border-t border-ink/10 px-1 pt-3">
                      <span className="font-sans text-[12px] text-ink/60">
                        {nights > 0
                          ? `${nights} night${nights > 1 ? "s" : ""}`
                          : "Select your dates"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRange(undefined)}
                        className="font-sans text-[11px] uppercase tracking-[0.16em] text-ink/55 hover:text-ink transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* CTA */}
                <button
                  type="submit"
                  className="group/cta h-[72px] max-md:h-[56px] w-full md:w-[210px] shrink-0 inline-flex items-center justify-center gap-2.5 bg-marine text-white font-sans text-[12px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                >
                  Check availability
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
                    strokeWidth={2.25}
                  />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <div>
        <p className="font-sans text-[14px] font-medium text-ink leading-none">
          {label}
        </p>
        <p className="mt-1.5 font-sans text-[12px] text-ink/45 leading-none">
          {hint}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StepButton
          ariaLabel={`Remove one ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2} />
        </StepButton>
        <span className="w-6 text-center font-display text-[18px] font-medium tabular-nums text-ink">
          {value}
        </span>
        <StepButton
          ariaLabel={`Add one ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  children,
  ariaLabel,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-marine hover:text-marine disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
    >
      {children}
    </button>
  );
}
