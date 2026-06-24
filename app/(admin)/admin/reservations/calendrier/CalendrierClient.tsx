"use client";

import { ArrowLeft, CalendarX2, ChevronLeft, ChevronRight, KeyRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";

import { toneDot, toneFill } from "@/components/admin/tone";
import { reservationStatusTone } from "@/components/admin/tone";
import { fmtDate } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  reservationStatusLabels,
  roomStatusLabels,
  type Guest,
  type Reservation,
  type Room,
} from "@/lib/admin/types";

import { dayOffset, isoDay, spansDate } from "../_components/helpers";

const DAYS_AHEAD = 14;

export function CalendrierClient() {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [startIso, setStartIso] = useState<string>(() => isoDay(new Date()));
  const [floorFilter, setFloorFilter] = useState<"all" | number>("all");

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([repo.rooms.list(), repo.reservations.list(), repo.guests.list()])
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

  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  const floors = useMemo(() => {
    const s = new Set<number>();
    for (const r of rooms) s.add(r.floor);
    return Array.from(s).sort((a, b) => a - b);
  }, [rooms]);

  const visibleRooms = useMemo(() => {
    const list =
      floorFilter === "all"
        ? rooms
        : rooms.filter((r) => r.floor === floorFilter);
    return [...list].sort(
      (a, b) => a.floor - b.floor || a.number.localeCompare(b.number),
    );
  }, [rooms, floorFilter]);

  const days = useMemo<Date[]>(() => {
    const out: Date[] = [];
    const base = new Date(startIso);
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      out.push(d);
    }
    return out;
  }, [startIso]);

  // Index : pour chaque chambre, pour chaque jour, la réservation occupant la nuit.
  const lookup = useMemo(() => {
    const map = new Map<string, Map<string, Reservation>>();
    for (const r of rooms) map.set(r.number, new Map());
    for (const res of reservations) {
      if (!res.roomNumber) continue;
      if (res.status === "cancelled" || res.status === "no-show") continue;
      const target = map.get(res.roomNumber);
      if (!target) continue;
      for (const d of days) {
        const iso = isoDay(d);
        if (spansDate(res, iso)) target.set(iso, res);
      }
    }
    return map;
  }, [rooms, reservations, days]);

  const dayLabel = (d: Date) => {
    const wd = d.toLocaleDateString("fr-FR", { weekday: "short" });
    const dayN = d.getDate();
    return { wd: wd.replace(".", ""), dayN };
  };

  const isToday = (d: Date) => isoDay(d) === isoDay(new Date());
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  // Popover sur cellule libre.
  const [popover, setPopover] = useState<{
    roomNumber: string;
    iso: string;
  } | null>(null);

  const shiftStart = (delta: number) => {
    setStartIso((curr) => isoDay(dayOffset(delta, new Date(curr))));
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Réservations", href: "/admin/reservations" },
          { label: "Calendrier" },
        ]}
        title="Calendrier de disponibilité"
        subtitle={`14 jours · ${visibleRooms.length} chambre${visibleRooms.length > 1 ? "s" : ""} affichée${visibleRooms.length > 1 ? "s" : ""}`}
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

      {/* Barre de filtres — mobile-first : empilée et pleine largeur sur
          petit écran, puis répartie en ligne dès md:. */}
      <Card className="p-2.5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="inline-flex items-center self-start rounded-[var(--radius-admin-md)] ring-1 ring-[var(--color-admin-border-strong)] bg-[var(--color-admin-panel)] p-0.5">
            <button
              type="button"
              onClick={() => shiftStart(-7)}
              aria-label="Semaine précédente"
              className="size-10 sm:size-9 inline-flex items-center justify-center rounded text-[var(--color-admin-muted)] hover:bg-[var(--color-admin-sunken)] hover:text-[var(--color-admin-text)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setStartIso(isoDay(new Date()))}
              className="h-10 sm:h-9 px-3 text-[12px] font-medium rounded text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={() => shiftStart(7)}
              aria-label="Semaine suivante"
              className="size-10 sm:size-9 inline-flex items-center justify-center rounded text-[var(--color-admin-muted)] hover:bg-[var(--color-admin-sunken)] hover:text-[var(--color-admin-text)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <label htmlFor="cal-from" className="sr-only">
            Date de départ
          </label>
          <input
            id="cal-from"
            type="date"
            value={startIso}
            onChange={(e) => setStartIso(e.target.value)}
            className="h-10 sm:h-9 w-full sm:w-auto rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] border-0 px-2.5 text-[12.5px] tnum text-[var(--color-admin-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
          <label htmlFor="cal-floor" className="sr-only">
            Étage
          </label>
          <select
            id="cal-floor"
            value={floorFilter === "all" ? "all" : String(floorFilter)}
            onChange={(e) =>
              setFloorFilter(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="h-10 sm:h-9 w-full sm:w-auto rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] border-0 pl-2.5 pr-7 text-[12.5px] text-[var(--color-admin-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
          >
            <option value="all">Tous les étages</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                Étage {f}
              </option>
            ))}
          </select>
          <Legend />
        </div>
      </Card>

      {error ? (
        <Card>
          <ErrorState
            body={`Impossible de charger le calendrier. ${error}`}
            onRetry={() => setTick((t) => t + 1)}
          />
        </Card>
      ) : loading ? (
        <Card>
          <LoadingState variant="block" />
        </Card>
      ) : visibleRooms.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarX2 className="size-5" />}
            title="Aucune chambre à afficher"
            body={
              floorFilter === "all"
                ? "Aucune chambre n'est encore enregistrée. Ajoutez-en depuis le module Chambres."
                : "Aucune chambre sur cet étage. Choisissez « Tous les étages » pour élargir la vue."
            }
            action={
              floorFilter === "all" ? (
                <Button variant="secondary" size="sm" href="/admin/chambres">
                  Voir les chambres
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFloorFilter("all")}
                >
                  Tous les étages
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <span>Grille de disponibilité</span>
                <Badge tone="muted" small>
                  {fmtDate(days[0])} → {fmtDate(days[days.length - 1])}
                </Badge>
              </span>
            }
            subtitle="Survolez une nuit pour voir le détail. Cliquez sur une case libre pour pré-remplir une réservation."
          />
          <CardBody padded={false}>
            <div className="overflow-x-auto scroll-dark">
              <div className="inline-grid min-w-full" style={{ gridTemplateColumns: `120px repeat(${days.length}, minmax(48px, 1fr))` }}>
                {/* En-tête : numéros de jour */}
                <div className="sticky left-0 z-20 bg-[var(--color-admin-sunken)] border-b border-r border-[var(--color-admin-border)] h-12 px-3 flex items-center text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)]">
                  Chambre
                </div>
                {days.map((d) => {
                  const { wd, dayN } = dayLabel(d);
                  const today = isToday(d);
                  return (
                    <div
                      key={isoDay(d)}
                      className={`border-b border-r border-[var(--color-admin-border)] h-12 px-1 flex flex-col items-center justify-center text-center ${today ? "bg-[var(--color-admin-accent-soft)]" : isWeekend(d) ? "bg-[var(--color-admin-sunken)]/60" : "bg-[var(--color-admin-sunken)]"}`}
                    >
                      <span
                        className={`text-[9.5px] uppercase tracking-[0.05em] ${today ? "text-[var(--color-admin-accent)] font-semibold" : "text-[var(--color-admin-muted)]"}`}
                      >
                        {wd}
                      </span>
                      <span
                        className={`text-[12.5px] font-medium tnum ${today ? "text-[var(--color-admin-accent)]" : "text-[var(--color-admin-text)]"}`}
                      >
                        {dayN}
                      </span>
                    </div>
                  );
                })}

                {/* Lignes : une par chambre */}
                {visibleRooms.map((room, idx) => {
                  const roomMap = lookup.get(room.number) ?? new Map();
                  const stripeBg = idx % 2 === 0 ? "bg-[var(--color-admin-panel)]" : "bg-[var(--color-admin-sunken)]/30";
                  return (
                    <FloorRow
                      key={room.number}
                      room={room}
                      days={days}
                      roomMap={roomMap}
                      guestById={guestById}
                      stripeBg={stripeBg}
                      onCellClick={(iso, occupied) => {
                        if (occupied) return;
                        setPopover({ roomNumber: room.number, iso });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {popover ? (
        <CreatePopover
          info={popover}
          onClose={() => setPopover(null)}
          rooms={rooms}
        />
      ) : null}
    </>
  );
}

function FloorRow({
  room,
  days,
  roomMap,
  guestById,
  stripeBg,
  onCellClick,
}: {
  room: Room;
  days: Date[];
  roomMap: Map<string, Reservation>;
  guestById: Map<string, Guest>;
  stripeBg: string;
  onCellClick: (iso: string, occupied: boolean) => void;
}) {
  return (
    <>
      <div
        className={`sticky left-0 z-10 border-b border-r border-[var(--color-admin-border)] h-12 px-3 flex flex-col justify-center ${stripeBg}`}
      >
        <span className="text-[13px] font-medium tnum text-[var(--color-admin-text)]">
          ch. {room.number}
        </span>
        <span className="text-[11px] text-[var(--color-admin-muted)] truncate">
          ét. {room.floor} · {roomStatusLabels[room.status]}
        </span>
      </div>
      {days.map((d) => {
        const iso = isoDay(d);
        const res = roomMap.get(iso);
        const tone = res ? reservationStatusTone[res.status] : null;
        const g = res ? guestById.get(res.guestId) : null;
        const tooltip = res
          ? `${res.ref} · ${g ? `${g.firstName} ${g.lastName}` : "client"} · ${reservationStatusLabels[res.status]}`
          : "Cellule libre — cliquez pour créer une réservation";
        const occupied = !!res;
        return (
          <button
            type="button"
            key={`${room.number}-${iso}`}
            onClick={() => onCellClick(iso, occupied)}
            title={tooltip}
            aria-label={tooltip}
            className={`relative h-12 border-b border-r border-[var(--color-admin-border)] p-1 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-admin-accent)] ${stripeBg} ${occupied ? "cursor-grab active:cursor-grabbing" : "hover:bg-[var(--color-admin-sunken)] cursor-pointer"}`}
          >
            {res ? (
              <span
                className={`absolute inset-1 rounded flex items-center justify-center text-[10px] font-medium overflow-hidden ${toneFill[tone!]}`}
              >
                <span className="truncate px-1">
                  {g ? `${g.lastName}` : res.ref.slice(-5)}
                </span>
              </span>
            ) : null}
          </button>
        );
      })}
    </>
  );
}

function CreatePopover({
  info,
  onClose,
  rooms,
}: {
  info: { roomNumber: string; iso: string };
  onClose: () => void;
  rooms: Room[];
}) {
  const room = rooms.find((r) => r.number === info.roomNumber);
  const nextDay = (iso: string) => {
    const d = new Date(iso);
    d.setDate(d.getDate() + 1);
    return isoDay(d);
  };
  return (
    <Dialog
      open
      onClose={onClose}
      title="Créer une réservation"
      description={
        <>
          Chambre {info.roomNumber}
          {room ? ` · ${roomStatusLabels[room.status]}` : ""} · nuit du{" "}
          <span className="tnum">{fmtDate(info.iso)}</span>.
        </>
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            href={`/admin/reservations/nouvelle?checkIn=${info.iso}&checkOut=${nextDay(info.iso)}&room=${info.roomNumber}`}
            onClick={onClose}
            leftIcon={<KeyRound className="size-3.5" />}
          >
            Continuer
          </Button>
        </>
      }
    >
      <p className="text-[13px] text-[var(--color-admin-muted)]">
        Le formulaire de création s&apos;ouvrira pré-rempli avec cette chambre et
        cette nuit. Vous pourrez ajuster les dates et les occupants avant de
        valider.
      </p>
    </Dialog>
  );
}

function Legend() {
  const items: Array<{ label: string; tone: keyof typeof toneDot }> = [
    { label: "Confirmée", tone: "ok" },
    { label: "Option", tone: "warn" },
    { label: "Arrivée prévue", tone: "info" },
    { label: "Arrivée", tone: "solid" },
    { label: "Partie", tone: "muted" },
  ];
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {items.map((it) => (
        <Badge key={it.label} tone={it.tone} dot small>
          {it.label}
        </Badge>
      ))}
    </div>
  );
}
