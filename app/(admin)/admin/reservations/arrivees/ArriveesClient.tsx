"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  KeyRound,
  LogIn,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge, ReservationStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { Field, Select } from "@/components/admin/form";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { useToast } from "@/components/admin/Toast";

import { fmtDA, fmtDate } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  reservationSourceLabels,
  roomTypeLabels,
  type Guest,
  type Reservation,
  type Room,
} from "@/lib/admin/types";

import { balanceDA, isoDay, nightsBetween } from "../_components/helpers";

export function ArriveesClient() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([repo.reservations.list(), repo.guests.list(), repo.rooms.list()])
      .then(([r, g, ro]) => {
        if (!mounted) return;
        setReservations(r);
        setGuests(g);
        setRooms(ro);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Erreur inconnue");
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tick]);

  const today = isoDay(new Date());

  const arrivalsAll = useMemo(
    () =>
      reservations
        .filter((r) => r.checkIn === today)
        .filter(
          (r) =>
            r.status === "arrival-expected" ||
            r.status === "confirmed" ||
            r.status === "checked-in",
        )
        .sort((a, b) =>
          (a.arrivalTime ?? "99:99").localeCompare(b.arrivalTime ?? "99:99"),
        ),
    [reservations, today],
  );

  const checkedIn = arrivalsAll.filter((r) => r.status === "checked-in").length;
  const remaining = arrivalsAll.length - checkedIn;

  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  // ─── Check-in dialog ───────────────────────────────────────────────────
  const [target, setTarget] = useState<Reservation | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const openDialog = (r: Reservation) => {
    setTarget(r);
    setSelectedRoom(r.roomNumber ?? "");
  };

  const closeDialog = () => {
    if (submitting) return;
    setTarget(null);
    setSelectedRoom("");
  };

  const roomsForCheckin = useMemo(() => {
    if (!target) return [];
    return rooms
      .filter((r) => r.type === target.roomType && r.status === "vacant-clean")
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [rooms, target]);

  const handleCheckIn = async () => {
    if (!target || !selectedRoom) return;
    setSubmitting(true);
    try {
      await repo.reservations.checkIn(target.id, selectedRoom);
      toast.push({
        tone: "ok",
        title: "Enregistrement effectué",
        body: `${target.ref} attribué à la chambre ${selectedRoom}.`,
      });
      setTarget(null);
      setSelectedRoom("");
    } catch (err) {
      toast.push({
        tone: "danger",
        title: "Check-in impossible",
        body: err instanceof Error ? err.message : "Erreur inconnue.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Colonnes ──────────────────────────────────────────────────────────
  const columns: Column<Reservation>[] = [
    {
      key: "time",
      header: "Heure",
      cell: (r) => (
        <span className="tnum text-[var(--color-admin-muted)]">
          <Clock className="inline size-3 mr-1 -translate-y-px text-[var(--color-admin-faint)]" />
          {r.arrivalTime ?? "—"}
        </span>
      ),
      width: "w-24",
    },
    {
      key: "guest",
      header: "Client",
      cell: (r) => {
        const g = guestById.get(r.guestId);
        return (
          <AvatarChip
            firstName={g?.firstName}
            lastName={g?.lastName}
            subtitle={`${r.ref}${g?.vip ? " · VIP" : ""}`}
          />
        );
      },
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <span className="text-[12.5px] text-[var(--color-admin-muted)]">
          {roomTypeLabels[r.roomType]}
        </span>
      ),
      width: "w-[160px]",
      hideBelow: "md",
    },
    {
      key: "occupants",
      header: "Occupants",
      cell: (r) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          <Users className="inline size-3 mr-1 -translate-y-px" />
          {r.adults + r.children}
        </span>
      ),
      width: "w-24",
      hideBelow: "lg",
      align: "right",
    },
    {
      key: "nights",
      header: "Nuits",
      cell: (r) => (
        <span className="tnum">{nightsBetween(r.checkIn, r.checkOut)}</span>
      ),
      width: "w-16",
      align: "right",
      hideBelow: "lg",
    },
    {
      key: "balance",
      header: "Payé / Total",
      cell: (r) => {
        const bal = balanceDA(r);
        return (
          <div className="text-right">
            <div className="tnum text-[12.5px] text-[var(--color-admin-text)]">
              {fmtDA(r.paidDA)} / {fmtDA(r.totalDA)}
            </div>
            <div
              className={`tnum text-[11px] ${bal > 0 ? "text-[var(--color-admin-warn-fg)]" : "text-[var(--color-admin-ok-fg)]"}`}
            >
              {bal > 0 ? `Reste ${fmtDA(bal)}` : "Soldé"}
            </div>
          </div>
        );
      },
      align: "right",
      width: "w-[170px]",
      hideBelow: "md",
    },
    {
      key: "source",
      header: "Source",
      cell: (r) => (
        <Badge tone="muted" small>
          {reservationSourceLabels[r.source]}
        </Badge>
      ),
      width: "w-[120px]",
      hideBelow: "lg",
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => <ReservationStatusPill status={r.status} />,
      width: "w-[120px]",
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (r) =>
        r.status === "checked-in" ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-[var(--color-admin-ok-fg)]">
            <CheckCircle2 className="size-3.5" />
            Enregistré
          </span>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => openDialog(r)}
            leftIcon={<KeyRound className="size-3.5" />}
          >
            Check-in
          </Button>
        ),
      align: "right",
      width: "w-[140px]",
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Réservations", href: "/admin/reservations" },
          { label: "Arrivées du jour" },
        ]}
        title="Arrivées du jour"
        subtitle={`Enregistrement des clients attendus le ${fmtDate(today)}.`}
        actions={
          <Button
            variant="ghost"
            size="sm"
            href="/admin/reservations"
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Toutes les réservations
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile
          label="Arrivées prévues"
          value={arrivalsAll.length}
          helper="aujourd'hui"
          icon={<LogIn className="size-4" />}
        />
        <StatTile
          label="Enregistrées"
          value={checkedIn}
          helper="déjà installées"
          icon={<CheckCircle2 className="size-4" />}
          deltaTone="ok"
        />
        <StatTile
          label="Restantes"
          value={remaining}
          helper="à enregistrer"
          icon={<Clock className="size-4" />}
          deltaTone={remaining > 0 ? "warn" : "ok"}
        />
      </div>

      {error ? (
        <Card>
          <ErrorState
            body={`Impossible de charger les arrivées. ${error}`}
            onRetry={() => setTick((t) => t + 1)}
          />
        </Card>
      ) : loading ? (
        <Card>
          <LoadingState variant="rows" rows={6} />
        </Card>
      ) : arrivalsAll.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckCircle2 className="size-5" />}
            title="Aucune arrivée aujourd'hui"
            body={"La journée s'annonce calme côté arrivées. Profitez-en pour préparer demain."}
            action={
              <Button
                variant="secondary"
                size="sm"
                href="/admin/reservations/calendrier"
              >
                Voir le calendrier
              </Button>
            }
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={arrivalsAll}
          rowKey={(r) => r.id}
          density="comfortable"
        />
      )}

      <Dialog
        open={!!target}
        onClose={closeDialog}
        title="Enregistrer l'arrivée"
        description={
          target
            ? `${target.ref} · ${roomTypeLabels[target.roomType]} · ${nightsBetween(target.checkIn, target.checkOut)} nuit${nightsBetween(target.checkIn, target.checkOut) > 1 ? "s" : ""}`
            : ""
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closeDialog} disabled={submitting}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCheckIn}
              loading={submitting}
              loadingLabel="Enregistrement…"
              disabled={!selectedRoom}
              leftIcon={<KeyRound className="size-4" />}
            >
              Confirmer le check-in
            </Button>
          </>
        }
      >
        {target ? (
          <div className="space-y-4">
            <div className="rounded-md bg-[var(--color-admin-sunken)] p-3 space-y-1">
              <div className="text-[12.5px] text-[var(--color-admin-text)] font-medium">
                {(() => {
                  const g = guestById.get(target.guestId);
                  return g ? `${g.firstName} ${g.lastName}` : "Client inconnu";
                })()}
              </div>
              <div className="text-[11.5px] text-[var(--color-admin-muted)] tnum">
                {fmtDate(target.checkIn)} → {fmtDate(target.checkOut)} · {target.adults}{" "}
                adulte{target.adults > 1 ? "s" : ""}
                {target.children > 0 ? ` · ${target.children} enfant${target.children > 1 ? "s" : ""}` : ""}
              </div>
              {balanceDA(target) > 0 ? (
                <div className="text-[11.5px] text-[var(--color-admin-warn-fg)] tnum">
                  Solde à percevoir : {fmtDA(balanceDA(target))}
                </div>
              ) : null}
            </div>
            <Field
              label="Chambre à attribuer"
              required
              htmlFor="checkin-room"
              helper={
                roomsForCheckin.length === 0
                  ? "Aucune chambre libre & propre pour ce type. Vérifiez l'état des chambres."
                  : `${roomsForCheckin.length} chambre${roomsForCheckin.length > 1 ? "s" : ""} disponible${roomsForCheckin.length > 1 ? "s" : ""}.`
              }
            >
              <Select
                id="checkin-room"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={roomsForCheckin.length === 0}
              >
                <option value="">— Sélectionnez une chambre —</option>
                {roomsForCheckin.map((r) => (
                  <option key={r.number} value={r.number}>
                    Chambre {r.number} · étage {r.floor}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
