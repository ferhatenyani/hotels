"use client";

import { CalendarRange } from "lucide-react";

import { ReservationStatusPill } from "@/components/admin/Badge";
import { Column, DataTable } from "@/components/admin/DataTable";

import { fmtDA, fmtDate } from "@/lib/admin/format";
import type { Reservation } from "@/lib/admin/types";

export function GuestHistoryTab({ reservations }: { reservations: Reservation[] }) {
  const sorted = [...reservations].sort((a, b) =>
    b.checkIn.localeCompare(a.checkIn),
  );

  const columns: Column<Reservation>[] = [
    {
      key: "ref",
      header: "Référence",
      cell: (r) => <span className="tnum text-[var(--color-admin-text)]">{r.ref}</span>,
      width: "w-40",
    },
    {
      key: "period",
      header: "Période",
      cell: (r) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}
        </span>
      ),
    },
    {
      key: "room",
      header: "Chambre",
      cell: (r) => (
        <span className="tnum">
          {r.roomNumber ?? (
            <span className="text-[var(--color-admin-faint)]">non attribuée</span>
          )}
        </span>
      ),
      width: "w-24",
      align: "right",
      hideBelow: "md",
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => <ReservationStatusPill status={r.status} />,
      width: "w-32",
      align: "right",
    },
    {
      key: "total",
      header: "Total",
      cell: (r) => <span className="tnum">{fmtDA(r.totalDA)}</span>,
      width: "w-28",
      align: "right",
      hideBelow: "md",
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={sorted}
      rowKey={(r) => r.id}
      density="compact"
      emptyTitle="Aucun séjour"
      emptyBody={"Ce client n'a pas encore réservé chez nous."}
      className="ring-0 shadow-none border border-[var(--color-admin-border)]"
      emptyAction={
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-admin-muted)]">
          <CalendarRange className="size-3.5" aria-hidden />
          {"Une réservation apparaîtra ici dès qu'elle sera créée."}
        </span>
      }
    />
  );
}
