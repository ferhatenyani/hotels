"use client";

import {
  CalendarPlus,
  CalendarRange,
  CheckCircle2,
  KeyRound,
  LogIn,
  LogOut,
  ListChecks,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge, ReservationStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { FilterChip, Toolbar } from "@/components/admin/Toolbar";

import { fmtDA, fmtDate } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  reservationSourceLabels,
  type Guest,
  type Reservation,
  type ReservationStatus,
} from "@/lib/admin/types";

import { byCheckInAsc, isoDay, nightsBetween, overlapsWindow } from "./helpers";

const STATUS_GROUPS: Array<{ id: ReservationStatus; label: string }> = [
  { id: "confirmed", label: "Confirmée" },
  { id: "option", label: "Option" },
  { id: "arrival-expected", label: "Arrivée prévue" },
  { id: "checked-in", label: "Arrivée" },
  { id: "departure-expected", label: "Départ prévu" },
  { id: "checked-out", label: "Partie" },
  { id: "cancelled", label: "Annulée" },
  { id: "no-show", label: "No-show" },
];

type PeriodFilter = "all" | "week" | "month" | "custom";

const PERIODS: Array<{ id: PeriodFilter; label: string }> = [
  { id: "all", label: "Toutes périodes" },
  { id: "week", label: "Cette semaine" },
  { id: "month", label: "Ce mois" },
  { id: "custom", label: "Période personnalisée" },
];

