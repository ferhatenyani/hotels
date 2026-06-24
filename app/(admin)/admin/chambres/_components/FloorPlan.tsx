"use client";

import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/admin/Badge";
import { roomStatusTone } from "@/components/admin/tone";

import { roomStatusLabels, type Room } from "@/lib/admin/types";

import {
  groupRoomsByFloor,
  roomStatusIcon,
  roomTileSurface,
  roomTypeShort,
} from "./helpers";

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
      <div className="rounded-[var(--radius-admin-lg)] ring-1 ring-[var(--color-admin-border)] bg-[var(--color-admin-panel)] p-10 text-center">
        <p className="text-[13.5px] text-[var(--color-admin-muted)]">
          Aucune chambre ne correspond aux filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(({ floor, rooms: floorRooms }) => (
        <div
          key={floor}
          className="rounded-[var(--radius-admin-lg)] shadow-[var(--shadow-admin-sm)] ring-1 ring-[var(--color-admin-border)] bg-[var(--color-admin-panel)] p-4 md:p-5"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-[var(--radius-admin-sm)] bg-[var(--color-admin-sunken)] text-[var(--color-admin-muted)]">
                <Building2 className="size-3.5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-[13px] font-semibold tracking-tight text-[var(--color-admin-text)]">
                  {`Étage ${floor}`}
                </p>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-admin-faint)] tnum">
                  {floorRooms.length} chambre{floorRooms.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <FloorSummary rooms={floorRooms} />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(92px,1fr))] gap-2">
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
  const StatusIcon = roomStatusIcon[room.status];
  return (
    <button
      type="button"
      onClick={() => onSelect(room)}
      title={`Chambre ${room.number} — ${roomStatusLabels[room.status]}`}
      aria-label={`Chambre ${room.number}, ${roomStatusLabels[room.status]}, ${roomTypeShort[room.type]}`}
      className={cn(
        "group relative flex min-h-[60px] flex-col items-start justify-between gap-1.5 rounded-[var(--radius-admin-md)] p-2.5 text-left",
        "transition-[transform,box-shadow] duration-150 ease-out motion-reduce:transition-none",
        "hover:-translate-y-px hover:shadow-[var(--shadow-admin-sm)] motion-reduce:hover:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]",
        roomTileSurface(room.status),
        highlighted &&
          "ring-2 ring-[var(--color-admin-accent)] ring-offset-2 ring-offset-[var(--color-admin-panel)]",
      )}
    >
      <span className="flex w-full items-center justify-between gap-1">
        <span className="tnum text-[15px] font-semibold leading-none tracking-tight">
          {room.number}
        </span>
        <StatusIcon className="size-3.5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="block text-[10.5px] uppercase tracking-[0.06em] opacity-80">
        {roomTypeShort[room.type]}
      </span>
    </button>
  );
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
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-1 pt-1">
      {items.map((status) => {
        const Icon = roomStatusIcon[status];
        return (
          <Badge
            key={status}
            tone={roomStatusTone[status]}
            small
            icon={<Icon strokeWidth={1.75} aria-hidden />}
          >
            {roomStatusLabels[status]}
          </Badge>
        );
      })}
    </div>
  );
}
