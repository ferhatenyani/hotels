// Inline table-reservation form for the /dining page. Mirrors the
// Contact.tsx submit pattern — no real submit, just a quiet local
// "thank you" state so the surface feels real. Uses the shared FormField
// primitive (letter-style label + animated marine underline).

"use client";

import { useState, type FormEvent } from "react";

import { Field } from "@/components/site/FormField";

export default function DiningReservationForm() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative bg-white shadow-[0_30px_60px_-30px_rgba(21,19,22,0.18)] border border-ink/[0.06]">
      {/* Hairline marine ribbon at the card's top — same stationery cue as
          the Contact card. */}
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 h-[2px] bg-marine"
      />

      <div className="p-6 sm:p-10 lg:p-12">
        <div className="flex items-baseline justify-between gap-4 mb-6 md:mb-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/55">
            A note to the maître d&apos;
          </p>
          <p className="font-display italic text-[13px] text-marine">
            No.{" "}
            <span className="tabular-nums">{new Date().getFullYear()}</span>
          </p>
        </div>

        {!sent ? (
          <form className="flex flex-col gap-6 md:gap-9" onSubmit={handleSubmit}>
            {/* Date + time side-by-side on tablet+, stacked on mobile. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-9">
              <Field
                index="01"
                label="Date"
                type="date"
                name="date"
                required
              />
              <Field
                index="02"
                label="Time"
                type="time"
                name="time"
                required
                defaultValue="20:00"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-9">
              <Field
                index="03"
                label="Party size"
                type="number"
                name="partySize"
                min={1}
                max={20}
                defaultValue={2}
                required
              />
              <Field
                index="04"
                label="Name & contact"
                type="text"
                name="contact"
                placeholder="Name · phone or email"
                autoComplete="name"
                required
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <p className="font-sans text-[12px] leading-relaxed text-graybase max-w-sm">
                We confirm by phone, usually within the hour. Tables fill
                quickly on Fridays and Saturdays.
              </p>
              <button
                type="submit"
                className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-ink border border-ink/30 rounded-full px-8 py-4 max-md:min-h-[52px] transition-colors duration-300 ease-out hover:bg-marine hover:border-marine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
              >
                Send the note
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          <Confirmation />
        )}
      </div>
    </div>
  );
}

function Confirmation() {
  return (
    <div className="flex flex-col items-start gap-6 py-4">
      <div className="flex items-center gap-4">
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-marine/30">
          <span className="absolute inset-1 rounded-full bg-marine/10" />
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="relative w-4 h-4 text-marine"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-marine">
          On the maître d&apos;s desk
        </p>
      </div>
      <p className="font-display text-2xl sm:text-[28px] leading-[1.2] tracking-tight text-ink max-w-md">
        Your table is on the list.{" "}
        <span className="italic font-normal text-graybase">
          We&apos;ll come back to confirm by phone.
        </span>
      </p>
      <p className="font-sans text-[14px] leading-[1.7] text-graybase max-w-md">
        For same-day tables and short notice, do telephone the desk directly —
        the line stays open through service.
      </p>
    </div>
  );
}
