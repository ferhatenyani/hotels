"use client";

import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { RoomStatusPill } from "@/components/admin/Badge";

import { roomStatusLabels, type Room } from "@/lib/admin/types";

import { groupRoomsByFloor, roomTileSurface, roomTypeShort } from "./helpers";

export function FloorPlan({
  rooms,
  onSelect,
  highlightedNumber,
}: {
  rooms: Room[];
  onSelect: (room: Room) => void;
  highlightedNumber?: string | null;
}) {
  const groups = groupRoomsByFloor(rooms);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl ring-1 ring-[var(--color-admin-border)] bg-[var(--color-admin-panel)] p-10 text-center">
        <p className="text-[13.5px] text-[var(--color-admin-muted)]">
          Aucune chambre ne correspond aux filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(({ floor, rooms: floorRooms }) => (
        <div
          key={floor}
          className="rounded-xl ring-1 ring-[var(--color-admin-border)] bg-[var(--color-admin-panel)] p-3 md:p-4"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-[var(--color-admin-sunken)] text-[var(--color-admin-muted)]">
                <Building2 className="size-3.5" />
              </span>
              <div>
                <p className="font-display text-[13px] tracking-tight text-[var(--color-admin-text)]">
                  {`Étage ${floor}`}
                </p>
                <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-admin-faint)] tnum">
                  {floorRooms.length} chambre{floorRooms.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <FloorSummary rooms={floorRooms} />
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-2">
            {floorRooms.map((r) => (
              <RoomTile
                key={r.number}
                room={r}
                onSelect={onSelect}
                highlighted={highlightedNumber === r.number}
              />
            ))}
          </div>
        </div>
      ))}

      <Legend />
    </div>
  );
}

function RoomTile({
  room,
  onSelect,
  highlighted,
}: {
  room: Room;
  onSelect: (room: Room) => void;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(room)}
      title={`Chambre ${room.number} — ${roomStatusLabels[room.status]}`}
      aria-label={`Chambre ${room.number}, ${roomStatusLabels[room.status]}, ${roomTypeShort[room.type]}`}
      className={cn(
        "group relative flex flex-col items-start justify-between gap-1 rounded-lg p-2 text-left",
        "transition-[transform,box-shadow] duration-150 ease-out",
        "hover:-translate-y-[1px] hover:shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
        roomTileSurface(room.status),
        highlighted &&
          "ring-2 ring-marine ring-offset-2 ring-offset-[var(--color-admin-panel)]",
      )}
    >
      <span className="flex w-full items-center justify-between">
        <span className="font-display tnum text-[15px] leading-none tracking-tight">
          {room.number}
        </span>
        <StatusDot status={room.status} />
      </span>
      <span className="block text-[10.5px] uppercase tracking-[0.06em] opacity-80">
        {roomTypeShort[room.type]}
      </span>
    </button>
  );
}

function StatusDot({ status }: { status: Room["status"] }) {
  const color =
    status === "occupied"
      ? "bg-white/80"
      : status === "vacant-clean"
        ? "bg-[var(--color-admin-ok-fg)]"
        : status === "vacant-dirty"
          ? "bg-[var(--color-admin-amber-fg)]"
          : status === "inspection"
            ? "bg-[var(--color-admin-info-fg)]"
            : status === "out-of-order"
              ? "bg-[var(--color-admin-danger-fg)]"
              : "bg-[var(--color-admin-violet-fg)]";
  return <span className={cn("inline-block size-1.5 rounded-full", color)} aria-hidden />;
}

function FloorSummary({ rooms }: { rooms: Room[] }) {
  const occ = rooms.filter((r) => r.status === "occupied").length;
  const free = rooms.filter((r) => r.status === "vacant-clean").length;
  return (
    <p className="text-[11.5px] text-[var(--color-admin-muted)] tnum">
      <span className="text-[var(--color-admin-text)] font-medium">{occ}</span>
      {" occ. · "}
      <span className="text-[var(--color-admin-text)] font-medium">{free}</span>
      {" libres"}
    </p>
  );
}

function Legend() {
  const items: Array<Room["status"]> = [
    "occupied",
    "vacant-clean",
    "vacant-dirty",
    "inspection",
    "maintenance",
    "out-of-order",
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 pt-1">
      {items.map((status) => (
        <RoomStatusPill key={status} status={status} small />
      ))}
    </div>
  );
}
