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
            Une lettre à la réception
          </p>
          <p className="font-display italic text-[13px] text-marine">
            N°{" "}
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
                label="Nom complet"
                required
                type="text"
                autoComplete="name"
              />
              <Field
                index="02"
                label="E-mail"
                required
                type="email"
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-9">
              <Field
                index="03"
                label="Téléphone"
                type="tel"
                autoComplete="tel"
                placeholder="Pour vous rappeler si besoin"
              />
              <Field
                index="04"
                label="Sujet"
                type="text"
                placeholder="Une réservation, un événement, une question"
              />
            </div>

            <TextArea
              index="05"
              label="Message"
              placeholder="Quelques lignes suffisent — dates, taille du groupe, ce qui compte."
              rows={5}
            />

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <p className="font-sans text-[12px] leading-relaxed text-graybase max-w-sm">
                Nous répondons dans l'ordre d'arrivée des lettres, généralement dans la journée.
              </p>
              <button
                type="submit"
                className="group/cta inline-flex items-center justify-center gap-3 btn-text-md text-ink border border-ink/30 rounded-full px-8 py-4 min-h-[48px] transition-colors duration-300 ease-out hover:bg-marine hover:border-marine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
              >
                Envoyer la lettre
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
          Cachetée et envoyée
        </p>
      </div>
      <p className="font-display text-2xl sm:text-[28px] leading-[1.2] tracking-tight text-ink max-w-md">
        Votre message est sur le bureau.{" "}
        <span className="italic font-normal text-graybase">
          Une réponse est en route.
        </span>
      </p>
      <p className="font-sans text-[14px] leading-[1.7] text-graybase max-w-md">
        Nous répondons dans l'ordre d'arrivée des messages — habituellement
        dans la journée, souvent plus tôt. Si une date presse, n'hésitez pas
        à téléphoner directement à l'hôtel.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 inline-flex items-center gap-2 btn-text-sm text-marine hover:text-marine/80 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
      >
        Écrire une autre lettre
      </button>
    </div>
  );
}
