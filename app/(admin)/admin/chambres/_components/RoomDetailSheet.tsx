"use client";

import {
  Ban,
  BedDouble,
  CalendarClock,
  Check,
  Eye,
  Save,
  Sparkles,
  User2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge, RoomStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Field, RadioGroup, Textarea } from "@/components/admin/form";
import { Sheet } from "@/components/admin/Sheet";
import { useToast } from "@/components/admin/Toast";

import { fmtDate, fmtRelative } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import {
  roomStatusLabels,
  roomTypeLabels,
  type Guest,
  type Reservation,
  type Room,
  type RoomStatus,
} from "@/lib/admin/types";

const STATUS_ORDER: RoomStatus[] = [
  "vacant-clean",
  "occupied",
  "vacant-dirty",
  "inspection",
  "maintenance",
  "out-of-order",
];

const STATUS_HELPER: Record<RoomStatus, string> = {
  "vacant-clean": "Prête à être remise au planning.",
  occupied: "Client en chambre — à attribuer manuellement (utiliser le check-in).",
  "vacant-dirty": "À nettoyer dès que possible.",
  inspection: "Inspection requise avant remise en vente.",
  maintenance: "Intervention en cours — temporairement indisponible.",
  "out-of-order": "Hors service — créera une indisponibilité durable.",
};

