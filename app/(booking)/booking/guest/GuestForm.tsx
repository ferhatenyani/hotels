// GuestForm — formulaire client pour /booking/guest.
//
// LES DONNÉES PERSONNELLES NE TRANSITENT JAMAIS PAR L'URL. Le tunnel de
// réservation conserve son état non sensible dans l'URL (dates, chambre,
// nombre de voyageurs, promo) pour que le refresh et le partage de liens
// fonctionnent. Mais les données personnelles — noms, e-mails, téléphones
// — fuiteraient via l'historique, les logs serveur et les liens partagés.
// On les persiste dans `sessionStorage` sous "hdl:booking-guest" pour
// qu'elles ne vivent que le temps de l'onglet.
//
// Comportement du formulaire :
//   - Tous les champs requis sont validés côté client à la soumission.
//   - Le premier champ invalide reçoit le focus si la soumission échoue.
//   - L'acceptation de la politique de check-in (pièce d'identité requise)
//     est câblée en `ackCheckInPolicy`.
//   - En cas de succès, on route vers /booking/review en ne transportant
//     que la query d'URL (chambre + dates + voyageurs), rien de personnel.

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
    if (!d.firstName.trim()) next.firstName = "Le prénom est requis.";
    if (!d.lastName.trim()) next.lastName = "Le nom est requis.";
    if (!d.email.trim()) next.email = "L'e-mail est requis.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))
      next.email = "Utilisez une adresse e-mail valide.";
    if (!d.phone.trim()) next.phone = "Le téléphone est requis.";
    if (!d.ackCheckInPolicy)
      next.ackCheckInPolicy =
        "Veuillez accepter la politique de check-in pour continuer.";
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
      aria-label="Informations du voyageur principal"
      className="flex flex-col gap-7 pb-28 lg:pb-0"
    >
      {/* Les formulaires du tunnel évitent volontairement la numérotation
          utilisée par la lettre éditoriale de la page Contact — les
          numéros là-bas sont une voix ; ici ils paraîtraient comme un
          gabarit sur un formulaire transactionnel. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        <Field
          name="firstName"
          label="Prénom"
          autoComplete="given-name"
          required
          value={details.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          error={errors.firstName}
        />
        <Field
          name="lastName"
          label="Nom"
          autoComplete="family-name"
          required
          value={details.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          error={errors.lastName}
        />
        <Field
          name="email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={details.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          helper="Nous y enverrons votre confirmation."
        />
        <Field
          name="phone"
          label="Téléphone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={details.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
          helper="Au cas où la réception doit vous joindre."
        />
        <Field
          name="arrivalTime"
          label="Heure d'arrivée"
          placeholder="ex. 14:00"
          autoComplete="off"
          value={details.arrivalTime ?? ""}
          onChange={(e) => update("arrivalTime", e.target.value)}
          helper="Optionnel — nous aide à préparer votre chambre."
          wrapperClassName="sm:col-span-2 md:col-span-1"
        />
      </div>

      <TextArea
        name="notes"
        label="Un mot pour la réception"
        placeholder="Allergies, anniversaires, un étage calme — tout ce que nous devrions savoir."
        rows={4}
        value={details.notes ?? ""}
        onChange={(e) => update("notes", e.target.value)}
      />

      {/* Acceptation pièce d'identité — requise au check-in. */}
      <div className="rounded-2xl border border-marine/20 bg-marine/[0.04] p-5 md:p-6">
        <div className="flex items-start gap-4">
          <span className="hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marine/10 text-marine">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-marine mb-2">
              Politique de check-in
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
                Je comprends que je devrai présenter une pièce d&apos;identité
                en règle à l&apos;arrivée.
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

      {/* Ligne CTA desktop */}
      <div className="hidden lg:flex items-center justify-between gap-6 pt-4">
        <p className="font-sans text-[12px] text-graybase max-w-sm">
          Nous ne partageons pas vos informations. Vous pourrez les modifier à
          l&apos;étape suivante.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group/cta inline-flex items-center justify-center gap-3 btn-text-md text-white bg-marine border border-marine rounded-full px-8 py-4 transition-colors duration-300 ease-out hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marine disabled:opacity-50"
        >
          Vers le récapitulatif
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
            strokeWidth={2.25}
          />
        </button>
      </div>

      {/* Barre d'action collante en bas (mobile) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-full bg-marine text-white btn-text-md transition-colors active:bg-marine/90 disabled:opacity-50"
        >
          Vers le récapitulatif
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}
