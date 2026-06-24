"use client";

import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  KeyRound,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { DatePicker, Field, Input, RadioGroup, Select, Textarea } from "@/components/admin/form";
import { PageHeader } from "@/components/admin/PageHeader";
import { useToast } from "@/components/admin/Toast";

import { currentSession } from "@/lib/admin/auth";
import { fmtDA, fmtDate } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import {
  guestLanguageLabels,
  reservationSourceLabels,
  roomTypeLabels,
  type Guest,
  type GuestLanguage,
  type Rate,
  type ReservationSource,
  type ReservationStatus,
  type Room,
  type RoomTypeCode,
} from "@/lib/admin/types";

import { isoDay, nightsBetween } from "../_components/helpers";

type StayKind = "walk-in" | "ahead" | "group";

const STAY_KINDS: Array<{
  value: StayKind;
  label: string;
  helper: string;
  source: ReservationSource;
  status: ReservationStatus;
}> = [
  {
    value: "walk-in",
    label: "Walk-in (client présent)",
    helper:
      "Le client arrive sans réservation. On lui attribue immédiatement une chambre libre.",
    source: "walk-in",
    status: "checked-in",
  },
  {
    value: "ahead",
    label: "Réservation à l'avance",
    helper:
      "Le client a appelé, écrit ou réservé en ligne pour une date future.",
    source: "direct",
    status: "confirmed",
  },
  {
    value: "group",
    label: "Groupe (mariage, séminaire)",
    helper:
      "Plusieurs chambres pour un événement. Une référence de groupe relie les dossiers.",
    source: "direct",
    status: "confirmed",
  },
];

const TAXE_SEJOUR_DA = 300; // par personne et par nuit

