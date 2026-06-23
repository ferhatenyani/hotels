"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, differenceInCalendarDays, startOfToday } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  CalendarDays,
  Users,
  Minus,
  Plus,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { gsap } from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BottomSheet from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

const openConciergeChat = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("concierge:open"));
  }
};

// Field surface shared by the tablet/desktop Guests and Dates triggers.
const fieldShell =
  "group/field relative flex h-[72px] w-full flex-col items-start justify-center gap-1 px-5 text-left transition-colors hover:bg-ink/[0.025] focus-visible:outline-none focus-visible:bg-ink/[0.04]";
const fieldLabel =
  "flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink/45 font-medium leading-none";
const fieldValue = "text-[15px] leading-tight truncate font-sans";

const calendarClassNames = {
  caption_label:
    "font-display text-[15px] font-medium tracking-tight select-none",
  weekday:
    "flex-1 text-[10px] uppercase tracking-[0.16em] font-medium text-ink/45 select-none",
} as const;

type SheetStep = "checkin" | "checkout" | "guests";

export default function Hero() {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [datesOpen, setDatesOpen] = useState(false);
  const [months, setMonths] = useState(1);
  const [videoReady, setVideoReady] = useState(false);

  // Mobile reservation sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState<SheetStep>("checkin");
  // Buffer the in-sheet picks until the user confirms — avoids partial updates
  // leaking into the chip while they navigate between steps.
  const [draftCheckIn, setDraftCheckIn] = useState<Date | undefined>();
  const [draftCheckOut, setDraftCheckOut] = useState<Date | undefined>();
  const [draftAdults, setDraftAdults] = useState(2);
  const [draftChildren, setDraftChildren] = useState(0);

  // Tracks whether the mobile chat trigger should render as the FAB at
  // bottom-right (true when the hero is mostly scrolled past) or as the pill
  // inside the reservation card (true while the hero dominates the viewport).
  const [chatInFab, setChatInFab] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const today = startOfToday();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (v && v.readyState >= 2) setVideoReady(true);
  }, []);

  // Pill ↔ FAB morph fires at the first pixel of scroll. Lenis dispatches
  // native scroll events too, so a plain listener is enough — no need to
  // wire into useLenis.
  useEffect(() => {
    const onScroll = () => setChatInFab(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Two-month range picker on desktop, single month on phones (popover only).
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
      const tl = gsap.timeline();
      tl.from(".hero-sub", {
        y: 12,
        opacity: 0,
        duration: 0.32,
        ease: "power2.out",
      }, 0)
      .from(".hero-title-line", {
        yPercent: 100,
        duration: 0.45,
        stagger: 0.05,
        ease: "power3.out",
      }, 0)
      .from(".hero-desc", {
        y: 12,
        opacity: 0,
        duration: 0.32,
        ease: "power2.out",
      }, 0)
      .from(".hero-booking", {
        opacity: 0,
        duration: 0.32,
        ease: "power2.out",
      }, 0);

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
    checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;

  // Desktop popover uses a range; convert to two states.
  const popoverRange = useMemo<DateRange>(
    () => ({ from: checkIn, to: checkOut }),
    [checkIn, checkOut],
  );

  const onRangeSelect = (next: DateRange | undefined) => {
    setCheckIn(next?.from);
    setCheckOut(next?.to);
    if (next?.from && next?.to) setDatesOpen(false);
  };

  // ---- Mobile sheet handlers -------------------------------------------

  const firstMissingStep = (): SheetStep =>
    checkIn ? (checkOut ? "guests" : "checkout") : "checkin";

  const openSheet = (startStep?: SheetStep) => {
    setDraftCheckIn(checkIn);
    setDraftCheckOut(checkOut);
    setDraftAdults(adults);
    setDraftChildren(children);
    setSheetStep(startStep ?? firstMissingStep());
    setSheetOpen(true);
  };

  // The mobile chip's marine CTA: if everything is filled, scroll to contact
  // (the "submit" equivalent in this demo); otherwise open the sheet at the
  // first missing step.
  const onCheckAvailability = () => {
    const ready = checkIn && checkOut && adults + children > 0;
    if (ready) {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      openSheet();
    }
  };

  const closeSheet = () => setSheetOpen(false);

  const back = () => {
    if (sheetStep === "checkout") setSheetStep("checkin");
    else if (sheetStep === "guests") setSheetStep("checkout");
  };

  const onPickCheckIn = (d: Date | undefined) => {
    setDraftCheckIn(d);
    // If user changes check-in to a date >= existing check-out, clear out.
    if (d && draftCheckOut && d >= draftCheckOut) setDraftCheckOut(undefined);
  };

  const onPickCheckOut = (d: Date | undefined) => {
    setDraftCheckOut(d);
  };

  const continueFromCheckIn = () => {
    if (!draftCheckIn) return;
    setSheetStep("checkout");
  };
  const continueFromCheckOut = () => {
    if (!draftCheckOut) return;
    setSheetStep("guests");
  };
  const commit = () => {
    setCheckIn(draftCheckIn);
    setCheckOut(draftCheckOut);
    setAdults(draftAdults);
    setChildren(draftChildren);
    setSheetOpen(false);
  };

  const chipDates =
    checkIn && checkOut
      ? `${format(checkIn, "MMM d")} → ${format(checkOut, "MMM d")}`
      : checkIn
        ? `${format(checkIn, "MMM d")} · pick check-out`
        : "Add dates";

  const draftNights =
    draftCheckIn && draftCheckOut
      ? differenceInCalendarDays(draftCheckOut, draftCheckIn)
      : 0;

  return (
    <section
      ref={sectionRef}
      id="top"
      className="bg-white h-[100dvh] flex flex-col"
    >
      <h1 className="sr-only">
        Hôtel du Lac — lakeside city hotel in Béjaïa, Algeria
      </h1>

      {/* Section 1 (mobile) — header spacer at 12dvh. Matches the
          reservation block's height so the gaps above and below the video
          card are visually symmetric (navbar ~68px, leaving ~28px breathing
          above the card; pills ~66px, leaving ~30px below). */}
      <div className="md:hidden h-[12dvh] shrink-0" aria-hidden />

      <div className="px-4 h-[76dvh] shrink-0 flex flex-col min-h-0 md:h-auto md:flex-1 md:p-3 lg:p-5">
        <div className="relative w-full overflow-hidden rounded-2xl bg-ink shadow-[0_30px_80px_-30px_rgba(21,19,22,0.35)] flex-1 min-h-0 md:rounded-xl lg:rounded-2xl">
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
            <source src="/hero/hero.webm" type="video/webm" />
            <source src="/hero/hero.mp4" type="video/mp4" />
          </video>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/15 to-ink/65"
          />

          {/* Hero headline — overlapping the video, top-left on every
              breakpoint. Mobile uses pt-6 inside the card; tablet/desktop
              keeps the larger clearance for the fixed navbar above. */}
          <div className="absolute inset-0 px-5 sm:px-10 lg:px-14 flex flex-col justify-start pt-6 sm:pt-[120px] lg:pt-[140px] pointer-events-none">
            <div className="overflow-hidden">
              <p className="hero-sub font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.24em] text-white/85">
                Hôtel du Lac · Béjaïa
              </p>
            </div>
            <h2 className="mt-3 font-display font-medium text-white text-[32px] xs:text-[36px] sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight max-w-[16ch] text-balance [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
              <span className="block overflow-hidden">
                <span className="hero-title-line block">The calm at the</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-title-line block">heart of the city</span>
              </span>
            </h2>
            <div className="overflow-hidden mt-3 sm:mt-4">
              <p className="hero-desc font-sans font-normal text-[14px] sm:text-[16px] leading-[1.6] text-white/85 max-w-[40ch] [text-shadow:0_1px_16px_rgba(0,0,0,0.35)]">
                On the edge of Lac Mézaïa, facing Yemma Gouraya — calm for
                business or family.
              </p>
            </div>
          </div>

          {/* TABLET/DESKTOP: full reservation bar */}
          <div className="hero-booking hidden md:block absolute left-1/2 bottom-10 w-[90%] lg:w-[82%] max-w-[1180px] -translate-x-1/2">
            <div className="rounded-[20px] bg-white/95 backdrop-blur-sm border border-ink/10 shadow-[0_24px_50px_-16px_rgba(21,19,22,0.28)] overflow-hidden">
              <form
                onSubmit={(e) => e.preventDefault()}
                aria-label="Check availability"
                className="flex items-stretch divide-x divide-ink/10"
              >
                <Popover>
                  <PopoverTrigger
                    aria-label="Guests"
                    className={cn(fieldShell, "flex-1")}
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

                <Popover open={datesOpen} onOpenChange={setDatesOpen}>
                  <PopoverTrigger
                    aria-label="Check-in and check-out dates"
                    className="group/field relative flex flex-[1.7] items-stretch text-left transition-colors hover:bg-ink/[0.025] focus-visible:outline-none focus-visible:bg-ink/[0.04]"
                  >
                    <span className="flex flex-1 flex-col items-start justify-center gap-1 px-5 h-[72px]">
                      <span className={fieldLabel}>Check-in</span>
                      <span
                        className={cn(
                          fieldValue,
                          checkIn ? "text-ink font-medium" : "text-ink/45",
                        )}
                      >
                        {checkIn ? format(checkIn, "EEE, MMM d") : "Add date"}
                      </span>
                    </span>
                    <span aria-hidden className="my-3 w-px bg-ink/10" />
                    <span className="flex flex-1 flex-col items-start justify-center gap-1 px-5 h-[72px]">
                      <span className={fieldLabel}>Check-out</span>
                      <span
                        className={cn(
                          fieldValue,
                          checkOut ? "text-ink font-medium" : "text-ink/45",
                        )}
                      >
                        {checkOut ? format(checkOut, "EEE, MMM d") : "Add date"}
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
                      selected={popoverRange}
                      onSelect={onRangeSelect}
                      defaultMonth={checkIn}
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
                        onClick={() => {
                          setCheckIn(undefined);
                          setCheckOut(undefined);
                        }}
                        className="font-sans text-[11px] uppercase tracking-[0.16em] text-ink/55 hover:text-ink transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <button
                  type="submit"
                  className="group/cta h-[72px] w-[210px] shrink-0 inline-flex items-center justify-center gap-2.5 bg-marine text-white font-sans text-[12px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
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

      {/* Section 3 (mobile) — reservation locked at 12dvh to match the
          header spacer above. Just the three booking CTAs (Dates, Guests,
          Check). The chat icon lives outside this block and floats
          independently. */}
      <div className="hero-booking md:hidden h-[12dvh] shrink-0 flex flex-col justify-end px-4 pb-4">
        <div className="flex items-stretch gap-2 max-w-[480px] w-full mx-auto">
          <button
            type="button"
            onClick={() => openSheet("checkin")}
            aria-label="Select dates"
            className="flex-1 min-w-0 flex flex-col items-start justify-center gap-1 rounded-[14px] bg-white border border-ink/10 px-3.5 py-2.5 text-left touch-manipulation transition-colors active:bg-ink/[0.04] shadow-[0_8px_20px_-12px_rgba(21,19,22,0.16)]"
          >
            <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.22em] text-ink/45 font-medium leading-none">
              <CalendarDays className="h-3 w-3 text-ink/45" strokeWidth={2} />
              Dates
            </span>
            <span
              className={cn(
                "text-[13px] leading-tight font-sans truncate w-full",
                checkIn ? "text-ink font-medium" : "text-ink/55",
              )}
            >
              {chipDates}
            </span>
          </button>
          <button
            type="button"
            onClick={() => openSheet("guests")}
            aria-label="Select guests"
            className="flex-1 min-w-0 flex flex-col items-start justify-center gap-1 rounded-[14px] bg-white border border-ink/10 px-3.5 py-2.5 text-left touch-manipulation transition-colors active:bg-ink/[0.04] shadow-[0_8px_20px_-12px_rgba(21,19,22,0.16)]"
          >
            <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.22em] text-ink/45 font-medium leading-none">
              <Users className="h-3 w-3 text-ink/45" strokeWidth={2} />
              Guests
            </span>
            <span
              className={cn(
                "text-[13px] leading-tight font-sans truncate w-full",
                adults + children > 0
                  ? "text-ink font-medium"
                  : "text-ink/55",
              )}
            >
              {guestsLabel}
            </span>
          </button>
          <button
            type="button"
            onClick={onCheckAvailability}
            aria-label="Check availability"
            className="shrink-0 inline-flex items-center justify-center rounded-[14px] bg-marine text-white px-4 transition-colors active:bg-marine/85 touch-manipulation shadow-[0_8px_20px_-8px_rgba(21,19,22,0.24)]"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      {/* Floating chat icon. "Hovering" sits anchored to the video card:
          mobile = just above the reservation block; tablet = above the
          inline booking bar (the card's bottom corner is occupied by it);
          lg+ = bottom-right corner of the card. "Docked" sits at viewport
          bottom-right the instant the user scrolls. Crossfade, no translate. */}
      <AnimatePresence initial={false}>
        {!chatInFab && (
          <motion.button
            key="concierge-hovering"
            type="button"
            onClick={openConciergeChat}
            aria-label="Ask the AI concierge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { duration: 0.14, ease: "easeOut" }
            }
            className="fixed z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-marine text-white shadow-[0_14px_32px_-10px_rgba(31,74,55,0.55)] touch-manipulation bottom-[calc(12dvh+1rem)] right-8 md:bottom-36 md:right-7 lg:bottom-9 lg:right-9"
          >
            <MessageCircle className="h-[22px] w-[22px]" strokeWidth={1.7} />
          </motion.button>
        )}
        {chatInFab && (
          <motion.button
            key="concierge-docked"
            type="button"
            onClick={openConciergeChat}
            aria-label="Ask the AI concierge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { duration: 0.14, ease: "easeOut" }
            }
            style={{
              bottom: "max(1rem, env(safe-area-inset-bottom))",
              right: "max(1rem, env(safe-area-inset-right))",
            }}
            className="fixed z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-marine text-white shadow-[0_14px_32px_-10px_rgba(31,74,55,0.55)] touch-manipulation"
          >
            <MessageCircle className="h-[22px] w-[22px]" strokeWidth={1.7} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile sequenced booking sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={
          sheetStep === "checkin"
            ? "Check-in"
            : sheetStep === "checkout"
              ? "Check-out"
              : "Guests"
        }
        onBack={sheetStep !== "checkin" ? back : undefined}
        bodyClassName="pb-2"
        footer={
          sheetStep === "checkin" ? (
            <button
              type="button"
              onClick={continueFromCheckIn}
              disabled={!draftCheckIn}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] h-[52px] transition-opacity disabled:opacity-40 disabled:pointer-events-none"
            >
              Continue
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          ) : sheetStep === "checkout" ? (
            <button
              type="button"
              onClick={continueFromCheckOut}
              disabled={!draftCheckOut}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] h-[52px] transition-opacity disabled:opacity-40 disabled:pointer-events-none"
            >
              Continue
              {draftNights > 0 ? (
                <span className="font-normal normal-case tracking-normal ml-1 opacity-80">
                  · {draftNights} night{draftNights > 1 ? "s" : ""}
                </span>
              ) : null}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          ) : (
            <button
              type="button"
              onClick={commit}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] h-[52px]"
            >
              Check availability
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          )
        }
      >
        {sheetStep === "checkin" && (
          <SheetCalendar
            selected={draftCheckIn}
            onSelect={onPickCheckIn}
            disabled={{ before: today }}
          />
        )}
        {sheetStep === "checkout" && (
          <SheetCalendar
            selected={draftCheckOut}
            onSelect={onPickCheckOut}
            disabled={{ before: draftCheckIn ?? today }}
            defaultMonth={draftCheckIn}
          />
        )}
        {sheetStep === "guests" && (
          <div className="pt-2">
            <Stepper
              label="Adults"
              hint="Ages 13+"
              value={draftAdults}
              min={1}
              max={10}
              onChange={setDraftAdults}
              large
            />
            <div className="h-px bg-ink/10 my-1" />
            <Stepper
              label="Children"
              hint="Ages 0–12"
              value={draftChildren}
              min={0}
              max={6}
              onChange={setDraftChildren}
              large
            />
            {draftCheckIn && draftCheckOut ? (
              <p className="mt-6 rounded-xl bg-ink/[0.04] px-4 py-3 font-sans text-[13px] text-ink/70">
                <span className="font-medium text-ink">
                  {format(draftCheckIn, "EEE, MMM d")} → {format(draftCheckOut, "EEE, MMM d")}
                </span>
                <span className="block text-[12px] text-ink/55 mt-0.5">
                  {draftNights} night{draftNights > 1 ? "s" : ""}
                </span>
              </p>
            ) : null}
          </div>
        )}
      </BottomSheet>
    </section>
  );
}