export function ReservationsListClient() {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([repo.reservations.list(), repo.guests.list()])
      .then(([r, g]) => {
        if (!mounted) return;
        setReservations(r);
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

  const [search, setSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Set<ReservationStatus>>(
    () => new Set(),
  );
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [customFrom, setCustomFrom] = useState<string>(() => isoDay(new Date()));
  const [customTo, setCustomTo] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return isoDay(d);
  });

  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  const periodWindow = useMemo<{ from: string; to: string } | null>(() => {
    if (period === "all") return null;
    if (period === "custom") return { from: customFrom, to: customTo };
    const today = new Date();
    if (period === "week") {
      // Lundi → dimanche de la semaine en cours
      const day = today.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const start = new Date(today);
      start.setDate(start.getDate() + mondayOffset);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { from: isoDay(start), to: isoDay(end) };
    }
    // mois en cours
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { from: isoDay(start), to: isoDay(end) };
  }, [period, customFrom, customTo]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations
      .filter((r) => {
        if (activeStatuses.size > 0 && !activeStatuses.has(r.status)) return false;
        if (periodWindow && !overlapsWindow(r, periodWindow.from, periodWindow.to))
          return false;
        if (q) {
          const g = guestById.get(r.guestId);
          const haystack = [
            r.ref,
            r.roomNumber ?? "",
            g ? `${g.firstName} ${g.lastName}` : "",
            g?.email ?? "",
            g?.phone ?? "",
            r.notes ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(byCheckInAsc);
  }, [reservations, search, activeStatuses, periodWindow, guestById]);

  const kpis = useMemo(() => {
    const today = isoDay(new Date());
    const arrivals = reservations.filter(
      (r) =>
        r.checkIn === today &&
        (r.status === "arrival-expected" || r.status === "confirmed"),
    ).length;
    const departures = reservations.filter(
      (r) =>
        r.checkOut === today &&
        (r.status === "departure-expected" || r.status === "checked-in"),
    ).length;
    const options = reservations.filter((r) => r.status === "option").length;
    const inHouse = reservations.filter((r) => r.status === "checked-in").length;
    return { arrivals, departures, options, inHouse, total: reservations.length };
  }, [reservations]);

  const columns: Column<Reservation>[] = [
    {
      key: "ref",
      header: "Référence",
      cell: (r) => (
        <span className="tnum text-[12.5px] font-medium text-[var(--color-admin-text)]">
          {r.ref}
        </span>
      ),
      width: "w-[160px]",
      sortable: true,
      sortFn: (a, b) => a.ref.localeCompare(b.ref),
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
      key: "room",
      header: "Chambre",
      cell: (r) =>
        r.roomNumber ? (
          <span className="tnum">{r.roomNumber}</span>
        ) : (
          <span className="text-[12px] text-[var(--color-admin-faint)]">
            à attribuer
          </span>
        ),
      width: "w-24",
    },
    {
      key: "period",
      header: "Période",
      cell: (r) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtDate(r.checkIn)}{" — "}{fmtDate(r.checkOut)}
        </span>
      ),
      width: "w-[200px]",
      hideBelow: "md",
      sortable: true,
      sortFn: (a, b) => a.checkIn.localeCompare(b.checkIn),
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
      sortable: true,
      sortFn: (a, b) =>
        nightsBetween(a.checkIn, a.checkOut) - nightsBetween(b.checkIn, b.checkOut),
    },
    {
      key: "source",
      header: "Source",
      cell: (r) => (
        <Badge tone="muted" small>
          {reservationSourceLabels[r.source]}
        </Badge>
      ),
      width: "w-[130px]",
      hideBelow: "lg",
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => <ReservationStatusPill status={r.status} />,
      width: "w-[140px]",
    },
    {
      key: "total",
      header: "Total",
      cell: (r) => <span className="tnum">{fmtDA(r.totalDA)}</span>,
      align: "right",
      width: "w-[120px]",
      sortable: true,
      sortFn: (a, b) => a.totalDA - b.totalDA,
    },
  ];

  const toggleStatus = (s: ReservationStatus) =>
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  return (
    <>
      <PageHeader
        title="Réservations"
        subtitle="Suivez l'ensemble des séjours — confirmés, en option, arrivées et départs."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              href="/admin/reservations/calendrier"
              leftIcon={<CalendarRange className="size-4" />}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Arrivées du jour"
          value={kpis.arrivals}
          helper={`sur ${kpis.total} dossiers actifs`}
          icon={<LogIn className="size-4" />}
        />
        <StatTile
          label="Départs du jour"
          value={kpis.departures}
          helper="à clôturer avant 12h"
          icon={<LogOut className="size-4" />}
        />
        <StatTile
          label="En maison"
          value={kpis.inHouse}
          helper="séjours en cours"
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatTile
          label="Options à confirmer"
          value={kpis.options}
          helper="réservations sous option"
          deltaTone={kpis.options > 0 ? "warn" : "ok"}
          icon={<ListChecks className="size-4" />}
        />
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher par référence, client, chambre…"
        filters={
          <>
            {STATUS_GROUPS.map((s) => (
              <FilterChip
                key={s.id}
                label={s.label}
                active={activeStatuses.has(s.id)}
                onClick={() => toggleStatus(s.id)}
                onClear={() => toggleStatus(s.id)}
              />
            ))}
          </>
        }
        trailing={
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="h-10 md:h-8 w-full md:w-auto rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] border-0 pl-2.5 pr-7 text-[12.5px] text-[var(--color-admin-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
            aria-label="Filtrer par période"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        }
      />

      {/* Période personnalisée — mobile-first : champs empilés pleine
          largeur, puis alignés en ligne dès sm:. */}
      {period === "custom" ? (
        <Card className="px-4 py-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label
              htmlFor="periode-debut"
              className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)]"
            >
              Du
            </label>
            <input
              id="periode-debut"
              type="date"
              value={customFrom}
              max={customTo}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-10 sm:h-8 w-full sm:w-auto rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] border-0 px-2.5 text-[12.5px] tnum text-[var(--color-admin-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
            />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label
              htmlFor="periode-fin"
              className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)]"
            >
              Au
            </label>
            <input
              id="periode-fin"
              type="date"
              value={customTo}
              min={customFrom}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-10 sm:h-8 w-full sm:w-auto rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] border-0 px-2.5 text-[12.5px] tnum text-[var(--color-admin-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
            />
          </div>
          <p className="text-[12px] text-[var(--color-admin-muted)] sm:ml-auto">
            {filtered.length} séjour{filtered.length > 1 ? "s" : ""} chevauchent
            cette fenêtre.
          </p>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <ErrorState
            body={`Impossible de charger les réservations. ${error}`}
            onRetry={() => setTick((t) => t + 1)}
          />
        </Card>
      ) : loading ? (
        <Card>
          <LoadingState variant="rows" rows={8} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarPlus className="size-5" />}
            title="Aucune réservation ne correspond"
            body={"Ajustez la recherche ou les filtres. Ou créez-en une nouvelle."}
            action={
              <Button
                variant="primary"
                size="sm"
                href="/admin/reservations/nouvelle"
                leftIcon={<KeyRound className="size-4" />}
              >
                Nouvelle réservation
              </Button>
            }
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          density="comfortable"
          onRowClick={(r) => {
            window.location.assign(`/admin/reservations/${r.id}`);
          }}
        />
      )}
    </>
  );
}
