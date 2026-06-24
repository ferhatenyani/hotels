"use client";

import { TaskStatusPill } from "@/components/admin/Badge";
import { EmptyState } from "@/components/admin/EmptyState";

import { taskStatusLabels, type Staff, type Task, type TaskStatus } from "@/lib/admin/types";

import { groupTasksByStatus } from "./helpers";
import { TaskCard } from "./TaskCard";

const COLUMN_ORDER: TaskStatus[] = ["pending", "in-progress", "blocked", "done"];

const COLUMN_HELPER: Record<TaskStatus, string> = {
  pending: "Tâches à prendre en charge.",
  "in-progress": "En cours d'exécution.",
  blocked: "Attente fournisseur, pièce ou décision.",
  done: "Terminées récemment.",
};

export function TaskBoard({
  tasks,
  staff,
  onSelect,
}: {
  tasks: Task[];
  staff: Staff[];
  onSelect: (task: Task) => void;
}) {
  const groups = groupTasksByStatus(tasks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMN_ORDER.map((status) => {
        const list = groups[status] ?? [];
        return (
          <section
            key={status}
            aria-label={taskStatusLabels[status]}
            className="flex flex-col rounded-xl bg-[var(--color-admin-sunken)]/50 ring-1 ring-[var(--color-admin-border)] p-3 min-h-[180px]"
          >
            <header className="flex items-center justify-between gap-2 px-1 pb-2.5">
              <div className="min-w-0 inline-flex items-center gap-2">
                <TaskStatusPill status={status} />
                <span className="text-[11.5px] text-[var(--color-admin-muted)] tnum">
                  {list.length}
                </span>
              </div>
            </header>
            <p className="px-1 pb-3 text-[11.5px] text-[var(--color-admin-faint)]">
              {COLUMN_HELPER[status]}
            </p>
            {list.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  title="Vide"
                  body="Rien dans cette colonne."
                  className="px-2 py-6"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2 flex-1">
                {list.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    staff={staff}
                    onClick={() => onSelect(t)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
