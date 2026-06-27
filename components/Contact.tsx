"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Phone, Mail, MapPin, ArrowUpRight, Check } from "lucide-react";

import { hotel } from "@/lib/data/hotel";

function InstagramGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
function FacebookGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const telHref = `tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`;
const mailHref = `mailto:${hotel.contact.email}`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${hotel.name} ${hotel.address.street} ${hotel.address.city}`,
)}`;

export default function Contact() {
  const [sent, setSent] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".contact-fade", {
        autoAlpha: 0,
        y: 14,
        stagger: 0.06,
        duration: 0.6,
        ease: "expo.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="grain relative bg-cream px-5 sm:px-6 lg:px-10 py-14 md:py-20 lg:py-[112px] overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto relative">
        {/* HEADER — same on every breakpoint, just scales. */}
        <div className="contact-fade text-center max-w-[680px] mx-auto">
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-graybase">
            Contactez la réception
          </p>
          <h2 className="mt-3 font-display font-medium text-[30px] xs:text-[34px] sm:text-[42px] lg:text-[52px] leading-[1.05] tracking-tight text-ink text-balance">
            Écrivez-nous —{" "}
            <span className="italic font-normal text-graybase">
              nous répondrons.
            </span>
          </h2>
          <span
            aria-hidden
            className="mt-5 mx-auto block h-px w-12 bg-marine"
          />
        </div>

        {/* QUICK CONTACT — three tiles, the focal action layer. Mobile:
            stacked, full-width; tablet/desktop: 3-up. */}
        <ul className="contact-fade mt-9 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-[820px] mx-auto">
          <li>
            <a
              href={telHref}
              className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/65 backdrop-blur-sm px-4 py-3.5 min-h-[68px] text-ink transition-colors hover:border-marine/40 hover:bg-white"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine ring-1 ring-marine/20">
                <Phone className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55 leading-none">
                  Appeler
                </span>
                <span className="mt-1 font-sans text-[13.5px] text-ink leading-tight tabular-nums truncate">
                  {hotel.contact.phonePrimary}
                </span>
              </span>
            </a>
          </li>
          <li>
            <a
              href={mailHref}
              className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/65 backdrop-blur-sm px-4 py-3.5 min-h-[68px] text-ink transition-colors hover:border-marine/40 hover:bg-white"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine ring-1 ring-marine/20">
                <Mail className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55 leading-none">
                  Email
                </span>
                <span className="mt-1 font-sans text-[12.5px] text-ink leading-tight truncate">
                  {hotel.contact.email}
                </span>
              </span>
            </a>
          </li>
          <li>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group/maps flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/65 backdrop-blur-sm px-4 py-3.5 min-h-[68px] text-ink transition-colors hover:border-marine/40 hover:bg-white"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine ring-1 ring-marine/20">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/55 leading-none">
                  Nous trouver
                </span>
                <span className="mt-1 font-sans text-[12.5px] text-ink leading-tight truncate">
                  {hotel.address.street}, {hotel.address.city}
                </span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-ink/35 transition-transform duration-300 ease-out group-hover/maps:-translate-y-0.5 group-hover/maps:translate-x-0.5"
                strokeWidth={1.75}
              />
            </a>
          </li>
        </ul>

        {/* SOCIAL — small inline strip below the quick-contact tiles. */}
        <div className="contact-fade mt-7 flex flex-col items-center gap-3">
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-ink/45">
            Ou retrouvez-nous
          </p>
          <ul className="flex items-center gap-2.5">
            <li>
              <a
                href={hotel.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${hotel.name} sur Instagram`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white/65 text-ink/75 transition-colors hover:border-marine/50 hover:bg-white hover:text-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                <InstagramGlyph className="h-[18px] w-[18px]" />
              </a>
            </li>
            <li>
              <a
                href={hotel.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${hotel.name} sur Facebook`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white/65 text-ink/75 transition-colors hover:border-marine/50 hover:bg-white hover:text-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                <FacebookGlyph className="h-[18px] w-[18px]" />
              </a>
            </li>
          </ul>
        </div>

        {/* DIVIDER + form. The form is the "longer" path; we let it sit
            after the quick-contact tiles so mobile users can reach a phone
            in one tap, but power-users get a proper message form too. */}
        <div className="contact-fade mt-12 md:mt-16 flex items-center gap-4 max-w-[820px] mx-auto">
          <span aria-hidden className="h-px flex-1 bg-ink/15" />
          <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-ink/45">
            Ou écrivez-nous
          </span>
          <span aria-hidden className="h-px flex-1 bg-ink/15" />
        </div>

        <div className="contact-fade mt-8 md:mt-10 max-w-[820px] mx-auto">
          <div className="relative bg-white shadow-[0_30px_60px_-30px_rgba(21,19,22,0.18)] border border-ink/[0.06] rounded-xl overflow-hidden">
            <span
              aria-hidden
              className="absolute left-0 right-0 top-0 h-[2px] bg-marine"
            />

            <div className="p-5 sm:p-8 lg:p-10">
              {!sent ? (
                <form
                  className="flex flex-col gap-5 md:gap-7"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-7">
                    <Field
                      id="fullname"
                      label="Nom complet"
                      required
                      type="text"
                      autoComplete="name"
                    />
                    <Field
                      id="email"
                      label="E-mail"
                      required
                      type="email"
                      autoComplete="email"
                    />
                  </div>

                  <Field
                    id="subject"
                    label="Sujet"
                    type="text"
                    placeholder="Dates, chambre, un souhait"
                  />

                  <Field
                    id="message"
                    label="Message"
                    textarea
                    placeholder="Quelques lignes suffisent."
                  />

                  <div className="pt-1 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="font-sans text-[12px] leading-relaxed text-graybase">
                      Réponse sous 24 h en général.
                    </p>
                    <button
                      type="submit"
                      className="group/cta inline-flex items-center justify-center gap-2 btn-text-md text-white bg-marine rounded-full px-6 py-3.5 min-h-[48px] transition-colors duration-300 ease-out hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
                    >
                      Envoyer le message
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
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

function Field({
  id,
  label,
  type = "text",
  required,
  textarea,
  placeholder,
  autoComplete,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2.5">
      <label
        htmlFor={id}
        className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/65"
      >
        {label}
        {required ? (
          <span aria-hidden className="ml-1 text-marine">
            ·
          </span>
        ) : null}
      </label>

      <div className="relative">
        {textarea ? (
          <textarea
            id={id}
            rows={4}
            placeholder={placeholder}
            required={required}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent font-sans font-normal text-[16px] leading-[1.6] text-ink placeholder:text-ink/30 outline-none pb-3 resize-none"
          />
        ) : (
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent font-sans font-normal text-[16px] text-ink placeholder:text-ink/30 outline-none pb-3 min-h-[44px] pt-1"
          />
        )}
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.from(".confirm-step", {
        autoAlpha: 0,
        y: 12,
        stagger: 0.08,
        duration: 0.6,
        ease: "expo.out",
        clearProps: "all",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-start gap-5 py-4">
      <div className="confirm-step flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-marine/10 ring-1 ring-marine/30 text-marine">
          <Check className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-marine">
          Message envoyé
        </p>
      </div>
      <p className="confirm-step font-display text-2xl sm:text-[28px] leading-[1.2] tracking-tight text-ink max-w-md">
        Votre mot est arrivé à la réception.{" "}
        <span className="italic font-normal text-graybase">
          Une réponse vous parvient bientôt.
        </span>
      </p>
      <p className="confirm-step font-sans text-[13.5px] leading-[1.7] text-graybase max-w-md">
        Pour une date pressée, n'hésitez pas à appeler directement la réception.
      </p>
    </div>
  );
}
