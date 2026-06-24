"use client";

import { Badge } from "@/components/admin/Badge";
import { EmptyState } from "@/components/admin/EmptyState";
import { taskStatusTone } from "@/components/admin/tone";

import { taskStatusLabels, type Staff, type Task, type TaskStatus } from "@/lib/admin/types";

import { groupTasksByStatus, taskStatusIcon } from "./helpers";
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
    <div>
      {/* Affordance de défilement — visible uniquement sous md, là où les
          colonnes deviennent un carrousel horizontal à accrochage. */}
      <p className="mb-2 px-0.5 text-[11.5px] text-[var(--color-admin-faint)] md:hidden">
        Faites glisser horizontalement pour parcourir les colonnes.
      </p>

      {/*
        ≤ md : rangée horizontale défilante (snap), chaque colonne ~82vw pour
               que la suivante dépasse (indice visuel clair).
        md   : 2 colonnes en grille.
        xl   : 4 colonnes en grille.
      */}
      <div
        className={
          "-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-1 px-1 pb-2 scroll-dark " +
          "md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 " +
          "xl:grid-cols-4"
        }
      >
        {COLUMN_ORDER.map((status) => {
          const list = groups[status] ?? [];
          const Icon = taskStatusIcon[status];
          return (
            <section
              key={status}
              aria-label={taskStatusLabels[status]}
              className={
                "flex w-[82vw] shrink-0 snap-start flex-col rounded-[var(--radius-admin-lg)] " +
                "bg-[var(--color-admin-sunken)]/50 ring-1 ring-[var(--color-admin-border)] p-3 " +
                "min-h-[220px] sm:w-[60vw] md:w-auto md:shrink"
              }
            >
              <header className="flex items-center justify-between gap-2 px-1 pb-1.5">
                <div className="min-w-0 inline-flex items-center gap-2">
                  <Badge
                    tone={taskStatusTone[status]}
                    icon={<Icon strokeWidth={1.75} aria-hidden />}
                  >
                    {taskStatusLabels[status]}
                  </Badge>
                  <span className="text-[11.5px] text-[var(--color-admin-muted)] tnum">
                    {list.length}
                  </span>
                </div>
              </header>
              <p className="px-1 pb-3 text-[11.5px] text-[var(--color-admin-faint)]">
                {COLUMN_HELPER[status]}
              </p>
              {list.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <EmptyState
                    icon={<Icon className="size-5" strokeWidth={1.75} />}
                    title="Aucune tâche"
                    body="Rien dans cette colonne."
                    className="px-2 py-6"
                  />
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-2">
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
    </div>
  );
}
