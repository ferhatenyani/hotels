// Client form for /booking/search. Mirrors the canonical Hero.tsx booking
// widget pattern:
//  - Desktop: a single card with two calendars (range), a guest popover and
//    a marine "Find rooms" CTA.
//  - Mobile: stacked input chips that open the BottomSheet, with a sticky
//    bottom action bar carrying the primary CTA (matches "no rabbit holes"
//    rule from CONVENTIONS §8).
//
// On submit we push /booking/results carrying the full query. If the user
// is locked to a specific room we preserve roomSlug and promo throughout.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  differenceInCalendarDays,
  parseISO,
  startOfToday,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { ArrowRight, CalendarDays, Users } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BottomSheet from "@/components/ui/bottom-sheet";
import Stepper from "@/components/site/Stepper";
import { bookingHref } from "@/lib/booking/params";
import { cn } from "@/lib/utils";

type Props = {
  initialCheckIn: string | null;
  initialCheckOut: string | null;
  initialAdults: number;
  initialChildren: number;
  roomSlug?: string;
  promo?: string;
};

type SheetStep = "checkin" | "checkout" | "guests";

const fieldShell =
  "group/field relative flex h-[72px] w-full flex-col items-start justify-center gap-1 px-5 text-left transition-colors hover:bg-ink/[0.025] focus-visible:outline-none focus-visible:bg-ink/[0.04]";
const fieldLabel =
  // Bumped from /45 (~4:1) to /60 (~6.5:1) for WCAG AA on body-size small caps.
  "flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink/60 font-medium leading-none";
const fieldValue = "text-[15px] leading-tight truncate font-sans";

const calendarClassNames = {
  caption_label:
    "font-display text-[15px] font-medium tracking-tight select-none",
  weekday:
    "flex-1 text-[10px] uppercase tracking-[0.16em] font-medium text-ink/55 select-none",
} as const;

