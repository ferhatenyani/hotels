"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import Navbar from "./Navbar";
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
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const personOptions = Array.from({ length: 10 }, (_, i) => i + 1);

const triggerBase =
  "h-11 w-full rounded-[10px] border border-graybase/25 bg-white px-3 font-sans text-sm text-ink shadow-none data-[placeholder]:text-ink/55 hover:bg-white";

const labelClasses =
  "font-sans text-[11px] uppercase tracking-[0.18em] text-ink";

const navyCta =
  "h-11 w-full inline-flex items-center justify-center rounded-[14px] bg-navy text-white font-sans text-sm font-medium tracking-wide transition-colors hover:bg-navy-light";

export default function Hero() {
  const [persons, setPersons] = useState("2");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();

  return (
    <section id="top" className="bg-white h-[100dvh] flex flex-col">
      <Navbar />

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

          {/* Reservation bar — pure white, shadcn controls. */}
          <div className="absolute left-1/2 bottom-5 sm:bottom-8 w-[92%] sm:w-[86%] lg:w-[78%] -translate-x-1/2 rounded-2xl border border-graybase/15 bg-white p-5 pb-6 sm:p-6 sm:pb-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label htmlFor="persons" className={labelClasses}>
                  Persons
                </label>
                <Select
                  value={persons}
                  onValueChange={(v) => v && setPersons(v)}
                >
                  <SelectTrigger
                    id="persons"
                    className={cn(triggerBase, "[&>svg]:text-ink/60")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {personOptions.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "person" : "persons"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              <div className="col-span-2 md:col-span-1 flex">
                <button type="button" className={navyCta}>
                  Check availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <div className="flex flex-col gap-2">
      <span className={labelClasses}>{label}</span>
      <Popover>
        <PopoverTrigger
          className={cn(
            triggerBase,
            "inline-flex items-center justify-start text-left font-normal",
            !value && "text-ink/55",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-ink/60" />
          {value ? format(value, "MMM d, yyyy") : "Pick a date"}
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={8} className="w-auto p-0">

          <Calendar mode="single" selected={value} onSelect={onSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
