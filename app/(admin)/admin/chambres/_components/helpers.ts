// Helpers partagés du domaine Chambres / Ménage / Maintenance.
// Aucun import depuis d'autres domaines — utilitaires purs.

import {
  type Room,
  type RoomStatus,
  type RoomTypeCode,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/admin/types";

import type { Tone } from "@/components/admin/tone";

// ─── Chambres ──────────────────────────────────────────────────────────

/** Libellé court pour la tuile (Single, Double, Twin, etc.). */
export const roomTypeShort: Record<RoomTypeCode, string> = {
  single: "Single",
  double: "Double",
  twin: "Twin",
  triple: "Triple",
  familiale: "Familiale",
  suite: "Suite",
  appartement: "Appart.",
};

/** Toutes les chambres regroupées par étage, triées du plus haut au plus bas. */
export function groupRoomsByFloor(rooms: Room[]): Array<{ floor: number; rooms: Room[] }> {
  const map = new Map<number, Room[]>();
  for (const r of rooms) {
    const list = map.get(r.floor) ?? [];
    list.push(r);
    map.set(r.floor, list);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([floor, list]) => ({
      floor,
      rooms: [...list].sort((a, b) => a.number.localeCompare(b.number)),
    }));
}

/** Étages distincts présents dans la liste, du plus bas au plus haut. */
export function distinctFloors(rooms: Room[]): number[] {
  return Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);
}

/** Statut humain ↔ tuile : couleur de surface plus saturée que la pastille. */
export function roomTileSurface(status: RoomStatus): string {
  switch (status) {
    case "occupied":
      return "bg-[var(--color-admin-solid-bg)] text-white ring-1 ring-[var(--color-admin-solid-bg)]/40";
    case "vacant-clean":
      return "bg-[var(--color-admin-ok-bg)] text-[var(--color-admin-ok-fg)] ring-1 ring-[var(--color-admin-ok-fg)]/15";
    case "vacant-dirty":
      return "bg-[var(--color-admin-amber-bg)] text-[var(--color-admin-amber-fg)] ring-1 ring-[var(--color-admin-amber-fg)]/15";
    case "inspection":
      return "bg-[var(--color-admin-info-bg)] text-[var(--color-admin-info-fg)] ring-1 ring-[var(--color-admin-info-fg)]/15";
    case "out-of-order":
      return "bg-[var(--color-admin-danger-bg)] text-[var(--color-admin-danger-fg)] ring-1 ring-[var(--color-admin-danger-fg)]/15";
    case "maintenance":
      return "bg-[var(--color-admin-violet-bg)] text-[var(--color-admin-violet-fg)] ring-1 ring-[var(--color-admin-violet-fg)]/15";
  }
}

// ─── Tâches ────────────────────────────────────────────────────────────

/** Mapping priorité → tone. */
export const taskPriorityTone: Record<TaskPriority, Tone> = {
  low: "muted",
  normal: "info",
  high: "warn",
  urgent: "danger",
};

/** Labels FR pour les priorités (raccourci d'import). */
export const taskPriorityLabelShort: Record<TaskPriority, string> = {
  low: "Faible",
  normal: "Normale",
  high: "Élevée",
  urgent: "Urgente",
};

/** Détermine si une tâche est en retard (échéance dépassée, non terminée). */
export function isOverdue(t: Task, nowMs: number = Date.now()): boolean {
  if (!t.dueAt) return false;
  if (t.status === "done") return false;
  return new Date(t.dueAt).getTime() < nowMs;
}

/** Détermine si une tâche a été complétée aujourd'hui (heure locale). */
export function wasDoneToday(t: Task, now: Date = new Date()): boolean {
  if (t.status !== "done" || !t.completedAt) return false;
  const completed = new Date(t.completedAt);
  return (
    completed.getFullYear() === now.getFullYear() &&
    completed.getMonth() === now.getMonth() &&
    completed.getDate() === now.getDate()
  );
}

/** Comparateur de tri : urgence d'abord, puis date d'échéance, puis création. */
export function byTaskUrgency(a: Task, b: Task): number {
  const order: Record<TaskPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
  const diff = order[a.priority] - order[b.priority];
  if (diff !== 0) return diff;
  if (a.dueAt && b.dueAt) return a.dueAt.localeCompare(b.dueAt);
  if (a.dueAt) return -1;
  if (b.dueAt) return 1;
  return a.createdAt.localeCompare(b.createdAt);
}

/** Tâches groupées par colonne (statut). */
export function groupTasksByStatus(
  tasks: Task[],
): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = {
    pending: [],
    "in-progress": [],
    done: [],
    blocked: [],
  };
  for (const t of tasks) groups[t.status].push(t);
  for (const key of Object.keys(groups) as TaskStatus[]) {
    groups[key].sort(byTaskUrgency);
  }
  return groups;
}
