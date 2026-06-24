"use client";

import {
  BedDouble,
  CalendarPlus,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  LogIn,
  LogOut,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import {
  Badge,
  ReservationStatusPill,
  RoomStatusPill,
  TaskStatusPill,
} from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";

import { useSession } from "@/lib/admin/auth";
import { fmtDA, fmtDate, fmtRelative, fmtTime } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import type {
  Guest,
  Notification,
  Reservation,
  Room,
  Staff,
  Task,
} from "@/lib/admin/types";

export function DashboardClient() {
  const session = useSession();
  const [tick, setTick] = useState(0);

  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let active = true;
    void Promise.all([
      repo.rooms.list(),
      repo.reservations.list(),
      repo.tasks.list(),
      repo.guests.list(),
      repo.staff.list(),
      repo.notifications.list(session?.role),
    ])
      .then(([r, res, t, g, s, n]) => {
        if (!active) return;
        setRooms(r);
        setReservations(res);
        setTasks(t);
        setGuests(g);
        setStaff(s);
        setNotifs(n);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [session?.role, tick]);

  const kpis = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const dirty = rooms.filter((r) => r.status === "vacant-dirty").length;
    const ooo = rooms.filter((r) => r.status === "out-of-order").length;
    const occupancy = total === 0 ? 0 : Math.round((occupied / total) * 100);

    const todayIso = new Date().toISOString().slice(0, 10);
    const arrivals = reservations.filter(
      (r) =>
        r.checkIn === todayIso &&
        (r.status === "arrival-expected" || r.status === "confirmed"),
    );
    const departures = reservations.filter(
      (r) =>
        r.checkOut === todayIso &&
        (r.status === "departure-expected" || r.status === "checked-in"),
    );

    const inHouse = reservations
      .filter((r) => r.status === "checked-in")
      .reduce((sum, r) => sum + r.adults + r.children, 0);

    const adr = (() => {
      const active = reservations.filter(
        (r) => r.status === "checked-in" || r.status === "checked-out",
      );
      if (active.length === 0) return 0;
      const total = active.reduce((s, r) => s + r.ratePerNightDA, 0);
      return Math.round(total / active.length);
    })();

    return {
      total,
      occupied,
      dirty,
      ooo,
      occupancy,
      arrivals,
      departures,
      inHouse,
      adr,
    };
  }, [rooms, reservations]);

  const guestById = (id: string) => guests.find((g) => g.id === id);
  const staffById = (id?: string) =>
    id ? staff.find((s) => s.id === id) : undefined;

  // ─── Colonnes ────────────────────────────────────────────────────────

  const arrivalsCols: Column<Reservation>[] = [
    {
      key: "guest",
      header: "Client",
      cell: (r) => {
        const g = guestById(r.guestId);
        return (
          <AvatarChip
            firstName={g?.firstName}
            lastName={g?.lastName}
            subtitle={r.ref}
          />
        );
      },
    },
    {
      key: "time",
      header: "Heure",
      cell: (r) => (
        <span className="tnum text-[var(--color-admin-muted)]">
          {r.arrivalTime ?? "—"}
        </span>
      ),
      width: "w-20",
      hideBelow: "md",
    },
    {
      key: "room",
      header: "Chambre",
      cell: (r) => (
        <span className="tnum">
          {r.roomNumber ?? (
            <span className="text-[var(--color-admin-faint)]">à attribuer</span>
          )}
        </span>
      ),
      width: "w-24",
    },
    {
      key: "nights",
      header: "Nuits",
      cell: (r) => {
        const nights = Math.max(
          1,
          (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) /
            86_400_000,
        );
        return <span className="tnum">{nights}</span>;
      },
      width: "w-16",
      align: "right",
      hideBelow: "lg",
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => <ReservationStatusPill status={r.status} />,
      width: "w-32",
      align: "right",
    },
  ];

  const departuresCols: Column<Reservation>[] = [
    {
      key: "guest",
      header: "Client",
      cell: (r) => {
        const g = guestById(r.guestId);
        return (
          <AvatarChip
            firstName={g?.firstName}
            lastName={g?.lastName}
            subtitle={r.ref}
          />
        );
      },
    },
    {
      key: "room",
      header: "Chambre",
      cell: (r) => <span className="tnum">{r.roomNumber ?? "—"}</span>,
      width: "w-24",
    },
    {
      key: "balance",
      header: "Solde",
      cell: (r) => {
        const bal = r.totalDA - r.paidDA;
        return (
          <span
            className={`tnum ${bal > 0 ? "text-[var(--color-admin-warn-fg)]" : "text-[var(--color-admin-ok-fg)]"}`}
          >
            {bal > 0 ? fmtDA(bal) : "Soldé"}
          </span>
        );
      },
      align: "right",
      width: "w-32",
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => <ReservationStatusPill status={r.status} />,
      width: "w-32",
      align: "right",
    },
  ];

  const tasksCols: Column<Task>[] = [
    {
      key: "title",
      header: "Tâche",
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-[var(--color-admin-text)]">
            {t.title}
          </p>
          <p className="text-[11.5px] text-[var(--color-admin-muted)]">
            {t.kind === "housekeeping" ? "Ménage" : "Maintenance"}
            {t.roomNumber ? ` · ch. ${t.roomNumber}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "assigned",
      header: "Affectée à",
      cell: (t) => {
        const s = staffById(t.assignedTo);
        if (!s)
          return (
            <span className="text-[12px] text-[var(--color-admin-faint)]">
              Non assignée
            </span>
          );
        return <AvatarChip firstName={s.firstName} lastName={s.lastName} />;
      },
      width: "w-44",
      hideBelow: "md",
    },
    {
      key: "due",
      header: "Échéance",
      cell: (t) => (
        <span className="tnum text-[12px] text-[var(--color-admin-muted)]">
          {t.dueAt ? fmtRelative(t.dueAt) : "—"}
        </span>
      ),
      width: "w-28",
      align: "right",
      hideBelow: "lg",
    },
    {
      key: "status",
      header: "Statut",
      cell: (t) => <TaskStatusPill status={t.status} />,
      width: "w-28",
      align: "right",
    },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Bonne fin de nuit";
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  return (
    <>
      <PageHeader
        title={`${greeting}${session ? `, ${session.firstName}` : ""}.`}
        subtitle={
          <>
            {"Voici l'état de l'hôtel à "}
            <span className="tnum">{fmtTime(new Date())}</span>
            {". Réservations, chambres et équipe en un coup d'œil."}
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              href="/admin/reservations/calendrier"
              leftIcon={<CalendarPlus className="size-4" />}
            >
              Calendrier
            </Button>
            <Button
              variant="primary"
              size="sm"
              href="/admin/reservations/nouvelle"
              leftIcon={<KeyRound className="size-4" />}
            >
              Nouvelle réservation
            </Button>
          </>
        }
      />

      {status === "loading" ? (
        <>
          <LoadingState variant="kpis" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <LoadingState variant="rows" rows={4} />
            </Card>
            <Card>
              <LoadingState variant="rows" rows={4} />
            </Card>
          </div>
        </>
      ) : status === "error" ? (
        <Card>
          <ErrorState
            title="Impossible de charger le tableau de bord"
            body="Les données de l'hôtel n'ont pas pu être récupérées. Réessayez."
            onRetry={() => {
              setStatus("loading");
              setTick((t) => t + 1);
            }}
          />
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Taux d'occupation"
              value={`${kpis.occupancy} %`}
              helper={`${kpis.occupied} / ${kpis.total} chambres occupées`}
              delta="+4 pts"
              deltaLabel="vs hier"
              icon={<BedDouble className="size-4" />}
            />
            <StatTile
              label="Personnes en maison"
              value={kpis.inHouse}
              helper="adultes + enfants"
              icon={<Wallet className="size-4" />}
            />
            <StatTile
              label="ADR moyen"
              value={fmtDA(kpis.adr)}
              helper="prix par nuit · 30 derniers jours"
              delta="+2.1 %"
              deltaLabel="vs mois dernier"
              icon={<CreditCard className="size-4" />}
            />
            <StatTile
              label="Chambres à préparer"
              value={kpis.dirty}
              helper={`${kpis.ooo} hors service · à remettre en ordre`}
              deltaTone={kpis.dirty > 5 ? "warn" : "ok"}
              delta={kpis.dirty > 0 ? `${kpis.dirty}` : "—"}
              deltaLabel="à faire avant 14h"
              icon={<Sparkles className="size-4" />}
            />
          </div>

          {/* Today's flow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="size-4 text-[var(--color-admin-accent)]" />
                    Arrivées du jour
                  </span>
                }
                subtitle={`${kpis.arrivals.length} attendue${kpis.arrivals.length > 1 ? "s" : ""}`}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    href="/admin/reservations/arrivees"
                  >
                    Voir toutes
                  </Button>
                }
              />
              {kpis.arrivals.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="size-5" />}
                  title="Aucune arrivée prévue"
                  body={"Profitez du calme — la réception est à jour."}
                />
              ) : (
                <DataTable
                  columns={arrivalsCols}
                  rows={kpis.arrivals}
                  rowKey={(r) => r.id}
                  density="compact"
                  className="rounded-t-none border-0 ring-0 shadow-none"
                />
              )}
            </Card>

            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="size-4 text-[var(--color-admin-accent)]" />
                    Départs du jour
                  </span>
                }
                subtitle={`${kpis.departures.length} prévu${kpis.departures.length > 1 ? "s" : ""}`}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    href="/admin/reservations/departs"
                  >
                    Voir tous
                  </Button>
                }
              />
              {kpis.departures.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="size-5" />}
                  title="Aucun départ prévu"
                  body={"Tout le monde reste — la maison est complète."}
                />
              ) : (
                <DataTable
                  columns={departuresCols}
                  rows={kpis.departures}
                  rowKey={(r) => r.id}
                  density="compact"
                  className="rounded-t-none border-0 ring-0 shadow-none"
                />
              )}
            </Card>
          </div>

          {/* Floor strip + tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <BedDouble className="size-4 text-[var(--color-admin-accent)]" />
                    Plan des chambres
                  </span>
                }
                subtitle="État en temps réel · cliquez pour changer le statut"
                actions={
                  <Button variant="ghost" size="sm" href="/admin/chambres">
                    Tableau complet
                  </Button>
                }
              />
              <CardBody>
                <FloorGrid rooms={rooms} />
                <Legend />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <Wrench className="size-4 text-[var(--color-admin-accent)]" />
                    Tâches en cours
                  </span>
                }
                subtitle={`${tasks.filter((t) => t.status !== "done").length} à clôturer`}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    href="/admin/chambres/gouvernante"
                  >
                    Toutes les tâches
                  </Button>
                }
              />
              {tasks.filter((t) => t.status !== "done").length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="size-5" />}
                  title="Aucune tâche ouverte"
                  body={"L'équipe a tout traité. Bon timing pour souffler."}
                />
              ) : (
                <DataTable
                  columns={tasksCols}
                  rows={tasks.filter((t) => t.status !== "done").slice(0, 6)}
                  rowKey={(t) => t.id}
                  density="compact"
                  className="rounded-t-none border-0 ring-0 shadow-none"
                />
              )}
            </Card>
          </div>

          {/* Recent activity / notifications */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-4 text-[var(--color-admin-accent)]" />
                  Activité récente
                </span>
              }
              subtitle="Réservations, paiements et notifications"
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  href="/admin/exploitation/notifications"
                >
                  Tout voir
                </Button>
              }
            />
            <CardBody padded={false}>
              {notifs.length === 0 ? (
                <EmptyState
                  title="Rien à signaler"
                  body="Aucune activité récente sur votre périmètre."
                />
              ) : (
                <ul className="divide-y divide-[var(--color-admin-divider)]">
                  {notifs.slice(0, 6).map((n) => (
                    <li key={n.id}>
                      <Link
                        href={n.link ?? "#"}
                        className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--color-admin-sunken)]/60 transition-colors"
                      >
                        <Badge
                          tone={
                            n.severity === "danger"
                              ? "danger"
                              : n.severity === "warn"
                                ? "warn"
                                : "info"
                          }
                          small
                        >
                          {n.kind === "reservation"
                            ? "Réservation"
                            : n.kind === "task"
                              ? "Tâche"
                              : n.kind === "payment"
                                ? "Paiement"
                                : n.kind === "channel"
                                  ? "Canal"
                                  : "Système"}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-[var(--color-admin-text)] truncate">
                            {n.title}
                          </p>
                          {n.body ? (
                            <p className="text-[12px] text-[var(--color-admin-muted)] truncate">
                              {n.body}
                            </p>
                          ) : null}
                        </div>
                        <span className="text-[11.5px] text-[var(--color-admin-faint)] tnum shrink-0">
                          {fmtRelative(n.createdAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <p className="text-center text-[11px] text-[var(--color-admin-faint)] pt-2">
            Données de démonstration · {fmtDate(new Date())} · les modifications
            sont enregistrées sur ce poste
          </p>
        </>
      )}
    </>
  );
}

// ─── Floor grid (mini plan de chambres) ───────────────────────────────

function FloorGrid({ rooms }: { rooms: Room[] }) {
  const byFloor = rooms.reduce<Record<number, Room[]>>((acc, r) => {
    acc[r.floor] = acc[r.floor] ?? [];
    acc[r.floor].push(r);
    return acc;
  }, {});
  const floors = Object.keys(byFloor)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-3">
      {floors.map((floor) => (
        <div key={floor} className="flex items-start gap-3">
          <span className="w-8 pt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-admin-muted)] tnum">
            ét.&nbsp;{floor}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {byFloor[floor].map((r) => (
              <RoomTile key={r.number} room={r} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoomTile({ room }: { room: Room }) {
  const bg =
    room.status === "occupied"
      ? "bg-[var(--color-admin-solid-bg)] text-white"
      : room.status === "vacant-clean"
        ? "bg-[var(--color-admin-ok-bg)] text-[var(--color-admin-ok-fg)]"
        : room.status === "vacant-dirty"
          ? "bg-[var(--color-admin-amber-bg)] text-[var(--color-admin-amber-fg)]"
          : room.status === "inspection"
            ? "bg-[var(--color-admin-info-bg)] text-[var(--color-admin-info-fg)]"
            : room.status === "out-of-order"
              ? "bg-[var(--color-admin-danger-bg)] text-[var(--color-admin-danger-fg)]"
              : "bg-[var(--color-admin-violet-bg)] text-[var(--color-admin-violet-fg)]";
  return (
    <span
      className={`inline-flex h-7 w-10 items-center justify-center rounded-[var(--radius-admin-sm)] text-[11px] font-medium tnum ${bg}`}
      title={`Chambre ${room.number} · ${room.status}`}
    >
      {room.number}
    </span>
  );
}

function Legend() {
  const items: Array<{
    status: Parameters<typeof RoomStatusPill>[0]["status"];
  }> = [
    { status: "occupied" },
    { status: "vacant-clean" },
    { status: "vacant-dirty" },
    { status: "inspection" },
    { status: "maintenance" },
    { status: "out-of-order" },
  ];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {items.map(({ status }) => (
        <RoomStatusPill key={status} status={status} small />
      ))}
    </div>
  );
}
