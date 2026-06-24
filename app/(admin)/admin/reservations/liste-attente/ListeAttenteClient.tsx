"use client";

import {
  AlertOctagon,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  ListChecks,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge, ReservationStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { useToast } from "@/components/admin/Toast";

import { fmtDate, fmtRelative } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  roomTypeLabels,
  type Guest,
  type Reservation,
  type Room,
  type RoomTypeCode,
} from "@/lib/admin/types";

import {
  dayOffset,
  isoDay,
  overlapsWindow,
} from "../_components/helpers";

const HORIZON_DAYS = 14;

export function ListeAttenteClient() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([repo.reservations.list(), repo.rooms.list(), repo.guests.list()])
      .then(([r, ro, g]) => {
        if (!mounted) return;
        setReservations(r);
        setRooms(ro);
        setGuests(g);
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

  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  // ─── Options ──────────────────────────────────────────────────────────
  const options = useMemo(
    () =>
      reservations
        .filter((r) => r.status === "option")
        .sort((a, b) => (a.holdUntil ?? "9999").localeCompare(b.holdUntil ?? "9999")),
    [reservations],
  );

  const [busyId, setBusyId] = useState<string | null>(null);

  const confirmOption = async (r: Reservation) => {
    setBusyId(r.id);
    try {
      await repo.reservations.update(r.id, { status: "confirmed" });
      toast.push({ tone: "ok", title: "Option confirmée", body: r.ref });
    } catch (err) {
      toast.push({
        tone: "danger",
        title: "Confirmation impossible",
        body: err instanceof Error ? err.message : "Erreur inconnue.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const cancelOption = async (r: Reservation) => {
    setBusyId(r.id);
    try {
      await repo.reservations.cancel(r.id);
      toast.push({ tone: "info", title: "Option annulée", body: r.ref });
    } catch (err) {
      toast.push({
        tone: "danger",
        title: "Annulation impossible",
        body: err instanceof Error ? err.message : "Erreur inconnue.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const optionCols: Column<Reservation>[] = [
    {
      key: "ref",
      header: "Référence",
      cell: (r) => (
        <span className="tnum text-[12.5px] font-medium">{r.ref}</span>
      ),
      width: "w-[150px]",
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
            subtitle={g?.phone ?? g?.email ?? ""}
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
      key: "period",
      header: "Séjour visé",
      cell: (r) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}
        </span>
      ),
      width: "w-[200px]",
      hideBelow: "lg",
    },
    {
      key: "hold",
      header: "Échéance d'option",
      cell: (r) => {
        if (!r.holdUntil) {
          return <span className="text-[12px] text-[var(--color-admin-faint)]">—</span>;
        }
        const diffDays =
          (new Date(r.holdUntil).getTime() - Date.now()) / 86_400_000;
        const tone: "warn" | "muted" | "danger" =
          diffDays < 0 ? "danger" : diffDays < 1 ? "warn" : "muted";
        return (
          <div className="text-right">
            <div className="tnum text-[12.5px] text-[var(--color-admin-text)]">
              {fmtDate(r.holdUntil)}
            </div>
            <Badge tone={tone} small>
              {fmtRelative(r.holdUntil)}
            </Badge>
          </div>
        );
      },
      align: "right",
      width: "w-[160px]",
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => cancelOption(r)}
            loading={busyId === r.id}
            leftIcon={<XCircle className="size-3.5" />}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => confirmOption(r)}
            loading={busyId === r.id}
            leftIcon={<BadgeCheck className="size-3.5" />}
          >
            Confirmer
          </Button>
        </div>
      ),
      align: "right",
      width: "w-[220px]",
    },
  ];

  // ─── Risque de surbooking ─────────────────────────────────────────────
  const overbooking = useMemo(() => {
    const today = new Date();
    const days: Array<{
      iso: string;
      conflicts: Array<{
        type: RoomTypeCode;
        capacity: number;
        booked: number;
        reservations: Reservation[];
      }>;
    }> = [];

    // Inventaire par type
    const inventory = new Map<RoomTypeCode, number>();
    for (const r of rooms) {
      if (r.status === "out-of-order" || r.status === "maintenance") continue;
      inventory.set(r.type, (inventory.get(r.type) ?? 0) + 1);
    }

    for (let i = 0; i < HORIZON_DAYS; i++) {
      const d = dayOffset(i, today);
      const iso = isoDay(d);
      const nextIso = isoDay(dayOffset(i + 1, today));
      const conflicts: Array<{
        type: RoomTypeCode;
        capacity: number;
        booked: number;
        reservations: Reservation[];
      }> = [];

      const activeOnDay = reservations.filter(
        (r) =>
          r.status !== "cancelled" &&
          r.status !== "no-show" &&
          r.status !== "checked-out" &&
          overlapsWindow(r, iso, nextIso),
      );

      const byType = new Map<RoomTypeCode, Reservation[]>();
      for (const r of activeOnDay) {
        const list = byType.get(r.roomType) ?? [];
        list.push(r);
        byType.set(r.roomType, list);
      }

      for (const [type, list] of byType.entries()) {
        const capacity = inventory.get(type) ?? 0;
        if (list.length > capacity) {
          conflicts.push({ type, capacity, booked: list.length, reservations: list });
        }
      }
      if (conflicts.length > 0) {
        days.push({ iso, conflicts });
      }
    }
    return days;
  }, [reservations, rooms]);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Réservations", href: "/admin/reservations" },
          { label: "Liste d'attente" },
        ]}
        title="Liste d'attente & surbooking"
        subtitle={"Suivi des options ouvertes et alerte sur les jours en risque de surbooking."}
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

      {/* Section 1 — Options */}
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <ListChecks className="size-4 text-marine" />
              Options à confirmer
            </span>
          }
          subtitle={
            options.length === 0
              ? "Aucune option en cours."
              : `${options.length} option${options.length > 1 ? "s" : ""} en attente — triée${options.length > 1 ? "s" : ""} par échéance.`
          }
        />
        {error ? (
          <ErrorState
            body={`Impossible de charger les options. ${error}`}
            onRetry={() => setTick((t) => t + 1)}
          />
        ) : loading ? (
          <LoadingState variant="rows" rows={3} />
        ) : options.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-5" />}
            title="Toutes les options sont traitées"
            body={"Les réservations en option apparaîtront ici dès qu'elles seront créées."}
          />
        ) : (
          <DataTable
            columns={optionCols}
            rows={options}
            rowKey={(r) => r.id}
            density="comfortable"
            className="rounded-t-none border-0 ring-0 shadow-none"
          />
        )}
      </Card>

      {/* Section 2 — Surbooking */}
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <AlertOctagon className="size-4 text-marine" />
              Risque de surbooking
            </span>
          }
          subtitle={`Analyse sur les ${HORIZON_DAYS} prochains jours.`}
        />
        <CardBody padded={false}>
          {error ? null : loading ? (
            <LoadingState variant="block" />
          ) : overbooking.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-5" />}
              title="Aucun risque de surbooking détecté"
              body={"Vous êtes bon — la répartition tient sur tous les jours analysés."}
              tone="ok"
            />
          ) : (
            <ul className="divide-y divide-[var(--color-admin-divider)]">
              {overbooking.map((day) => (
                <li key={day.iso} className="px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h3 className="text-[14px] font-medium text-[var(--color-admin-text)]">
                      <Clock className="inline size-3.5 mr-1.5 -translate-y-px text-[var(--color-admin-warn-fg)]" />
                      {fmtDate(day.iso)}
                    </h3>
                    <Badge tone="warn" small>
                      {day.conflicts.length} conflit{day.conflicts.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {day.conflicts.map((c) => (
                      <div
                        key={c.type}
                        className="rounded-[var(--radius-admin-md)] border border-[var(--color-admin-divider)] bg-[var(--color-admin-sunken)]/40 p-3"
                      >
                        <div className="flex items-baseline justify-between gap-3 mb-2">
                          <span className="text-[13px] font-medium text-[var(--color-admin-text)]">
                            {roomTypeLabels[c.type]}
                          </span>
                          <span className="text-[12px] tnum text-[var(--color-admin-warn-fg)]">
                            {c.booked} réservées · {c.capacity} disponibles
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {c.reservations.map((r) => {
                            const g = guestById.get(r.guestId);
                            return (
                              <li key={r.id}>
                                <Link
                                  href={`/admin/reservations/${r.id}`}
                                  className="flex items-center justify-between gap-3 px-2 py-1 rounded hover:bg-[var(--color-admin-panel)] transition-colors"
                                >
                                  <span className="flex items-center gap-2 min-w-0">
                                    <span className="tnum text-[11.5px] text-[var(--color-admin-muted)]">
                                      {r.ref}
                                    </span>
                                    <span className="text-[12.5px] text-[var(--color-admin-text)] truncate">
                                      {g ? `${g.firstName} ${g.lastName}` : "—"}
                                    </span>
                                  </span>
                                  <ReservationStatusPill status={r.status} small />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </>
  );
}
