// /events enquiry form. Letter-styled, mirrors the Contact.tsx submission
// pattern — local "thank you" state, no real submit.

"use client";

import { useState, type FormEvent } from "react";

import { Field, TextArea } from "@/components/site/FormField";

const eventTypeOptions = [
  "Mariage",
  "Fiançailles / Baptême",
  "Anniversaire",
  "Conférence",
  "Séminaire / Hors site",
  "Concert / Soirée",
  "Autre",
];

export default function EventEnquiryForm() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative bg-cream/40 shadow-[0_30px_60px_-30px_rgba(21,19,22,0.18)] border border-ink/[0.06]">
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 h-[2px] bg-marine"
      />

      <div className="p-6 sm:p-10 lg:p-12">
        <div className="flex items-baseline justify-between gap-4 mb-6 md:mb-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/55">
            Demande d'événement
          </p>
          <p className="font-display italic text-[13px] text-marine">
            N°{" "}
            <span className="tabular-nums">{new Date().getFullYear()}</span>
          </p>
        </div>

        {!sent ? (
          <form className="flex flex-col gap-6 md:gap-9" onSubmit={handleSubmit}>
            {/* Type + date on tablet+. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-9">
              {/* Custom-styled select via Field shell — kept simple: we render
                  the select inline, since FormField only ships input/textarea. */}
              <SelectField
                index="01"
                label="Type d'événement"
                name="eventType"
                required
                options={eventTypeOptions}
              />
              <Field
                index="02"
                label="Date"
                type="date"
                name="date"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-9">
              <Field
                index="03"
                label="Nombre d'invités"
                type="number"
                name="guestCount"
                min={1}
                max={500}
                placeholder="Approximatif"
                required
              />
              <Field
                index="04"
                label="Votre nom"
                type="text"
                name="name"
                autoComplete="name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-9">
              <Field
                index="05"
                label="E-mail"
                type="email"
                name="email"
                autoComplete="email"
                required
              />
              <Field
                index="06"
                label="Téléphone"
                type="tel"
                name="phone"
                autoComplete="tel"
                required
              />
            </div>

            <TextArea
              index="07"
              label="Parlez-nous de la journée"
              name="message"
              rows={5}
              placeholder="Détails sur la restauration, l'agencement, les blocs de chambres pour vos invités — tout ce qui aide à façonner le premier devis."
            />

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <p className="font-sans text-[12px] leading-relaxed text-graybase max-w-sm">
                Un premier devis, généralement dans la journée. Nous reviendrons vers vous par téléphone ou par e-mail — comme vous préférez.
              </p>
              <button
                type="submit"
                className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-white bg-marine border border-marine rounded-full px-8 py-4 max-md:min-h-[52px] transition-colors duration-300 ease-out hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
              >
                Envoyer la demande
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

/**
 * A tiny <select> dressed in the same letter-style as Field. Keeps the
 * Field/TextArea primitives focused on input/textarea, while letting this
 * form use a controlled list of event types without reinventing the shell.
 */
type SelectFieldProps = {
  index: string;
  label: string;
  name: string;
  required?: boolean;
  options: string[];
};

function SelectField({
  index,
  label,
  name,
  required,
  options,
}: SelectFieldProps) {
  const [focused, setFocused] = useState(false);
  const id = `select-${name}`;

  return (
    <div className="contact-field flex flex-col gap-3">
      <label
        htmlFor={id}
        className="flex items-baseline gap-3 font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60"
      >
        <span className="font-display text-[12px] tabular-nums text-marine not-italic tracking-tight">
          {index}
        </span>
        <span>
          {label}
          {required && (
            <span aria-hidden className="ml-1 text-marine">
              ·
            </span>
          )}
        </span>
      </label>

      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          defaultValue=""
          className="w-full bg-transparent font-sans font-normal text-[16px] text-ink outline-none pb-3 max-md:min-h-[44px] max-md:pt-2 appearance-none cursor-pointer pr-6"
        >
          <option value="" disabled>
            Choisir…
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {/* caret */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/45 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>

        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-ink/15"
        />
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-px bg-marine origin-left transition-transform duration-500 ease-out ${
            focused ? "scale-x-100" : "scale-x-0"
          }`}
        />
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
          Auprès de l'équipe événements
        </p>
      </div>
      <p className="font-display text-2xl sm:text-[28px] leading-[1.2] tracking-tight text-ink max-w-md">
        Votre demande est sur le bureau.{" "}
        <span className="italic font-normal text-graybase">
          Un premier devis est en route vers vous.
        </span>
      </p>
      <p className="font-sans text-[14px] leading-[1.7] text-graybase max-w-md">
        Généralement dans la journée, souvent plus tôt. Si la date est urgente, téléphonez directement à la réception — la ligne événements est ouverte toute la journée.
      </p>
    </div>
  );
}
