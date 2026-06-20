"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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

// Shared style for every booking control so the Persons select, both date
// triggers and the Search CTA share the same height, radius, and rhythm.
// `!h-14` is needed for the shadcn SelectTrigger because its default
// `data-[size=default]:h-8` rule wins on specificity otherwise.
const cardTrigger =
  "!h-14 w-full rounded-xl border border-ink/10 bg-white px-4 shadow-[0_1px_3px_rgba(21,19,22,0.04)] transition-all hover:border-ink/20 hover:shadow-[0_8px_24px_-8px_rgba(21,19,22,0.18)] flex items-center justify-between text-[15px] font-sans";

const navyCta =
  "h-14 w-full inline-flex items-center justify-center rounded-xl bg-navy text-white font-sans text-[14px] font-medium tracking-wide transition-colors hover:bg-navy-light";

export default function Hero() {
  const [persons, setPersons] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();

  const personsNum = persons ? Number.parseInt(persons, 10) : 0;

  return (
    <>
    <section id="top" className="bg-white h-[100dvh] flex flex-col">
      <NavbarCentered />

      <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-5 pb-3 sm:pb-4 lg:pb-5">
        <div className="flex-1 relative w-full overflow-hidden rounded-2xl bg-ink min-h-0 shadow-[0_30px_80px_-30px_rgba(21,19,22,0.35)]">
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

          {/* Soft top-to-bottom darken — keeps the wordmark area airy and
              lifts contrast under the reservation bar without flattening
              the middle of the video. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/5 to-ink/45"
          />

          {/* Reservation bar — nearly invisible container. The white field
              cards inside carry all the visual weight; the video reads
              clearly through the gaps. */}
          <div className="absolute left-1/2 bottom-6 sm:bottom-10 w-[94%] sm:w-[88%] lg:w-[80%] max-w-[1180px] -translate-x-1/2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Guests */}
              <Select
                value={persons}
                onValueChange={(v) => v && setPersons(v)}
              >
                <SelectTrigger
                  aria-label="Number of guests"
                  className={cn(cardTrigger, "[&_svg]:text-ink/55")}
                >
                  <span
                    className={
                      persons ? "text-ink font-medium" : "text-ink/55"
                    }
                  >
                    {persons
                      ? `${persons} ${personsNum === 1 ? "guest" : "guests"}`
                      : "Guests"}
                  </span>
                </SelectTrigger>
                {/* side="top" + alignItemWithTrigger={false} so the popup
                    opens cleanly above the trigger instead of anchoring
                    the selected row at the trigger's vertical position
                    (which was causing the dropdown to clip behind the
                    bar). */}
                <SelectContent
                  side="top"
                  align="start"
                  sideOffset={10}
                  alignItemWithTrigger={false}
                  className="min-w-[--anchor-width]"
                >
                  {personOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DateField
                placeholder="Check-in"
                value={checkIn}
                onSelect={setCheckIn}
              />

              <DateField
                placeholder="Check-out"
                value={checkOut}
                onSelect={setCheckOut}
              />

              <button type="button" className={navyCta}>
                Search
              </button>
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
  placeholder,
  value,
  onSelect,
}: {
  placeholder: string;
  value: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger aria-label={placeholder} className={cardTrigger}>
        <span className={value ? "text-ink font-medium" : "text-ink/55"}>
          {value ? format(value, "MMM d, yyyy") : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-ink/55" />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={10}
        className="w-auto p-0"
      >
        <Calendar mode="single" selected={value} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  );
}
