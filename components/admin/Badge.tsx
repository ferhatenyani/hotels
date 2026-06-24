import { cn } from "@/lib/utils";

import {
  invoiceStatusTone,
  reservationStatusTone,
  roomStatusTone,
  taskStatusTone,
  toneDot,
  toneFill,
  type Tone,
} from "./tone";

import {
  invoiceStatusLabels,
  reservationStatusLabels,
  roomStatusLabels,
  taskStatusLabels,
  type InvoiceStatus,
  type ReservationStatus,
  type RoomStatus,
  type TaskStatus,
} from "@/lib/admin/types";

export type BadgeProps = {
  tone?: Tone;
  /** Petite pastille (12.5 px). Par défaut, true. */
  small?: boolean;
  /** Style « dot » : un disque coloré + texte (au lieu d'un fond plein). */
  dot?: boolean;
  /** Icône Lucide à gauche (size-3 ou size-3.5 recommandé). */
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Badge({
  tone = "muted",
  small = true,
  dot = false,
  icon,
  className,
  children,
}: BadgeProps) {
  if (dot) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-medium tnum",
          small ? "text-[11.5px]" : "text-[12.5px]",
          "text-[var(--color-admin-text)]",
          className,
        )}
      >
        <span className={cn("status-dot", toneDot[tone])} aria-hidden />
        {children}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium tracking-tight whitespace-nowrap",
        toneFill[tone],
        small ? "h-5 px-2 text-[10.5px]" : "h-6 px-2.5 text-[11.5px]",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// ─── Specialised wrappers ──────────────────────────────────────────────

export function RoomStatusPill({
  status,
  small,
  className,
}: {
  status: RoomStatus;
  small?: boolean;
  className?: string;
}) {
  return (
    <Badge tone={roomStatusTone[status]} small={small} className={className}>
      {roomStatusLabels[status]}
    </Badge>
  );
}

export function ReservationStatusPill({
  status,
  small,
  className,
}: {
  status: ReservationStatus;
  small?: boolean;
  className?: string;
}) {
  return (
    <Badge tone={reservationStatusTone[status]} small={small} className={className}>
      {reservationStatusLabels[status]}
    </Badge>
  );
}

export function InvoiceStatusPill({
  status,
  small,
  className,
}: {
  status: InvoiceStatus;
  small?: boolean;
  className?: string;
}) {
  return (
    <Badge tone={invoiceStatusTone[status]} small={small} className={className}>
      {invoiceStatusLabels[status]}
    </Badge>
  );
}

export function TaskStatusPill({
  status,
  small,
  className,
}: {
  status: TaskStatus;
  small?: boolean;
  className?: string;
}) {
  return (
    <Badge tone={taskStatusTone[status]} small={small} className={className}>
      {taskStatusLabels[status]}
    </Badge>
  );
}