function SheetCalendar({
  selected,
  onSelect,
  disabled,
  defaultMonth,
}: {
  selected: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  disabled?: { before: Date };
  defaultMonth?: Date;
}) {
  return (
    <div className="pt-1">
      <Calendar
        mode="single"
        numberOfMonths={1}
        selected={selected}
        onSelect={onSelect}
        defaultMonth={defaultMonth ?? selected}
        disabled={disabled}
        className="[--cell-size:--spacing(11)] p-0 w-full"
        classNames={{
          caption_label:
            "font-display text-[16px] font-medium tracking-tight select-none",
          weekday:
            "flex-1 text-[10px] uppercase tracking-[0.16em] font-medium text-ink/45 select-none",
        }}
      />
    </div>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  large,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        large ? "px-1 py-5" : "px-3 py-3",
      )}
    >
      <div>
        <p
          className={cn(
            "font-sans font-medium text-ink leading-none",
            large ? "text-[16px]" : "text-[14px]",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-1.5 font-sans text-ink/45 leading-none",
            large ? "text-[13px]" : "text-[12px]",
          )}
        >
          {hint}
        </p>
      </div>
      <div className={cn("flex items-center", large ? "gap-4" : "gap-3")}>
        <StepButton
          ariaLabel={`Remove one ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          large={large}
        >
          <Minus
            className={large ? "h-4 w-4" : "h-3.5 w-3.5"}
            strokeWidth={2}
          />
        </StepButton>
        <span
          className={cn(
            "text-center font-display font-medium tabular-nums text-ink",
            large ? "w-8 text-[22px]" : "w-6 text-[18px]",
          )}
        >
          {value}
        </span>
        <StepButton
          ariaLabel={`Add one ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          large={large}
        >
          <Plus
            className={large ? "h-4 w-4" : "h-3.5 w-3.5"}
            strokeWidth={2}
          />
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
  large,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-marine hover:text-marine disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
        large ? "h-11 w-11" : "h-8 w-8",
      )}
    >
      {children}
    </button>
  );
}