export function RoomDetailSheet({
  room,
  reservations,
  guests,
  onClose,
}: {
  /** Si défini, la sheet est ouverte. */
  room: Room | null;
  reservations: Reservation[];
  guests: Guest[];
  onClose: () => void;
}) {
  const toast = useToast();
  const [status, setStatus] = useState<RoomStatus>(room?.status ?? "vacant-clean");
  const [note, setNote] = useState<string>(room?.note ?? "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // À chaque ouverture d'une autre chambre, réinitialise les inputs.
  useEffect(() => {
    if (room) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(room.status);
      setNote(room.note ?? "");
    }
  }, [room]);

  const occupyingReservation = useMemo(() => {
    if (!room?.occupiedBy) return undefined;
    return reservations.find((r) => r.id === room.occupiedBy);
  }, [room, reservations]);

  const occupyingGuest = useMemo(() => {
    if (!occupyingReservation) return undefined;
    return guests.find((g) => g.id === occupyingReservation.guestId);
  }, [occupyingReservation, guests]);

  if (!room) {
    return (
      <Sheet
        open={false}
        onClose={onClose}
        title="Chambre"
        width="md"
      >
        {null}
      </Sheet>
    );
  }

  const dirty = status !== room.status;
  const noteDirty = (note ?? "") !== (room.note ?? "");

  const onSaveStatus = async () => {
    if (!dirty) return;
    setSavingStatus(true);
    try {
      await repo.rooms.setStatus(room.number, status, noteDirty ? note : undefined);
      toast.push({
        tone: "ok",
        title: "Statut mis à jour",
        body: `Chambre ${room.number} : ${roomStatusLabels[status]}.`,
      });
    } catch (e) {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: e instanceof Error ? e.message : "Impossible de modifier le statut.",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  const onSaveNote = async () => {
    if (!noteDirty) return;
    setSavingNote(true);
    try {
      await repo.rooms.setNote(room.number, note);
      toast.push({
        tone: "ok",
        title: "Note enregistrée",
      });
    } catch (e) {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: e instanceof Error ? e.message : "Impossible d'enregistrer la note.",
      });
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <Sheet
      open={!!room}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <BedDouble className="size-4 text-[var(--color-admin-accent)]" />
          Chambre <span className="tnum">{room.number}</span>
        </span>
      }
      description={
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{roomTypeLabels[room.type]}</span>
          <span className="text-[var(--color-admin-faint)]">·</span>
          <span>{`Étage ${room.floor}`}</span>
          {room.publicSlug ? (
            <>
              <span className="text-[var(--color-admin-faint)]">·</span>
              <Link
                href={`/rooms/${room.publicSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-admin-accent)] hover:underline"
              >
                Voir la fiche publique
              </Link>
            </>
          ) : null}
        </span>
      }
      width="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSaveStatus}
            disabled={!dirty}
            loading={savingStatus}
            loadingLabel="Enregistrement…"
            leftIcon={<Save className="size-4" />}
          >
            Enregistrer le statut
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Statut actuel */}
        <section className="rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)]/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)]">
              Statut actuel
            </span>
            <RoomStatusPill status={room.status} />
          </div>
          <p className="mt-2 text-[12.5px] text-[var(--color-admin-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Dernière fois nettoyée :{" "}
              <span className="text-[var(--color-admin-text)] tnum">
                {fmtRelative(room.lastCleanedAt)}
              </span>
            </span>
          </p>
          {room.status === "out-of-order" && room.availableFrom ? (
            <p className="mt-1 text-[12.5px] text-[var(--color-admin-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-3.5" />
                Remise à disposition prévue :{" "}
                <span className="text-[var(--color-admin-text)] tnum">
                  {fmtDate(room.availableFrom)}
                </span>
              </span>
            </p>
          ) : null}
        </section>

        {/* Occupant actuel */}
        {room.status === "occupied" && occupyingReservation ? (
          <section className="rounded-[var(--radius-admin-md)] ring-1 ring-[var(--color-admin-border)] p-3">
            <p className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)]">
              Occupant actuel
            </p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium text-[var(--color-admin-text)] inline-flex items-center gap-1.5">
                  <User2 className="size-3.5 text-[var(--color-admin-faint)]" />
                  {occupyingGuest
                    ? `${occupyingGuest.firstName} ${occupyingGuest.lastName}`
                    : "Client inconnu"}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--color-admin-muted)] tnum">
                  {occupyingReservation.ref} · {fmtDate(occupyingReservation.checkIn)} →{" "}
                  {fmtDate(occupyingReservation.checkOut)}
                </p>
              </div>
              <Link
                href={`/admin/reservations/${occupyingReservation.id}`}
                className="shrink-0 text-[12px] font-medium text-[var(--color-admin-accent)] hover:underline whitespace-nowrap"
              >
                Voir la réservation
              </Link>
            </div>
          </section>
        ) : null}

        {/* Changer de statut */}
        <Field
          label="Changer de statut"
          helper="Tout changement est journalisé localement. Validez avec « Enregistrer le statut »."
        >
          <RadioGroup<RoomStatus>
            name={`room-${room.number}-status`}
            value={status}
            onChange={setStatus}
            options={STATUS_ORDER.map((s) => ({
              value: s,
              label: (
                <span className="inline-flex items-center gap-2">
                  <StatusIcon status={s} />
                  {roomStatusLabels[s]}
                </span>
              ),
              helper: STATUS_HELPER[s],
            }))}
          />
        </Field>

        {/* Note interne */}
        <Field
          label="Note interne"
          helper="Visible uniquement par le personnel."
        >
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={"Ex : « climatisation à vérifier », « oreillers fermes demandés »…"}
            rows={3}
          />
          <div className="flex justify-end pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={onSaveNote}
              disabled={!noteDirty}
              loading={savingNote}
              loadingLabel="Enregistrement…"
            >
              Enregistrer la note
            </Button>
          </div>
        </Field>

        {/* Badge si maintenance / OOO */}
        {room.status === "maintenance" || room.status === "out-of-order" ? (
          <div className="rounded-[var(--radius-admin-md)] bg-[var(--color-admin-danger-bg)]/30 p-3">
            <Badge tone={room.status === "maintenance" ? "violet" : "danger"} small>
              {room.status === "maintenance" ? "Intervention en cours" : "Hors service"}
            </Badge>
            <p className="mt-2 text-[12.5px] text-[var(--color-admin-muted)]">
              Une tâche maintenance est probablement associée. Consultez{" "}
              <Link
                href="/admin/chambres/maintenance"
                className="text-[var(--color-admin-accent)] hover:underline"
                onClick={onClose}
              >
                la page Maintenance
              </Link>
              .
            </p>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}

function StatusIcon({ status }: { status: RoomStatus }) {
  const cls = "size-3.5";
  switch (status) {
    case "vacant-clean":
      return <Check className={cls} />;
    case "occupied":
      return <BedDouble className={cls} />;
    case "vacant-dirty":
      return <Sparkles className={cls} />;
    case "inspection":
      return <Eye className={cls} />;
    case "out-of-order":
      return <Ban className={cls} />;
    case "maintenance":
      return <Wrench className={cls} />;
  }
}
