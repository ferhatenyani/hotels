// ConfirmationClient — reçoit une ref de réservation et résout
// l'instantané depuis localStorage `hdl:bookings`. Si l'utilisateur ouvre
// cette page sur un autre appareil (ou avec un navigateur effacé), on ne
// peut pas l'aider — on reste honnête et on le renvoie à la réception,
// fidèle à la promesse « nous confirmons chaque réservation nous-mêmes ».
//
// La mise en page de succès reprend le composant Confirmation de
// Contact.tsx : un petit sceau marine, un titre italique en display et un
// paragraphe de soutien discret. On empile les éléments pratiques
// (référence, dates, total, téléchargement ICS) en dessous.

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { Check, Copy, CalendarPlus, Phone, Mail } from "lucide-react";

import { Button } from "@/components/site/Button";
import { hotel, formatDA } from "@/lib/data/hotel";
import { getRoomBySlug } from "@/lib/data/rooms";
import { addOns as ALL_ADD_ONS } from "@/lib/booking/types";
import type { BookingSnapshot } from "@/lib/booking/types";

const BOOKINGS_KEY = "hdl:bookings";

type Props = {
  ref: string;
};

export default function ConfirmationClient({ ref: bookingRef }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [snapshot, setSnapshot] = useState<BookingSnapshot | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOOKINGS_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const list = JSON.parse(raw) as BookingSnapshot[];
      const match = list.find((b) => b.ref === bookingRef) ?? null;
      setSnapshot(match);
    } catch {
      /* ignore — null snapshot triggers the helpful fallback below */
    }
    setHydrated(true);
  }, [bookingRef]);

  const room = snapshot ? getRoomBySlug(snapshot.roomSlug) : undefined;
  const checkIn = snapshot?.checkIn ? parseISO(snapshot.checkIn) : undefined;
  const checkOut = snapshot?.checkOut
    ? parseISO(snapshot.checkOut)
    : undefined;

  const selectedAddOns = useMemo(
    () =>
      snapshot
        ? ALL_ADD_ONS.filter((a) => snapshot.addOnIds.includes(a.id))
        : [],
    [snapshot],
  );

  const onCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(bookingRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const icsHref = useMemo(() => {
    if (!snapshot || !room || !checkIn || !checkOut) return null;
    return buildIcsHref({
      ref: snapshot.ref,
      summary: `Séjour à ${hotel.name} — ${room.name}`,
      description: `Réservation ${snapshot.ref}. Voyageur principal : ${snapshot.guest.firstName} ${snapshot.guest.lastName}.`,
      location: `${hotel.name}, ${hotel.address.street}, ${hotel.address.postalCode} ${hotel.address.city}, ${hotel.address.country}`,
      start: checkIn,
      end: checkOut,
    });
  }, [snapshot, room, checkIn, checkOut]);

  if (!hydrated) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-live="polite">
        <div className="h-12 w-48 bg-ink/[0.05] rounded animate-pulse" />
        <div className="h-16 w-3/4 bg-ink/[0.05] rounded animate-pulse" />
        <div className="h-64 bg-ink/[0.05] rounded-2xl animate-pulse" />
      </div>
    );
  }

  // État « introuvable ».
  if (!snapshot || !room || !checkIn || !checkOut) {
    return (
      <section className="flex flex-col items-start gap-6 py-2">
        <div className="flex items-center gap-3">
          <span className="font-display text-[12px] tabular-nums text-marine tracking-tight">
            {bookingRef}
          </span>
        </div>
        <h1 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance">
          Nous n&apos;avons pas trouvé cette réservation dans votre navigateur.
        </h1>
        <p className="font-sans text-[15px] md:text-[16px] leading-[1.7] text-graybase max-w-[44ch]">
          Vous avez peut-être ouvert le lien sur un autre appareil, ou le
          stockage de votre navigateur a été vidé. Les vraies réservations
          sont à la réception — appelez-nous et nous vous retrouverons en un
          instant.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 btn-text-md text-white bg-marine border border-marine rounded-full px-6 py-3.5 min-h-[48px] hover:bg-marine/90 transition-colors"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} />
            {hotel.contact.phonePrimary}
          </a>
          <a
            href={`mailto:${hotel.contact.email}`}
            className="inline-flex items-center justify-center gap-2 btn-text-md text-ink border border-ink/30 rounded-full px-6 py-3.5 min-h-[48px] hover:bg-ink hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} />
            Écrire à la réception
          </a>
          <Link
            href="/booking/lookup"
            className="inline-flex items-center justify-center btn-text-md text-ink/70 hover:text-ink min-h-[48px] px-2 transition-colors"
          >
            Trouver une autre réservation
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article className="flex flex-col gap-8">
      {/* Sceau de succès — reprend le composant Confirmation de Contact.tsx */}
      <header className="flex flex-col items-start gap-6 pb-2">
        <div className="flex items-center gap-4">
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-marine/30">
            <span className="absolute inset-1 rounded-full bg-marine/10" />
            <Check
              className="relative h-4 w-4 text-marine"
              strokeWidth={2}
              aria-hidden
            />
          </span>
          <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-marine">
            Envoyée et scellée
          </p>
        </div>
        <h1 className="font-display text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.05] tracking-tight text-ink text-balance max-w-[24ch]">
          Votre réservation est sur le bureau.{" "}
          <span className="italic font-normal text-graybase">
            Nous vous attendons.
          </span>
        </h1>
        <p className="font-sans text-[15px] leading-[1.7] text-graybase max-w-[44ch]">
          Une copie a été enregistrée dans ce navigateur — en production, une
          vraie confirmation par e-mail suivrait. Si la date est proche,
          n&apos;hésitez pas à téléphoner directement à l&apos;hôtel.
        </p>
      </header>

      {/* Référence de réservation — grande, copiable */}
      <section
        aria-label="Référence de réservation"
        className="rounded-2xl border border-ink/10 bg-cream/30 p-5 md:p-7"
      >
        <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          Référence de réservation
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <p className="font-display text-[28px] xs:text-[32px] md:text-[42px] tracking-tight text-ink tabular-nums leading-none">
            {bookingRef}
          </p>
          <button
            type="button"
            onClick={onCopyRef}
            className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-4 py-2.5 min-h-[44px] btn-text-sm text-ink/75 hover:bg-ink hover:text-white hover:border-ink transition-colors"
            aria-live="polite"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
        <p className="mt-3 font-sans text-[12.5px] text-ink/55 leading-[1.6] max-w-[52ch]">
          Conservez-la en lieu sûr — vous pourrez retrouver votre réservation
          plus tard depuis n&apos;importe quel appareil sur la page de recherche.
        </p>
      </section>

      {/* Chambre + dates + total */}
      <section
        aria-label="Récapitulatif du séjour"
        className="rounded-2xl border border-ink/10 bg-white overflow-hidden"
      >
        <div className="relative h-[180px] md:h-[220px] bg-ink/5">
          <Image
            src={room.cover}
            alt={room.coverAlt}
            fill
            sizes="(max-width: 920px) 100vw, 920px"
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-ink/0"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-white/80">
              Votre chambre
            </p>
            <p className="mt-1.5 font-display text-[22px] md:text-[26px] font-medium text-white leading-tight tracking-tight">
              {room.name}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink/10">
          <SummaryStat
            label="Arrivée"
            value={format(checkIn, "EEE d MMM yyyy")}
            hint="À partir de 14h00"
          />
          <SummaryStat
            label="Départ"
            value={format(checkOut, "EEE d MMM yyyy")}
            hint="Avant 12h00"
          />
          <SummaryStat
            label="Voyageurs"
            value={
              snapshot.children > 0
                ? `${snapshot.adults} adulte${snapshot.adults === 1 ? "" : "s"} · ${snapshot.children} enfant${snapshot.children === 1 ? "" : "s"}`
                : `${snapshot.adults} adulte${snapshot.adults === 1 ? "" : "s"}`
            }
            hint={snapshot.guest.firstName + " " + snapshot.guest.lastName}
          />
        </dl>
        <div className="p-5 md:p-7 border-t border-ink/10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              Total · démo
            </p>
            <p className="mt-1.5 font-display text-[26px] md:text-[30px] font-semibold text-ink leading-none">
              {formatDA(snapshot.total)}
            </p>
            {selectedAddOns.length > 0 && (
              <p className="mt-2 font-sans text-[12.5px] text-ink/55">
                Inclut {selectedAddOns.length} supplément
                {selectedAddOns.length === 1 ? "" : "s"} :{" "}
                {selectedAddOns.map((a) => a.label).join(", ")}.
              </p>
            )}
          </div>
          {icsHref && (
            <a
              href={icsHref}
              download={`reservation-${bookingRef}.ics`}
              className="inline-flex items-center gap-2 rounded-full bg-marine text-white px-5 py-3 min-h-[44px] btn-text-sm hover:bg-marine/90 transition-colors"
            >
              <CalendarPlus className="h-4 w-4" strokeWidth={1.75} />
              Ajouter au calendrier
            </a>
          )}
        </div>
      </section>

      {/* Prochaines étapes pratiques */}
      <section
        aria-label="Et maintenant"
        className="rounded-2xl border border-ink/10 bg-white p-5 md:p-7"
      >
        <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          Et maintenant
        </p>
        <h2 className="mt-1.5 font-display text-[18px] md:text-[20px] font-medium text-ink leading-tight tracking-tight">
          Quelques notes pratiques.
        </h2>
        <ul className="mt-4 space-y-3 font-sans text-[14px] leading-[1.65] text-ink/75">
          <li>
            <span className="font-medium text-ink">Arrivée :</span> à partir
            de 14h00, à la réception, dans le hall. Merci d&apos;apporter une
            pièce d&apos;identité en règle.
          </li>
          <li>
            <span className="font-medium text-ink">Besoin de modifier ?</span>{" "}
            Téléphonez à la réception au{" "}
            <a
              href={`tel:${hotel.contact.phonePrimary.replace(/\s/g, "")}`}
              className="text-marine hover:underline"
            >
              {hotel.contact.phonePrimary}
            </a>{" "}
            — chaque réservation est gérée à la main.
          </li>
          <li>
            <span className="font-medium text-ink">Conservez votre référence</span>{" "}
            — vous pouvez{" "}
            <Link
              href="/booking/lookup"
              className="text-marine hover:underline"
            >
              retrouver votre réservation plus tard
            </Link>{" "}
            avec votre référence et votre e-mail.
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3 pb-4">
        <Button href="/" variant="primary" size="default" arrow>
          Retour à l&apos;hôtel
        </Button>
        <Button href="/booking/lookup" variant="secondary" size="default">
          Trouver une réservation
        </Button>
      </div>
    </article>
  );
}

function SummaryStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="p-5 md:p-6">
      <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
        {label}
      </p>
      <p className="mt-2 font-display text-[16px] md:text-[18px] font-medium text-ink leading-tight">
        {value}
      </p>
      {hint && (
        <p className="mt-1.5 font-sans text-[12px] text-ink/55">{hint}</p>
      )}
    </div>
  );
}

// --- ICS download builder --------------------------------------------------

type IcsInput = {
  ref: string;
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
};

/** Construit une URI data: pour un événement de calendrier .ics téléchargeable. */
function buildIcsHref({
  ref,
  summary,
  description,
  location,
  start,
  end,
}: IcsInput): string {
  // .ics attend des événements « toute la journée » en DATE au format
  // AAAAMMJJ. Les séjours d'hôtel correspondent naturellement à des
  // événements « toute la journée » ; DTEND est exclusif.
  const fmt = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");

  // Domaine extrait de l'e-mail de contact pour l'UID, qui doit ressembler
  // à une adresse selon RFC 5545.
  const emailDomain = hotel.contact.email.split("@")[1] ?? "notre-hotel.com";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${hotel.name}//Booking//FR`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ref}@${emailDomain}`,
    `DTSTAMP:${fmt(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${fmt(start)}`,
    `DTEND;VALUE=DATE:${fmt(end)}`,
    `SUMMARY:${escape(summary)}`,
    `LOCATION:${escape(location)}`,
    `DESCRIPTION:${escape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const ics = lines.join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