export default function SearchForm({
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialChildren,
  roomSlug,
  promo,
}: Props) {
  const today = startOfToday();
  const router = useRouter();

  const [checkIn, setCheckIn] = useState<Date | undefined>(
    initialCheckIn ? parseISO(initialCheckIn) : undefined,
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    initialCheckOut ? parseISO(initialCheckOut) : undefined,
  );
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [months, setMonths] = useState(1);

  // Mobile sheet state — buffered drafts so partial picks don't leak to the
  // chip while the user is mid-flow.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState<SheetStep>("checkin");
  const [draftCheckIn, setDraftCheckIn] = useState<Date | undefined>(checkIn);
  const [draftCheckOut, setDraftCheckOut] = useState<Date | undefined>(
    checkOut,
  );
  const [draftAdults, setDraftAdults] = useState(adults);
  const [draftChildren, setDraftChildren] = useState(children);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setMonths(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const guestsLabel =
    adults + children === 0
      ? "Ajouter des voyageurs"
      : [
          `${adults} adulte${adults > 1 ? "s" : ""}`,
          children > 0
            ? `${children} enfant${children > 1 ? "s" : ""}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ");

  const nights =
    checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;

  const popoverRange = useMemo<DateRange>(
    () => ({ from: checkIn, to: checkOut }),
    [checkIn, checkOut],
  );

  // Range-pick handler. Mirrors Hero.tsx — react-day-picker v10 returns
  // `{from, to}` set to the SAME day on the first click in range mode, so we
  // must treat that as "still picking check-in" and only dismiss when the
  // user has actually selected a different end day. `min={1}` on the calendar
  // makes the second click required.
  const onRangeSelect = (next: DateRange | undefined) => {
    const from = next?.from;
    const to = next?.to;
    const rangeComplete =
      Boolean(from && to) && from!.getTime() !== to!.getTime();

    setCheckIn(from);
    setCheckOut(rangeComplete ? to : undefined);

    if (rangeComplete) {
      // Chain checkin → checkout → guests on desktop, mirroring the mobile
      // bottom-sheet flow.
      window.setTimeout(() => {
        setDatesOpen(false);
        setGuestsOpen(true);
      }, 160);
    }
  };

  const awaitingCheckOut = Boolean(checkIn) && !checkOut;

  const goToResults = () => {
    if (!checkIn || !checkOut) {
      setError("Sélectionnez une date d'arrivée et de départ pour voir les disponibilités.");
      return;
    }
    if (checkIn >= checkOut) {
      setError("Le départ doit être après l'arrivée.");
      return;
    }
    if (adults < 1) {
      setError("Ajoutez au moins un adulte.");
      return;
    }
    setError(null);
    router.push(
      bookingHref("results", {
        checkIn,
        checkOut,
        adults,
        children,
        roomSlug,
        promo,
      }),
    );
  };

  // Mobile sheet handlers
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
  const closeSheet = () => setSheetOpen(false);

  const back = () => {
    if (sheetStep === "checkout") setSheetStep("checkin");
    else if (sheetStep === "guests") setSheetStep("checkout");
  };

  const onPickCheckIn = (d: Date | undefined) => {
    setDraftCheckIn(d);
    if (d && draftCheckOut && d >= draftCheckOut)
      setDraftCheckOut(undefined);
  };

  const onPickCheckOut = (d: Date | undefined) => setDraftCheckOut(d);

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
    if (draftCheckIn && draftCheckOut && draftAdults > 0) {
      router.push(
        bookingHref("results", {
          checkIn: draftCheckIn,
          checkOut: draftCheckOut,
          adults: draftAdults,
          children: draftChildren,
          roomSlug,
          promo,
        }),
      );
    }
  };

  const chipDates =
    checkIn && checkOut
      ? `${format(checkIn, "d MMM")} → ${format(checkOut, "d MMM")}`
      : checkIn
        ? `${format(checkIn, "d MMM")} · choisir le départ`
        : "Ajouter des dates";

  const draftNights =
    draftCheckIn && draftCheckOut
      ? differenceInCalendarDays(draftCheckOut, draftCheckIn)
      : 0;

  return (
    <>
      {/* TABLET/DESKTOP: single bordered card with two calendars + guests + CTA. */}
      <div className="hidden md:block">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToResults();
          }}
          aria-label="Trouver votre séjour"
          className="rounded-2xl border border-ink/12 bg-white shadow-[0_24px_50px_-30px_rgba(21,19,22,0.22)] overflow-hidden"
        >
          <div className="flex items-stretch divide-x divide-ink/10">
            <Popover open={datesOpen} onOpenChange={setDatesOpen}>
              <PopoverTrigger
                aria-label="Dates d'arrivée et de départ"
                className="group/field relative flex flex-[1.7] items-stretch text-left transition-colors hover:bg-ink/[0.025] focus-visible:outline-none focus-visible:bg-ink/[0.04]"
              >
                <span className="flex flex-1 flex-col items-start justify-center gap-1 px-5 h-[80px]">
                  <span className={fieldLabel}>Arrivée</span>
                  <span
                    className={cn(
                      fieldValue,
                      checkIn ? "text-ink font-medium" : "text-ink/55",
                    )}
                  >
                    {checkIn ? format(checkIn, "EEE d MMM") : "Ajouter une date"}
                  </span>
                </span>
                <span aria-hidden className="my-3 w-px bg-ink/10" />
                <span
                  className={cn(
                    "relative flex flex-1 flex-col items-start justify-center gap-1 px-5 h-[80px] transition-colors",
                    awaitingCheckOut && "bg-marine/[0.05]",
                  )}
                >
                  <span className={fieldLabel}>Départ</span>
                  <span
                    className={cn(
                      fieldValue,
                      checkOut
                        ? "text-ink font-medium"
                        : awaitingCheckOut
                          ? "text-marine font-medium"
                          : "text-ink/55",
                    )}
                  >
                    {checkOut
                      ? format(checkOut, "EEE d MMM")
                      : awaitingCheckOut
                        ? "Choisir le départ →"
                        : "Ajouter une date"}
                  </span>
                  {awaitingCheckOut && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[2px] bg-marine animate-pulse"
                    />
                  )}
                </span>
                <CalendarDays
                  className="self-center mr-5 h-4 w-4 text-ink/40 shrink-0"
                  strokeWidth={1.75}
                />
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={12}
                className="w-auto max-w-[calc(100vw-1.5rem)] p-3"
              >
                <Calendar
                  mode="range"
                  min={1}
                  numberOfMonths={months}
                  selected={popoverRange}
                  onSelect={onRangeSelect}
                  defaultMonth={checkIn ?? today}
                  disabled={{ before: today }}
                  className="[--cell-size:--spacing(9)] p-0"
                  classNames={calendarClassNames}
                />
                <div className="mt-2 flex items-center justify-between border-t border-ink/10 px-1 pt-3">
                  <span
                    className={cn(
                      "font-sans text-[12px] transition-colors",
                      awaitingCheckOut
                        ? "text-marine font-medium"
                        : "text-ink/60",
                    )}
                  >
                    {nights > 0
                      ? `${nights} nuit${nights > 1 ? "s" : ""}`
                      : awaitingCheckOut
                        ? "Choisissez maintenant le départ →"
                        : "Choisissez votre date d'arrivée"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckIn(undefined);
                      setCheckOut(undefined);
                    }}
                    className="font-sans text-[11px] uppercase tracking-[0.16em] text-ink/55 hover:text-ink transition-colors"
                  >
                    Effacer
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
              <PopoverTrigger
                aria-label="Voyageurs"
                className={cn(fieldShell, "flex-1 h-[80px]")}
              >
                <span className={fieldLabel}>
                  <Users className="h-3 w-3 text-ink/40" strokeWidth={2} />
                  Voyageurs
                </span>
                <span
                  className={cn(
                    fieldValue,
                    adults + children > 0
                      ? "text-ink font-medium"
                      : "text-ink/55",
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
                  label="Adultes"
                  hint="13 ans et plus"
                  value={adults}
                  min={1}
                  max={10}
                  onChange={setAdults}
                />
                <div className="h-px bg-ink/10 mx-3" />
                <Stepper
                  label="Enfants"
                  hint="0–12 ans"
                  value={children}
                  min={0}
                  max={6}
                  onChange={setChildren}
                />
              </PopoverContent>
            </Popover>

            <button
              type="submit"
              className="group/cta h-[80px] w-[220px] shrink-0 inline-flex items-center justify-center gap-2.5 bg-marine text-white btn-text-md transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
            >
              Voir les chambres
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
                strokeWidth={2.25}
              />
            </button>
          </div>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-4 font-sans text-[13px] text-destructive"
          >
            {error}
          </p>
        )}
      </div>

      {/* MOBILE : pastilles d'entrée empilées. */}
      <div className="md:hidden flex flex-col gap-3 pb-24">
        <button
          type="button"
          onClick={() => openSheet("checkin")}
          aria-label="Choisir la date d'arrivée"
          className="flex flex-col items-start justify-center gap-1.5 rounded-2xl border border-ink/12 bg-white px-4 py-3.5 min-h-[64px] text-left transition-colors active:bg-ink/[0.04] shadow-[0_8px_20px_-12px_rgba(21,19,22,0.12)]"
        >
          <span className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55 font-medium leading-none">
            <CalendarDays className="h-3 w-3" strokeWidth={2} />
            Arrivée
          </span>
          <span
            className={cn(
              "font-sans text-[16px] leading-tight",
              checkIn ? "text-ink font-medium" : "text-ink/55",
            )}
          >
            {checkIn ? format(checkIn, "EEE d MMM yyyy") : "Ajouter une date"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => openSheet("checkout")}
          aria-label="Choisir la date de départ"
          className="flex flex-col items-start justify-center gap-1.5 rounded-2xl border border-ink/12 bg-white px-4 py-3.5 min-h-[64px] text-left transition-colors active:bg-ink/[0.04] shadow-[0_8px_20px_-12px_rgba(21,19,22,0.12)]"
        >
          <span className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55 font-medium leading-none">
            <CalendarDays className="h-3 w-3" strokeWidth={2} />
            Départ
          </span>
          <span
            className={cn(
              "font-sans text-[16px] leading-tight",
              checkOut ? "text-ink font-medium" : "text-ink/55",
            )}
          >
            {checkOut ? format(checkOut, "EEE d MMM yyyy") : "Ajouter une date"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => openSheet("guests")}
          aria-label="Choisir les voyageurs"
          className="flex flex-col items-start justify-center gap-1.5 rounded-2xl border border-ink/12 bg-white px-4 py-3.5 min-h-[64px] text-left transition-colors active:bg-ink/[0.04] shadow-[0_8px_20px_-12px_rgba(21,19,22,0.12)]"
        >
          <span className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55 font-medium leading-none">
            <Users className="h-3 w-3" strokeWidth={2} />
            Voyageurs
          </span>
          <span
            className={cn(
              "font-sans text-[16px] leading-tight",
              adults + children > 0 ? "text-ink font-medium" : "text-ink/55",
            )}
          >
            {guestsLabel}
          </span>
        </button>

        {error && (
          <p
            role="alert"
            className="font-sans text-[13px] text-destructive"
          >
            {error}
          </p>
        )}

        {/* CTA collante en bas. */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={goToResults}
            className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-full bg-marine text-white btn-text-md transition-colors active:bg-marine/90"
          >
            {chipDates !== "Ajouter des dates" && nights > 0
              ? `Voir les chambres · ${nights} nuit${nights > 1 ? "s" : ""}`
              : "Voir les chambres"}
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      {/* Bottom sheet séquencé mobile — même archétype que Hero.tsx. */}
      <BottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={
          sheetStep === "checkin"
            ? "Arrivée"
            : sheetStep === "checkout"
              ? "Départ"
              : "Voyageurs"
        }
        onBack={sheetStep !== "checkin" ? back : undefined}
        bodyClassName="pb-2"
        footer={
          sheetStep === "checkin" ? (
            <button
              type="button"
              onClick={continueFromCheckIn}
              disabled={!draftCheckIn}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-marine text-white btn-text-md h-[52px] transition-opacity disabled:opacity-40 disabled:pointer-events-none"
            >
              Continuer
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          ) : sheetStep === "checkout" ? (
            <button
              type="button"
              onClick={continueFromCheckOut}
              disabled={!draftCheckOut}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-marine text-white btn-text-md h-[52px] transition-opacity disabled:opacity-40 disabled:pointer-events-none"
            >
              Continuer
              {draftNights > 0 ? (
                <span className="font-normal normal-case tracking-normal ml-1 opacity-80">
                  · {draftNights} nuit{draftNights > 1 ? "s" : ""}
                </span>
              ) : null}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          ) : (
            <button
              type="button"
              onClick={commit}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-marine text-white btn-text-md h-[52px]"
            >
              Voir les chambres
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
              label="Adultes"
              hint="13 ans et plus"
              value={draftAdults}
              min={1}
              max={10}
              onChange={setDraftAdults}
              large
            />
            <div className="h-px bg-ink/10 my-1" />
            <Stepper
              label="Enfants"
              hint="0–12 ans"
              value={draftChildren}
              min={0}
              max={6}
              onChange={setDraftChildren}
              large
            />
            {draftCheckIn && draftCheckOut ? (
              <p className="mt-6 rounded-xl bg-ink/[0.04] px-4 py-3 font-sans text-[13px] text-ink/70">
                <span className="font-medium text-ink">
                  {format(draftCheckIn, "EEE d MMM")} →{" "}
                  {format(draftCheckOut, "EEE d MMM")}
                </span>
                <span className="block text-[12px] text-ink/55 mt-0.5">
                  {draftNights} nuit{draftNights > 1 ? "s" : ""}
                </span>
              </p>
            ) : null}
          </div>
        )}
      </BottomSheet>
    </>
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
            "flex-1 text-[10px] uppercase tracking-[0.16em] font-medium text-ink/55 select-none",
        }}
      />
    </div>
  );
}
