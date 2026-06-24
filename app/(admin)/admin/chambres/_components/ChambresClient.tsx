"use client";

import {
  Banknote,
  BedDouble,
  LayoutGrid,
  List,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/admin/Button";
import { RoomStatusPill } from "@/components/admin/Badge";
import { Column, DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { FilterChip, Toolbar } from "@/components/admin/Toolbar";

import { fmtRelative } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  roomStatusLabels,
  roomTypeLabels,
  type Guest,
  type Reservation,
  type Room,
  type RoomStatus,
} from "@/lib/admin/types";

import { distinctFloors } from "./helpers";
import { FloorPlan } from "./FloorPlan";
import { RoomDetailSheet } from "./RoomDetailSheet";

type ViewMode = "plan" | "list";

const STATUS_FILTERS: RoomStatus[] = [
  "occupied",
  "vacant-clean",
  "vacant-dirty",
  "inspection",
  "maintenance",
  "out-of-order",
];

const VIEW_KEY = "admin:chambres:view:v1";

export function ChambresClient() {
  // ─── Données ─────────────────────────────────────────────────────────
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([
      repo.rooms.list(),
      repo.reservations.list(),
      repo.guests.list(),
    ])
      .then(([r, res, g]) => {
        if (!mounted) return;
        setRooms(r);
        setReservations(res);
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

  // ─── État UI ─────────────────────────────────────────────────────────
  const [view, setView] = useState<ViewMode>("plan");
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIEW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw === "plan" || raw === "list") setView(raw);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_KEY, view);
    } catch {}
  }, [view]);

  const [search, setSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Set<RoomStatus>>(
    () => new Set(),
  );
  const [activeFloor, setActiveFloor] = useState<number | null>(null);
  const [selected, setSelected] = useState<Room | null>(null);

  // Garde le « selected » synchrone avec le dernier état du store.
  const selectedRoom = useMemo(() => {
    if (!selected) return null;
    return rooms.find((r) => r.number === selected.number) ?? null;
  }, [selected, rooms]);

  // ─── Filtrage ────────────────────────────────────────────────────────
  const floors = useMemo(() => distinctFloors(rooms), [rooms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms
      .filter((r) => {
        if (activeStatuses.size > 0 && !activeStatuses.has(r.status)) return false;
        if (activeFloor !== null && r.floor !== activeFloor) return false;
        if (q) {
          const haystack = [
            r.number,
            roomTypeLabels[r.type],
            roomStatusLabels[r.status],
            r.note ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [rooms, search, activeStatuses, activeFloor]);

  // ─── KPIs (sur la totalité, pas filtré) ──────────────────────────────
  const kpis = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const vacantClean = rooms.filter((r) => r.status === "vacant-clean").length;
    const toClean = rooms.filter(
      (r) => r.status === "vacant-dirty" || r.status === "inspection",
    ).length;
    const unavailable = rooms.filter(
      (r) => r.status === "out-of-order" || r.status === "maintenance",
    ).length;
    return { total, occupied, vacantClean, toClean, unavailable };
  }, [rooms]);

  const toggleStatus = (s: RoomStatus) => {
    setActiveStatuses((curr) => {
      const next = new Set(curr);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const toggleFloor = (f: number) => {
    setActiveFloor((curr) => (curr === f ? null : f));
  };

  const clearFilters = () => {
    setSearch("");
    setActiveStatuses(new Set());
    setActiveFloor(null);
  };

  const filterCount = activeStatuses.size + (activeFloor !== null ? 1 : 0);

  // ─── Tableau (vue liste) ─────────────────────────────────────────────
  const columns: Column<Room>[] = [
    {
      key: "number",
      header: "N°",
      cell: (r) => (
        <span className="tnum font-medium text-[var(--color-admin-text)]">
          {r.number}
        </span>
      ),
      width: "w-20",
      sortable: true,
      sortFn: (a, b) => a.number.localeCompare(b.number),
    },
    {
      key: "floor",
      header: "Étage",
      cell: (r) => <span className="tnum">{r.floor}</span>,
      width: "w-20",
      align: "center",
      sortable: true,
      sortFn: (a, b) => a.floor - b.floor,
      hideBelow: "md",
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <span className="text-[var(--color-admin-text)]">{roomTypeLabels[r.type]}</span>
      ),
      hideBelow: "md",
      sortable: true,
      sortFn: (a, b) =>
        roomTypeLabels[a.type].localeCompare(roomTypeLabels[b.type]),
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => <RoomStatusPill status={r.status} />,
      width: "w-40",
      sortable: true,
      sortFn: (a, b) =>
        roomStatusLabels[a.status].localeCompare(roomStatusLabels[b.status]),
    },
    {
      key: "note",
      header: "Note",
      cell: (r) =>
        r.note ? (
          <span className="text-[12.5px] text-[var(--color-admin-muted)] line-clamp-1">
            {r.note}
          </span>
        ) : (
          <span className="text-[12px] text-[var(--color-admin-faint)]">—</span>
        ),
      hideBelow: "lg",
    },
    {
      key: "lastCleaned",
      header: "Dernière fois nettoyée",
      cell: (r) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtRelative(r.lastCleanedAt)}
        </span>
      ),
      width: "w-44",
      align: "right",
      hideBelow: "md",
      sortable: true,
      sortFn: (a, b) =>
        (a.lastCleanedAt ?? "").localeCompare(b.lastCleanedAt ?? ""),
    },
    {
      key: "action",
      header: <span className="sr-only">Action</span>,
      cell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(r);
          }}
        >
          Modifier
        </Button>
      ),
      width: "w-24",
      align: "right",
    },
  ];

  // ─── Rendu ───────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Chambres" },
        ]}
        title="État des chambres"
        subtitle="Tableau temps réel — vue plan ou liste, cliquez pour modifier."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              href="/admin/chambres/gouvernante"
              leftIcon={<Sparkles className="size-4" />}
            >
              Gouvernante
            </Button>
            <Button
              variant="secondary"
              size="sm"
              href="/admin/chambres/maintenance"
              leftIcon={<Wrench className="size-4" />}
            >
              Maintenance
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Occupées"
          value={kpis.occupied}
          helper={`sur ${kpis.total} chambres`}
          icon={<BedDouble className="size-4" />}
        />
        <StatTile
          label="Libres & propres"
          value={kpis.vacantClean}
          helper="prêtes à attribuer"
          icon={<Banknote className="size-4" />}
        />
        <StatTile
          label="À nettoyer"
          value={kpis.toClean}
          helper="ménage ou inspection"
          deltaTone={kpis.toClean > 5 ? "warn" : "ok"}
          icon={<Sparkles className="size-4" />}
        />
        <StatTile
          label="Indisponibles"
          value={kpis.unavailable}
          helper="hors service + maintenance"
          deltaTone={kpis.unavailable > 0 ? "danger" : "ok"}
          icon={<Wrench className="size-4" />}
        />
      </div>

      {/* Toolbar */}
      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Numéro, type, note…"
        filters={
          <>
            {STATUS_FILTERS.map((s) => (
              <FilterChip
                key={s}
                label={roomStatusLabels[s]}
                active={activeStatuses.has(s)}
                onClick={() => toggleStatus(s)}
                onClear={
                  activeStatuses.has(s) ? () => toggleStatus(s) : undefined
                }
              />
            ))}
            <span
              className="hidden md:inline-block h-5 w-px bg-[var(--color-admin-border)] mx-1"
              aria-hidden
            />
            {floors.map((f) => (
              <FilterChip
                key={f}
                label={`Étage ${f}`}
                active={activeFloor === f}
                onClick={() => toggleFloor(f)}
                onClear={activeFloor === f ? () => toggleFloor(f) : undefined}
              />
            ))}
            {filterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-8 items-center rounded-[var(--radius-admin-sm)] px-2 text-[12px] text-[var(--color-admin-muted)] underline-offset-2 transition-colors duration-150 hover:text-[var(--color-admin-text)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-admin-accent)]"
              >
                Tout effacer
              </button>
            ) : null}
          </>
        }
        trailing={<ViewToggle value={view} onChange={setView} />}
      />

      {/* Contenu */}
      {loading ? (
        view === "list" ? (
          <LoadingState variant="rows" rows={6} />
        ) : (
          <LoadingState variant="cards" />
        )
      ) : error ? (
        <ErrorState
          title="Chargement impossible"
          body={error}
          onRetry={() => setTick((t) => t + 1)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BedDouble className="size-5" />}
          title="Aucune chambre"
          body={
            search || filterCount > 0
              ? "Essayez d'effacer les filtres ou la recherche."
              : "Aucune chambre dans le système — vérifiez les seeds."
          }
          action={
            filterCount > 0 || search ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            ) : null
          }
        />
      ) : view === "plan" ? (
        <FloorPlan
          rooms={filtered}
          onSelect={setSelected}
          highlightedNumber={selectedRoom?.number ?? null}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.number}
          density="comfortable"
          onRowClick={setSelected}
          emptyTitle="Aucune chambre"
          emptyBody="Aucune chambre ne correspond aux filtres."
        />
      )}

      {/* Sheet de détail */}
      <RoomDetailSheet
        room={selectedRoom}
        reservations={reservations}
        guests={guests}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      className="inline-flex rounded-[var(--radius-admin-md)] ring-1 ring-[var(--color-admin-border-strong)] bg-[var(--color-admin-panel)] p-0.5"
      role="group"
      aria-label="Affichage"
    >
      {(
        [
          { value: "plan", label: "Plan", icon: LayoutGrid },
          { value: "list", label: "Liste", icon: List },
        ] as const
      ).map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-admin-sm)] px-3 text-[12.5px] font-medium transition-colors duration-150 md:h-8",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-admin-accent)]",
              active
                ? "bg-[var(--color-admin-accent-soft)] text-[var(--color-admin-accent)] ring-1 ring-inset ring-[var(--color-admin-accent)]/15"
                : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
