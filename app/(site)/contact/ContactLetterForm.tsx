// Stand-alone letter form card for /contact. Reuses the exact stationery
// pattern from the home Contact section (FormField primitive + a "No.
// {year}" stamp + a "Sealed and sent" confirmation), but lives in its own
// card so the contact page can layout it next to a fuller letterhead.

"use client";

import { useState } from "react";

import { Field, TextArea } from "@/components/site/FormField";

export default function ContactLetterForm() {
  const [sent, setSent] = useState(false);

  return (
    <div className="relative bg-white shadow-[0_30px_60px_-30px_rgba(21,19,22,0.18)] border border-ink/[0.06]">
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 h-[2px] bg-marine"
      />
      <div className="p-6 sm:p-10 lg:p-12">
        <div className="flex items-baseline justify-between gap-4 mb-6 md:mb-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/55">
            A letter to the desk
          </p>
          <p className="font-display italic text-[13px] text-marine">
            No.{" "}
            <span className="tabular-nums">{new Date().getFullYear()}</span>
          </p>
        </div>

        {!sent ? (
          <form
            className="flex flex-col gap-6 md:gap-9"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-9">
              <Field
                index="01"
                label="Full name"
                required
                type="text"
                autoComplete="name"
              />
              <Field
                index="02"
                label="Email"
                required
                type="email"
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-9">
              <Field
                index="03"
                label="Telephone"
                type="tel"
                autoComplete="tel"
                placeholder="So we can call back if needed"
              />
              <Field
                index="04"
                label="About"
                type="text"
                placeholder="A reservation, an event, a question"
              />
            </div>

            <TextArea
              index="05"
              label="Message"
              placeholder="A few lines is plenty — dates, party size, what matters."
              rows={5}
            />

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <p className="font-sans text-[12px] leading-relaxed text-graybase max-w-sm">
                We answer in the order letters arrive, usually within the day.
              </p>
              <button
                type="submit"
                className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-ink border border-ink/30 rounded-full px-8 py-4 min-h-[48px] transition-colors duration-300 ease-out hover:bg-marine hover:border-marine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
              >
                Send the letter
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
          <SentConfirmation onReset={() => setSent(false)} />
        )}
      </div>
    </div>
  );
}

function SentConfirmation({ onReset }: { onReset: () => void }) {
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
          Sealed and sent
        </p>
      </div>
      <p className="font-display text-2xl sm:text-[28px] leading-[1.2] tracking-tight text-ink max-w-md">
        Your note is on the desk.{" "}
        <span className="italic font-normal text-graybase">
          A reply is on its way back to you.
        </span>
      </p>
      <p className="font-sans text-[14px] leading-[1.7] text-graybase max-w-md">
        We answer in the order messages arrive — usually within the day, often
        sooner. If a date is pressing, do telephone the hotel directly.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-marine hover:text-marine/80 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
      >
        Write another
      </button>
    </div>
  );
}