export function NouvelleReservationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // ─── Données chargées une fois ─────────────────────────────────────────
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([repo.guests.list(), repo.rooms.list(), repo.rates.list()]).then(
      ([g, r, t]) => {
        if (!mounted) return;
        setGuests(g);
        setRooms(r);
        setRates(t);
        setLoaded(true);
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  // ─── État du formulaire ────────────────────────────────────────────────
  const [stayKind, setStayKind] = useState<StayKind>("ahead");
  const stayMeta = STAY_KINDS.find((k) => k.value === stayKind)!;

  // Section 2 — dates & occupants
  const now = new Date();
  const today = isoDay(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = isoDay(tomorrowDate);

  // Pré-remplissage depuis le calendrier (?checkIn=&checkOut=&room=).
  const initialCheckIn = searchParams.get("checkIn") ?? today;
  const initialCheckOut = searchParams.get("checkOut") ?? tomorrow;
  const initialRoom = searchParams.get("room") ?? "";

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [arrivalTime, setArrivalTime] = useState("");
  const [groupRef, setGroupRef] = useState("");

  // Section 3 — client
  const [guestMode, setGuestMode] = useState<"existing" | "new">("existing");
  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [newGuest, setNewGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    language: "fr" as GuestLanguage,
  });

  // Section 4 — chambre & tarif
  const [roomType, setRoomType] = useState<RoomTypeCode>("double");
  const [assignedRoom, setAssignedRoom] = useState<string>(initialRoom);
  const [notes, setNotes] = useState("");

  // Quand on a une chambre pré-remplie via URL et que les chambres arrivent,
  // on aligne aussi le type de chambre sur celui de la chambre choisie.
  // C'est de la synchronisation depuis une URL externe — légitime dans un effet.
  useEffect(() => {
    if (!initialRoom || rooms.length === 0) return;
    const found = rooms.find((r) => r.number === initialRoom);
    if (found) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoomType(found.type);
    }
  }, [initialRoom, rooms]);

  // ─── Calculs dérivés ──────────────────────────────────────────────────
  const nights = nightsBetween(checkIn, checkOut);

  const matchingGuests = useMemo(() => {
    const q = guestSearch.trim().toLowerCase();
    if (!q) return guests.slice(0, 6);
    return guests
      .filter((g) =>
        `${g.firstName} ${g.lastName} ${g.email} ${g.phone}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [guests, guestSearch]);

  const availableRoomTypes = useMemo(() => {
    const types = new Set<RoomTypeCode>();
    for (const r of rooms) types.add(r.type);
    return Array.from(types);
  }, [rooms]);

  const roomsForType = useMemo(
    () =>
      rooms
        .filter((r) => r.type === roomType && r.status === "vacant-clean")
        .sort((a, b) => a.number.localeCompare(b.number)),
    [rooms, roomType],
  );

  const ratePerNight = useMemo(() => {
    const matching = rates.filter((r) => r.roomType === roomType);
    if (matching.length === 0) {
      // Fallback : valeur moyenne par défaut.
      return 8_300;
    }
    // On choisit le tarif dont la fenêtre contient le check-in, sinon le
    // premier disponible — moyenne semaine / week-end.
    const inWindow = matching.find(
      (r) => r.startsOn <= checkIn && r.endsOn >= checkIn,
    );
    const pick = inWindow ?? matching[0];
    return Math.round((pick.weekdayDA + pick.weekendDA) / 2);
  }, [rates, roomType, checkIn]);

  const taxeDA = (adults + Math.max(0, children)) * nights * TAXE_SEJOUR_DA;
  const totalDA = ratePerNight * nights + taxeDA;

  // ─── Validation ────────────────────────────────────────────────────────
  const guestValid =
    guestMode === "existing"
      ? !!selectedGuestId
      : newGuest.firstName.trim().length > 0 && newGuest.lastName.trim().length > 0;

  const datesValid = checkOut > checkIn;
  const roomValid = stayKind === "walk-in" ? assignedRoom.length > 0 : true;
  const formValid = guestValid && datesValid && roomValid;

  // ─── Soumission ────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formValid || submitting) return;
    setSubmitting(true);
    try {
      const session = currentSession();
      const createdBy = session?.staffId ?? "user_marie";

      let guestId = selectedGuestId;
      if (guestMode === "new") {
        const created = await repo.guests.create({
          firstName: newGuest.firstName.trim(),
          lastName: newGuest.lastName.trim(),
          email: newGuest.email.trim(),
          phone: newGuest.phone.trim(),
          language: newGuest.language,
          preferences: [],
        });
        guestId = created.id;
      }
      if (!guestId) throw new Error("Client manquant.");

      const reservation = await repo.reservations.create({
        status: stayMeta.status,
        source: stayMeta.source,
        guestId,
        roomType,
        roomNumber: assignedRoom || undefined,
        checkIn,
        checkOut,
        adults,
        children,
        ratePerNightDA: ratePerNight,
        totalDA,
        paidDA: 0,
        addOnIds: [],
        arrivalTime: arrivalTime || undefined,
        notes: notes || undefined,
        groupRef: stayKind === "group" && groupRef ? groupRef : undefined,
        createdBy,
      });

      // Pour un walk-in, la chambre passe à occupée.
      if (stayKind === "walk-in" && assignedRoom) {
        await repo.reservations.checkIn(reservation.id, assignedRoom);
      }

      toast.push({
        tone: "ok",
        title: "Réservation créée",
        body: `Référence ${reservation.ref} · ${nights} nuit${nights > 1 ? "s" : ""}.`,
      });
      router.push(`/admin/reservations/${reservation.id}`);
    } catch (err) {
      toast.push({
        tone: "danger",
        title: "Création impossible",
        body: err instanceof Error ? err.message : "Erreur inconnue.",
      });
      setSubmitting(false);
    }
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Réservations", href: "/admin/reservations" },
          { label: "Nouvelle réservation" },
        ]}
        title="Nouvelle réservation"
        subtitle={
          "Créez un dossier — walk-in, réservation programmée ou groupe — en quelques étapes."
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            href="/admin/reservations"
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Retour à la liste
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        {/* ─── Section principale ──────────────────────────────────────── */}
        <div className="space-y-4">
          {/* 1 — Type de séjour */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <KeyRound className="size-4 text-marine" />
                  Type de séjour
                </span>
              }
              subtitle="Cette option ajuste les valeurs par défaut (source, statut, étapes)."
            />
            <CardBody>
              <RadioGroup<StayKind>
                name="stay-kind"
                value={stayKind}
                onChange={setStayKind}
                options={STAY_KINDS.map((k) => ({
                  value: k.value,
                  label: k.label,
                  helper: k.helper,
                }))}
              />
              {stayKind === "group" ? (
                <div className="mt-3">
                  <Field
                    label="Référence de groupe"
                    helper={"Toutes les chambres liées partageront ce code (ex: « Mariage Benali »)."}
                  >
                    <Input
                      value={groupRef}
                      onChange={(e) => setGroupRef(e.target.value)}
                      placeholder="Mariage Benali · 12 chambres"
                    />
                  </Field>
                </div>
              ) : null}
            </CardBody>
          </Card>

          {/* 2 — Dates & occupants */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-marine" />
                  Dates & occupants
                </span>
              }
              subtitle={`${nights} nuit${nights > 1 ? "s" : ""} · ${adults + children} personne${adults + children > 1 ? "s" : ""}`}
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Arrivée" htmlFor="ci" required>
                  <DatePicker
                    id="ci"
                    value={checkIn}
                    max={checkOut}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </Field>
                <Field label="Départ" htmlFor="co" required>
                  <DatePicker
                    id="co"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Adultes" htmlFor="ad" required>
                  <Stepper
                    id="ad"
                    value={adults}
                    min={1}
                    max={8}
                    onChange={setAdults}
                  />
                </Field>
                <Field label="Enfants" htmlFor="en">
                  <Stepper
                    id="en"
                    value={children}
                    min={0}
                    max={6}
                    onChange={setChildren}
                  />
                </Field>
                <Field label="Heure d'arrivée prévue" htmlFor="at" helper="Optionnel">
                  <Input
                    id="at"
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />
                </Field>
              </div>
              {!datesValid ? (
                <p className="text-[12px] text-[var(--color-admin-danger-fg)]">
                  La date de départ doit être postérieure à l&apos;arrivée.
                </p>
              ) : null}
            </CardBody>
          </Card>

          {/* 3 — Client */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Users className="size-4 text-marine" />
                  Client
                </span>
              }
              subtitle="Trouvez un client existant ou créez-en un nouveau."
              actions={
                <div className="inline-flex rounded-[var(--radius-admin-md)] ring-1 ring-[var(--color-admin-border-strong)] bg-[var(--color-admin-panel)] p-0.5">
                  {(
                    [
                      { id: "existing", label: "Client existant" },
                      { id: "new", label: "Nouveau client" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGuestMode(opt.id)}
                      className={`h-7 px-2.5 text-[11.5px] font-medium rounded transition-colors ${guestMode === opt.id ? "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)]" : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              }
            />
            <CardBody className="space-y-3">
              {guestMode === "existing" ? (
                <>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-admin-faint)]" />
                    <Input
                      placeholder="Rechercher par nom, e-mail ou téléphone…"
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="rounded-[var(--radius-admin-lg)] ring-1 ring-[var(--color-admin-border)] overflow-hidden">
                    {matchingGuests.length === 0 ? (
                      <div className="px-3 py-5 text-center text-[12.5px] text-[var(--color-admin-muted)]">
                        Aucun client ne correspond. Passez en mode {"« nouveau client »"}.
                      </div>
                    ) : (
                      <ul className="divide-y divide-[var(--color-admin-divider)] max-h-72 overflow-y-auto scroll-dark">
                        {matchingGuests.map((g) => {
                          const active = selectedGuestId === g.id;
                          return (
                            <li key={g.id}>
                              <button
                                type="button"
                                onClick={() => setSelectedGuestId(g.id)}
                                className={`w-full px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${active ? "bg-[var(--color-admin-ok-bg)]/40" : "hover:bg-[var(--color-admin-sunken)]"}`}
                              >
                                <AvatarChip
                                  firstName={g.firstName}
                                  lastName={g.lastName}
                                  subtitle={`${g.phone}${g.email ? ` · ${g.email}` : ""}`}
                                />
                                <span className="flex items-center gap-2">
                                  {g.loyaltyTier ? (
                                    <Badge tone="info" small>
                                      {g.loyaltyTier}
                                    </Badge>
                                  ) : null}
                                  {active ? (
                                    <Check className="size-4 text-marine" />
                                  ) : null}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Prénom" htmlFor="fn" required>
                      <Input
                        id="fn"
                        value={newGuest.firstName}
                        onChange={(e) =>
                          setNewGuest((g) => ({ ...g, firstName: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Nom" htmlFor="ln" required>
                      <Input
                        id="ln"
                        value={newGuest.lastName}
                        onChange={(e) =>
                          setNewGuest((g) => ({ ...g, lastName: e.target.value }))
                        }
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="E-mail" htmlFor="em">
                      <Input
                        id="em"
                        type="email"
                        value={newGuest.email}
                        onChange={(e) =>
                          setNewGuest((g) => ({ ...g, email: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Téléphone" htmlFor="ph">
                      <Input
                        id="ph"
                        type="tel"
                        value={newGuest.phone}
                        onChange={(e) =>
                          setNewGuest((g) => ({ ...g, phone: e.target.value }))
                        }
                        placeholder="+213 …"
                      />
                    </Field>
                  </div>
                  <Field label="Langue préférée" htmlFor="lg">
                    <Select
                      id="lg"
                      value={newGuest.language}
                      onChange={(e) =>
                        setNewGuest((g) => ({
                          ...g,
                          language: e.target.value as GuestLanguage,
                        }))
                      }
                    >
                      {(Object.keys(guestLanguageLabels) as GuestLanguage[]).map(
                        (l) => (
                          <option key={l} value={l}>
                            {guestLanguageLabels[l]}
                          </option>
                        ),
                      )}
                    </Select>
                  </Field>
                </div>
              )}
            </CardBody>
          </Card>

          {/* 4 — Chambre & tarif */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <BedDouble className="size-4 text-marine" />
                  Chambre & tarif
                </span>
              }
              subtitle={`Tarif détecté pour la période : ${fmtDA(ratePerNight)} / nuit`}
            />
            <CardBody className="space-y-4">
              <Field label="Type de chambre" required>
                <RadioGroup<RoomTypeCode>
                  name="room-type"
                  value={roomType}
                  onChange={(v) => {
                    setRoomType(v);
                    setAssignedRoom("");
                  }}
                  options={availableRoomTypes.map((rt) => ({
                    value: rt,
                    label: roomTypeLabels[rt],
                    helper: `${rooms.filter((r) => r.type === rt && r.status === "vacant-clean").length} libre${rooms.filter((r) => r.type === rt && r.status === "vacant-clean").length > 1 ? "s" : ""} aujourd'hui`,
                  }))}
                />
              </Field>

              <Field
                label="Attribuer une chambre précise"
                htmlFor="rn"
                helper={
                  stayKind === "walk-in"
                    ? "Obligatoire pour un walk-in."
                    : "Optionnel — peut être fait plus tard depuis le détail."
                }
                required={stayKind === "walk-in"}
              >
                <Select
                  id="rn"
                  value={assignedRoom}
                  onChange={(e) => setAssignedRoom(e.target.value)}
                >
                  <option value="">— Ne pas attribuer maintenant —</option>
                  {roomsForType.length === 0 ? (
                    <option value="" disabled>
                      Aucune chambre {"« libre & propre »"} de ce type
                    </option>
                  ) : (
                    roomsForType.map((r) => (
                      <option key={r.number} value={r.number}>
                        Chambre {r.number} · étage {r.floor}
                      </option>
                    ))
                  )}
                </Select>
              </Field>

              <Field label="Notes internes" htmlFor="nt">
                <Textarea
                  id="nt"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={"Particularités, demandes spéciales, allergies, etc."}
                />
              </Field>
            </CardBody>
          </Card>
        </div>

        {/* ─── Résumé latéral ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Récapitulatif" subtitle="Vérifiez avant validation." />
            <CardBody className="space-y-3">
              <SummaryRow
                label="Type de séjour"
                value={stayMeta.label}
                hint={`Source : ${reservationSourceLabels[stayMeta.source]}`}
              />
              <SummaryRow
                label="Dates"
                value={`${fmtDate(checkIn)} → ${fmtDate(checkOut)}`}
                hint={`${nights} nuit${nights > 1 ? "s" : ""}`}
              />
              <SummaryRow
                label="Occupants"
                value={`${adults} adulte${adults > 1 ? "s" : ""}${children > 0 ? ` · ${children} enfant${children > 1 ? "s" : ""}` : ""}`}
              />
              <SummaryRow
                label="Chambre"
                value={`${roomTypeLabels[roomType]}${assignedRoom ? ` · ch. ${assignedRoom}` : ""}`}
              />
              {loaded && guestMode === "existing" && selectedGuestId
                ? (() => {
                    const g = guests.find((x) => x.id === selectedGuestId);
                    return g ? (
                      <SummaryRow
                        label="Client"
                        value={`${g.firstName} ${g.lastName}`}
                        hint={g.phone}
                      />
                    ) : null;
                  })()
                : guestMode === "new" && newGuest.firstName && newGuest.lastName
                  ? (
                      <SummaryRow
                        label="Client (nouveau)"
                        value={`${newGuest.firstName} ${newGuest.lastName}`}
                        hint={newGuest.phone || newGuest.email}
                      />
                    )
                  : null}

              <div className="border-t border-[var(--color-admin-divider)] pt-3 space-y-1.5">
                <SummaryLine
                  label={`Hébergement · ${nights} nuit${nights > 1 ? "s" : ""}`}
                  value={fmtDA(ratePerNight * nights)}
                />
                <SummaryLine
                  label={`Taxe de séjour (${adults + children} pers × ${nights} nuit${nights > 1 ? "s" : ""})`}
                  value={fmtDA(taxeDA)}
                />
              </div>
              <div className="border-t border-[var(--color-admin-divider)] pt-3 flex items-baseline justify-between">
                <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--color-admin-muted)]">
                  Total
                </span>
                <span className="text-[22px] leading-7 font-semibold tracking-tight tnum text-[var(--color-admin-text)]">
                  {fmtDA(totalDA)}
                </span>
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-col gap-2 sticky bottom-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              loading={submitting}
              loadingLabel="Création en cours…"
              disabled={!formValid}
              leftIcon={<UserPlus className="size-4" />}
            >
              Créer la réservation
            </Button>
            <Button
              variant="ghost"
              size="sm"
              href="/admin/reservations"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Annuler
            </Button>
            {!formValid ? (
              <p className="text-[12px] text-[var(--color-admin-muted)] text-center">
                {!guestValid
                  ? "Choisissez ou créez un client pour continuer."
                  : !datesValid
                    ? "Vérifiez les dates de séjour."
                    : !roomValid
                      ? "Attribuez une chambre (walk-in)."
                      : ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sous-composants locaux ─────────────────────────────────────────────

function Stepper({
  id,
  value,
  min = 0,
  max = 99,
  onChange,
}: {
  id?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div
      id={id}
      className="inline-flex items-center h-9 rounded-[var(--radius-admin-md)] ring-1 ring-[var(--color-admin-border-strong)] bg-[var(--color-admin-panel)] overflow-hidden"
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        aria-label="Diminuer"
        className="h-9 w-9 inline-flex items-center justify-center text-[var(--color-admin-muted)] hover:bg-[var(--color-admin-sunken)] hover:text-[var(--color-admin-text)] transition-colors"
      >
        −
      </button>
      <span className="min-w-10 px-2 text-center text-[14px] font-medium tnum text-[var(--color-admin-text)]">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        aria-label="Augmenter"
        className="h-9 w-9 inline-flex items-center justify-center text-[var(--color-admin-muted)] hover:bg-[var(--color-admin-sunken)] hover:text-[var(--color-admin-text)] transition-colors"
      >
        +
      </button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[12px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)] pt-0.5 shrink-0">
        {label}
      </span>
      <span className="text-right min-w-0">
        <span className="block text-[13.5px] font-medium text-[var(--color-admin-text)] truncate">
          {value}
        </span>
        {hint ? (
          <span className="block text-[11.5px] text-[var(--color-admin-muted)] truncate">
            {hint}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
      <span className="text-[var(--color-admin-muted)]">{label}</span>
      <span className="tnum text-[var(--color-admin-text)]">{value}</span>
    </div>
  );
}
