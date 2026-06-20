"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import NavbarMinimal from "./NavbarMinimal";
import NavbarUtilityStrip from "./NavbarUtilityStrip";
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

// Single source of truth for the field "card" so the Persons select + both
// date pickers are pixel-identical: same height, padding, label/value rhythm.
const cardTrigger =
  "relative !h-14 w-full rounded-xl border border-ink/10 bg-white pl-4 pr-10 shadow-[0_1px_3px_rgba(21,19,22,0.06)] transition-all hover:border-ink/20 hover:shadow-[0_4px_14px_-4px_rgba(21,19,22,0.15)] inline-flex flex-col items-start justify-center gap-0.5 text-left font-sans";

const innerLabel =
  "text-[10px] uppercase tracking-[0.18em] text-ink/55 leading-none";

const innerValue = "text-sm text-ink font-medium leading-tight";

const navyCta =
  "h-10 inline-flex items-center justify-center rounded-[12px] bg-navy text-white font-sans text-[13px] font-medium tracking-wide transition-colors hover:bg-navy-light";

// Small marker shown above each variant so they're easy to identify in
// the stacked comparison view.
function VariantLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ink/[0.02] border-y border-ink/[0.05] px-4 sm:px-6 lg:px-10 py-1.5">
      <span className="text-[9px] uppercase tracking-[0.32em] text-ink/45 font-sans">
        {children}
      </span>
    </div>
  );
}

export default function Hero() {
  const [persons, setPersons] = useState("2");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();

  const personsNum = Number.parseInt(persons, 10);

  return (
    <>
    <section id="top" className="bg-white h-[100dvh] flex flex-col">
      {/* Three stacked navbar variants for side-by-side comparison. */}
      <VariantLabel>Variant A · Minimal with hairlines</VariantLabel>
      <NavbarMinimal />

      <VariantLabel>Variant B · Top utility strip + classic nav</VariantLabel>
      <NavbarUtilityStrip />

      <VariantLabel>Variant C · Centered wordmark + split nav</VariantLabel>
      <NavbarCentered />

      <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-5 pb-3 sm:pb-4 lg:pb-5">
        <div className="flex-1 relative w-full overflow-hidden rounded-2xl bg-ink min-h-0">
          {/* Background video */}
          <video
            className="absolute inset-0 h-full w-full object-cover"
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
          <div className="absolute inset-0 bg-ink/25" aria-hidden />

          {/* Reservation bar — barely-there frosted container. The white
              field cards inside carry the visual weight. */}
          <div className="absolute left-1/2 bottom-5 sm:bottom-8 w-[92%] sm:w-[86%] lg:w-[78%] -translate-x-1/2 rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-md p-4 pb-5 sm:p-5 sm:pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Persons — label + value live INSIDE the card now. */}
              <Select
                value={persons}
                onValueChange={(v) => v && setPersons(v)}
              >
                <SelectTrigger
                  id="persons"
                  aria-label="Number of persons"
                  className={cn(
                    cardTrigger,
                    "[&_svg]:absolute [&_svg]:right-4 [&_svg]:top-1/2 [&_svg]:-translate-y-1/2 [&_svg]:text-ink/55",
                  )}
                >
                  <span className={innerLabel}>Persons</span>
                  <span className={innerValue}>
                    {personsNum} {personsNum === 1 ? "person" : "persons"}
                  </span>
                </SelectTrigger>
                {/* side="top" so the dropdown opens upward like the date
                    pickers, instead of overlapping the rest of the bar. */}
                <SelectContent side="top" align="start" sideOffset={8}>
                  {personOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "person" : "persons"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DateField
                label="Check-in"
                value={checkIn}
                onSelect={setCheckIn}
              />

              <DateField
                label="Check-out"
                value={checkOut}
                onSelect={setCheckOut}
              />

              <div className="col-span-2 md:col-span-1 flex md:items-end md:justify-end">
                <button
                  type="button"
                  className={cn(navyCta, "w-full px-6 md:w-auto md:px-7")}
                >
                  Check availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Spacer between the hero and the next section. */}
    <div aria-hidden className="bg-white h-44 sm:h-56 lg:h-72" />
    </>
  );
}

function DateField({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger aria-label={label} className={cardTrigger}>
        <span className={innerLabel}>{label}</span>
        <span
          className={cn(
            innerValue,
            !value && "text-ink/55 font-normal",
          )}
        >
          {value ? format(value, "MMM d, yyyy") : "Add date"}
        </span>
        <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/55" />
      </PopoverTrigger>
      <PopoverContent align="start" side="top" sideOffset={8} className="w-auto p-0">
        <Calendar mode="single" selected={value} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  );
}
