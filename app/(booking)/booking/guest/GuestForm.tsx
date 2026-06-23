// GuestForm — client form for /booking/guest.
//
// PII NEVER GOES IN THE URL. The booking funnel keeps its non-sensitive
// state in the URL (dates, room, guest counts, promo) so refresh and
// link-sharing work. But personal data — names, emails, phones — would
// leak through history, server logs and shared links. We persist it to
// `sessionStorage` under "hdl:booking-guest" so it only lives for the
// life of the tab.
//
// Form behaviour:
//   - All required fields validate client-side on submit.
//   - The first invalid field is focused on submit failure.
//   - The required check-in acknowledgement (ID + marriage booklet for
//     couples — Algerian regulation) is wired as `ackCheckInPolicy`.
//   - On success we route to /booking/review carrying ONLY the URL query
//     (room + dates + counts), nothing personal.

"use client";

import { useRef, useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Field, TextArea } from "@/components/site/FormField";
import { bookingHref } from "@/lib/booking/params";
import type { BookingQuery, GuestDetails } from "@/lib/booking/types";
import type { Room } from "@/lib/data/rooms";

const STORAGE_KEY = "hdl:booking-guest";

type Props = {
  room: Room;
  q: BookingQuery;
};

type FieldErrors = Partial<Record<keyof GuestDetails, string>>;

export default function GuestForm({ q }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [details, setDetails] = useState<GuestDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    arrivalTime: "",
    notes: "",
    ackCheckInPolicy: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from sessionStorage if the user is coming back from /review.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<GuestDetails>;
      setDetails((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch {
      /* ignore malformed payloads */
    }
  }, []);

  const update = <K extends keyof GuestDetails>(
    key: K,
    value: GuestDetails[K],
  ) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (d: GuestDetails): FieldErrors => {
    const next: FieldErrors = {};
    if (!d.firstName.trim()) next.firstName = "First name is required.";
    if (!d.lastName.trim()) next.lastName = "Last name is required.";
    if (!d.email.trim()) next.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))
      next.email = "Use a valid email address.";
    if (!d.phone.trim()) next.phone = "Phone is required.";
    if (!d.ackCheckInPolicy)
      next.ackCheckInPolicy =
        "Please acknowledge the check-in policy to continue.";
    return next;
  };

  const focusFirstInvalid = (errs: FieldErrors) => {
    if (!formRef.current) return;
    const order: (keyof GuestDetails)[] = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "ackCheckInPolicy",
    ];
    for (const key of order) {
      if (!errs[key]) continue;
      const el = formRef.current.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >(`[name="${key}"]`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(details);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      focusFirstInvalid(errs);
      return;
    }
    setSubmitting(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch {
      /* private mode — proceed anyway */
    }
    router.push(bookingHref("review", q));
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      aria-label="Lead guest details"
      className="flex flex-col gap-7 pb-28 lg:pb-0"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        <Field
          index="01"
          name="firstName"
          label="First name"
          autoComplete="given-name"
          required
          value={details.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          error={errors.firstName}
        />
        <Field
          index="02"
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          required
          value={details.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          error={errors.lastName}
        />
        <Field
          index="03"
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={details.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          helper="We send your confirmation here."
        />
        <Field
          index="04"
          name="phone"
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={details.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
          helper="In case the front desk needs to reach you."
        />
        <Field
          index="05"
          name="arrivalTime"
          label="Arrival time"
          placeholder="e.g. 14:00"
          autoComplete="off"
          value={details.arrivalTime ?? ""}
          onChange={(e) => update("arrivalTime", e.target.value)}
          helper="Optional — helps us prep your room."
          wrapperClassName="sm:col-span-2 md:col-span-1"
        />
      </div>

      <TextArea
        index="06"
        name="notes"
        label="A note for the desk"
        placeholder="Allergies, anniversaries, a quiet floor — anything we should know."
        rows={4}
        value={details.notes ?? ""}
        onChange={(e) => update("notes", e.target.value)}
      />

      {/* ID / marriage booklet acknowledgement — required by Algerian
          regulation for couples checking in. Surfaced verbatim per the
          honesty rules in the orchestrator brief. */}
      <div className="rounded-2xl border border-marine/20 bg-marine/[0.04] p-5 md:p-6">
        <div className="flex items-start gap-4">
          <span className="hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-marine mb-2">
              Check-in policy
            </p>
            <label
              htmlFor="ackCheckInPolicy"
              className="flex items-start gap-3 cursor-pointer group/ack"
            >
              <input
                id="ackCheckInPolicy"
                name="ackCheckInPolicy"
                type="checkbox"
                checked={details.ackCheckInPolicy}
                onChange={(e) =>
                  update("ackCheckInPolicy", e.target.checked)
                }
                className="mt-1 h-5 w-5 shrink-0 accent-marine cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine rounded-sm"
                aria-describedby={
                  errors.ackCheckInPolicy ? "ackCheckInPolicy-err" : undefined
                }
              />
              <span className="font-sans text-[14px] leading-[1.6] text-ink">
                I understand I&apos;ll need to present a valid ID, and a
                marriage booklet for couples (Algerian requirement).
              </span>
            </label>
            {errors.ackCheckInPolicy && (
              <p
                id="ackCheckInPolicy-err"
                role="alert"
                className="mt-3 font-sans text-[12.5px] text-destructive"
              >
                {errors.ackCheckInPolicy}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Desktop CTA row */}
      <div className="hidden lg:flex items-center justify-between gap-6 pt-4">
        <p className="font-sans text-[12px] text-graybase max-w-sm">
          We don&apos;t share your details. You can edit them on the next
          step.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group/cta inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white bg-marine border border-marine rounded-full px-8 py-4 transition-colors duration-300 ease-out hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine disabled:opacity-50"
        >
          Continue to review
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
            strokeWidth={2.25}
          />
        </button>
      </div>

      {/* Mobile sticky bottom action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-full bg-marine text-white font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors active:bg-marine/90 disabled:opacity-50"
        >
          Continue to review
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}
