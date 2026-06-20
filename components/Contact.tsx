"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const ledger = [
  {
    label: "The house",
    lines: ["Saint-Jean-Cap-Ferrat, France"],
  },
  {
    label: "Reservations",
    lines: ["reservations@maisondoree.fr", "+33 4 93 00 00 00"],
  },
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const headTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".contact-letterhead",
          start: "top 88%",
          once: true,
        },
      });
      headTl
        .from(".contact-eyebrow", {
          autoAlpha: 0,
          y: 8,
          duration: 0.5,
          ease: "expo.out",
        })
        .from(
          ".contact-heading",
          {
            autoAlpha: 0,
            y: 16,
            duration: 0.7,
            ease: "expo.out",
          },
          "-=0.3",
        )
        .from(
          ".contact-rule",
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.6,
            ease: "expo.out",
          },
          "-=0.4",
        )
        .from(
          ".contact-ledger-item",
          {
            autoAlpha: 0,
            y: 10,
            stagger: 0.08,
            duration: 0.55,
            ease: "expo.out",
          },
          "-=0.35",
        );

      gsap.from(".contact-field", {
        autoAlpha: 0,
        y: 16,
        stagger: 0.07,
        duration: 0.65,
        ease: "expo.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".contact-card",
          start: "top 86%",
          once: true,
        },
      });

      gsap.from(".contact-card", {
        autoAlpha: 0,
        y: 24,
        duration: 0.85,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".contact-card",
          start: "top 90%",
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
      className="grain relative bg-cream px-4 sm:px-6 lg:px-10 py-14 md:py-[120px] overflow-hidden"
    >
      {/* Decorative coastal ornament — a thin horizon line with a small disc,
          tucked at the lower-right. Hidden on small screens to keep the
          mobile read uncluttered. */}
      <svg
        aria-hidden
        viewBox="0 0 320 120"
        className="hidden lg:block absolute right-6 bottom-6 w-[280px] text-marine/25 pointer-events-none"
      >
        <line
          x1="0"
          y1="80"
          x2="320"
          y2="80"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="232" cy="62" r="14" stroke="currentColor" strokeWidth="1" fill="none" />
        <line
          x1="232"
          y1="34"
          x2="232"
          y2="48"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>

      <div className="max-w-[1280px] mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-20">
          {/* Letterhead column */}
          <div className="contact-letterhead lg:col-span-5 lg:pt-2">
            <p className="contact-eyebrow font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
              Reach the house
            </p>
            <h2 className="contact-heading font-display font-medium text-3xl sm:text-4xl lg:text-[52px] leading-[1.05] tracking-tight text-ink text-balance">
              Write to us —
              <br className="hidden sm:block" />
              <span className="italic font-normal">we&apos;ll write back.</span>
            </h2>
            <span
              aria-hidden
              className="contact-rule mt-7 block h-px w-14 bg-marine"
            />

            <ul className="mt-8 md:mt-14 flex flex-col gap-5 md:gap-10">
              {ledger.map((item, i) => (
                <li
                  key={item.label}
                  className="contact-ledger-item flex items-start gap-5"
                >
                  <span className="font-display text-[13px] text-marine pt-1 tabular-nums tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 border-t border-ink/15 pt-3">
                    <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60">
                      {item.label}
                    </p>
                    <div className="mt-2 flex flex-col gap-1">
                      {item.lines.map((line) => (
                        <p
                          key={line}
                          className="font-sans font-normal text-[15px] leading-[1.6] text-ink"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Form card column */}
          <div className="lg:col-span-7">
            <div className="contact-card relative bg-white shadow-[0_30px_60px_-30px_rgba(21,19,22,0.18)] border border-ink/[0.06]">
              {/* Hairline marine ribbon at the card's top — subtle stationery
                  cue that ties the card visually to the letterhead's rule. */}
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
                    <span className="tabular-nums">
                      {new Date().getFullYear()}
                    </span>
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
                        id="fullname"
                        label="Full name"
                        required
                        type="text"
                        autoComplete="name"
                      />
                      <Field
                        index="02"
                        id="email"
                        label="Email"
                        required
                        type="email"
                        autoComplete="email"
                      />
                    </div>

                    <Field
                      index="03"
                      id="subject"
                      label="Subject"
                      type="text"
                      placeholder="Dates, room, a wish"
                    />

                    <Field
                      index="04"
                      id="message"
                      label="Message"
                      textarea
                      placeholder="A few lines is plenty."
                    />

                    <div className="contact-field pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <p className="font-sans text-[12px] leading-relaxed text-graybase max-w-sm">
                        We answer in the order letters arrive, usually within
                        the day.
                      </p>
                      <button
                        type="submit"
                        className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-ink border border-ink/30 rounded-full px-8 py-4 transition-colors duration-300 ease-out hover:bg-marine hover:border-marine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine"
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
                  <Confirmation />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  index: string;
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

function Field({
  index,
  id,
  label,
  type = "text",
  required,
  textarea,
  placeholder,
  autoComplete,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  // The underline animates from a hairline ink/15 baseline to a full marine
  // stroke that grows from the left on focus. Scale-x on a pseudo isn't
  // straightforward without :focus-within hooks, so we drive it from React
  // state on the field wrapper.
  return (
    <div className="contact-field group/field flex flex-col gap-3">
      <label
        htmlFor={id}
        className="flex items-baseline gap-3 font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60"
      >
        <span className="font-display text-[12px] tabular-nums text-marine not-italic tracking-tight">
          {index}
        </span>
        <span>
          {label}
          {required ? (
            <span aria-hidden className="ml-1 text-marine">
              ·
            </span>
          ) : null}
        </span>
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
            className="w-full bg-transparent font-sans font-normal text-[16px] text-ink placeholder:text-ink/30 outline-none pb-3 max-md:min-h-[44px] max-md:pt-2"
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
  // Match the entrance language of the form card — same easing curve, brief
  // staggered reveal of the seal, copy and the small return-to-form action.
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.from(".confirm-step", {
        autoAlpha: 0,
        y: 14,
        stagger: 0.1,
        duration: 0.7,
        ease: "expo.out",
        clearProps: "all",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-start gap-6 py-4">
      <div className="confirm-step flex items-center gap-4">
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
      <p className="confirm-step font-display text-2xl sm:text-[28px] leading-[1.2] tracking-tight text-ink max-w-md">
        Your note is on the desk.{" "}
        <span className="italic font-normal text-graybase">
          A reply is on its way back to you.
        </span>
      </p>
      <p className="confirm-step font-sans text-[14px] leading-[1.7] text-graybase max-w-md">
        We answer in the order letters arrive — usually within the day, often
        sooner. If a date is pressing, do telephone the house directly.
      </p>
    </div>
  );
}
