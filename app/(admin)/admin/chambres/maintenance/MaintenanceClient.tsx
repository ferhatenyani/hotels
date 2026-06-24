"use client";

import {
  AlertOctagon,
  Ban,
  BedDouble,
  CheckCircle2,
  ExternalLink,
  Plus,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Avatar } from "@/components/admin/AvatarChip";
import { Badge, TaskStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { FilterChip, Toolbar } from "@/components/admin/Toolbar";

import { fmtDate, fmtRelative } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  roomStatusLabels,
  taskPriorityLabels,
  taskStatusLabels,
  type Room,
  type Staff,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/admin/types";

import {
  isOverdue,
  taskPriorityTone,
  wasDoneToday,
} from "../_components/helpers";
import { TaskBoard } from "../_components/TaskBoard";
import { TaskCreateDialog } from "../_components/TaskCreateDialog";
import { TaskDetailSheet } from "../_components/TaskDetailSheet";

type ViewMode = "board" | "list";

const STATUS_FILTERS: TaskStatus[] = ["pending", "in-progress", "blocked", "done"];
const PRIORITY_FILTERS: TaskPriority[] = ["urgent", "high", "normal", "low"];
const VIEW_KEY = "admin:maintenance:view:v1";
const ASSIGN_ROLES = ["manager", "direction"] as const;

export function MaintenanceClient() {
  // ─── Données ─────────────────────────────────────────────────────────
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([repo.tasks.list(), repo.staff.list(), repo.rooms.list()])
      .then(([t, s, r]) => {
        if (!mounted) return;
        setTasks(t);
        setStaff(s);
        setRooms(r);
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
  const [view, setView] = useState<ViewMode>("board");
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIEW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw === "board" || raw === "list") setView(raw);
      else {
        const mobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        setView(mobile ? "list" : "board");
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_KEY, view);
    } catch {}
  }, [view]);

  const [search, setSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Set<TaskStatus>>(
    () => new Set(),
  );
  const [activePriorities, setActivePriorities] = useState<Set<TaskPriority>>(
    () => new Set(),
  );
  const [selected, setSelected] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const selectedTask = useMemo(() => {
    if (!selected) return null;
    return tasks.find((t) => t.id === selected.id) ?? null;
  }, [selected, tasks]);

  // ─── Filtrage ────────────────────────────────────────────────────────
  const maintenanceTasks = useMemo(
    () => tasks.filter((t) => t.kind === "maintenance"),
    [tasks],
  );

  const unavailableRooms = useMemo(
    () =>
      rooms
        .filter((r) => r.status === "out-of-order" || r.status === "maintenance")
        .sort((a, b) => a.number.localeCompare(b.number)),
    [rooms],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return maintenanceTasks.filter((t) => {
      if (activeStatuses.size > 0 && !activeStatuses.has(t.status)) return false;
      if (activePriorities.size > 0 && !activePriorities.has(t.priority))
        return false;
      if (q) {
        const assignee = staff.find((s) => s.id === t.assignedTo);
        const haystack = [
          t.title,
          t.body ?? "",
          t.roomNumber ?? "",
          assignee ? `${assignee.firstName} ${assignee.lastName}` : "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [maintenanceTasks, search, activeStatuses, activePriorities, staff]);

  const kpis = useMemo(() => {
    const open = maintenanceTasks.filter((t) => t.status !== "done").length;
    const urgent = maintenanceTasks.filter(
      (t) => t.priority === "urgent" && t.status !== "done",
    ).length;
    const overdue = maintenanceTasks.filter((t) => isOverdue(t)).length;
    const doneToday = maintenanceTasks.filter((t) => wasDoneToday(t)).length;
    return { open, urgent, overdue, doneToday };
  }, [maintenanceTasks]);

  const findTaskForRoom = (roomNumber: string) =>
    maintenanceTasks
      .filter((t) => t.roomNumber === roomNumber && t.status !== "done")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const toggleStatus = (s: TaskStatus) =>
    setActiveStatuses((curr) => {
      const next = new Set(curr);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const togglePriority = (p: TaskPriority) =>
    setActivePriorities((curr) => {
      const next = new Set(curr);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  const clearFilters = () => {
    setSearch("");
    setActiveStatuses(new Set());
    setActivePriorities(new Set());
  };

  const filterCount = activeStatuses.size + activePriorities.size;

  // ─── Colonnes liste ──────────────────────────────────────────────────
  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "Incident",
      cell: (t) => (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-[13.5px] font-medium text-[var(--color-admin-text)]",
              t.status === "blocked" &&
                "underline decoration-[var(--color-admin-danger-fg)] decoration-2 underline-offset-4",
            )}
          >
            {t.title}
          </p>
          {t.body ? (
            <p className="truncate text-[12px] text-[var(--color-admin-muted)]">
              {t.body}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "room",
      header: "Chambre",
      cell: (t) => (
        <span className="tnum">
          {t.roomNumber ?? <span className="text-[var(--color-admin-faint)]">—</span>}
        </span>
      ),
      width: "w-24",
      align: "center",
    },
    {
      key: "priority",
      header: "Priorité",
      cell: (t) => (
        <Badge tone={taskPriorityTone[t.priority]} small>
          {taskPriorityLabels[t.priority]}
        </Badge>
      ),
      width: "w-28",
      hideBelow: "md",
    },
    {
      key: "assignee",
      header: "Affectée à",
      cell: (t) => {
        const s = staff.find((x) => x.id === t.assignedTo);
        if (!s)
          return (
            <span className="text-[12px] italic text-[var(--color-admin-faint)]">
              Non assignée
            </span>
          );
        return (
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <Avatar firstName={s.firstName} lastName={s.lastName} size="xs" />
            <span className="truncate text-[13px] text-[var(--color-admin-text)]">
              {s.firstName} {s.lastName}
            </span>
          </span>
        );
      },
      width: "w-48",
      hideBelow: "md",
    },
    {
      key: "due",
      header: "Échéance",
      cell: (t) => {
        const overdue = isOverdue(t);
        return (
          <span
            className={cn(
              "tnum text-[12.5px]",
              overdue
                ? "text-[var(--color-admin-danger-fg)] font-medium"
                : "text-[var(--color-admin-muted)]",
            )}
          >
            {t.dueAt ? fmtRelative(t.dueAt) : "—"}
          </span>
        );
      },
      width: "w-32",
      align: "right",
      hideBelow: "lg",
    },
    {
      key: "status",
      header: "Statut",
      cell: (t) => <TaskStatusPill status={t.status} />,
      width: "w-32",
      align: "right",
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Chambres", href: "/admin/chambres" },
          { label: "Maintenance" },
        ]}
        title="Maintenance & incidents"
        subtitle="Pannes, interventions et chambres temporairement hors service."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={() => setCreateOpen(true)}
          >
            Signaler une panne
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="À traiter"
          value={kpis.open}
          helper="incidents ouverts"
          icon={<Wrench className="size-4" />}
        />
        <StatTile
          label="Urgents"
          value={kpis.urgent}
          helper="priorité maximale"
          deltaTone={kpis.urgent > 0 ? "danger" : "ok"}
          icon={<Zap className="size-4" />}
        />
        <StatTile
          label="En retard"
          value={kpis.overdue}
          helper="échéance dépassée"
          deltaTone={kpis.overdue > 0 ? "warn" : "ok"}
          icon={<AlertOctagon className="size-4" />}
        />
        <StatTile
          label="Résolus aujourd'hui"
          value={kpis.doneToday}
          helper="clôturés dans la journée"
          icon={<CheckCircle2 className="size-4" />}
        />
      </div>

      {/* Section : chambres indisponibles */}
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Ban className="size-4 text-[var(--color-admin-danger-fg)]" />
              Chambres actuellement hors service
            </span>
          }
          subtitle={
            unavailableRooms.length === 0
              ? "Aucune chambre indisponible."
              : `${unavailableRooms.length} chambre${unavailableRooms.length > 1 ? "s" : ""} bloquée${unavailableRooms.length > 1 ? "s" : ""}.`
          }
          actions={
            <Button variant="ghost" size="sm" href="/admin/chambres">
              Voir le plan
            </Button>
          }
        />
        <CardBody padded={false}>
          {unavailableRooms.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-5" />}
              tone="ok"
              title="Toutes les chambres sont opérationnelles"
              body="Aucune indisponibilité technique en cours."
            />
          ) : (
            <ul className="divide-y divide-[var(--color-admin-divider)]">
              {unavailableRooms.map((r) => {
                const linked = findTaskForRoom(r.number);
                return (
                  <li
                    key={r.number}
                    className="flex flex-wrap items-start gap-3 px-5 py-3"
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)] tnum text-[13px] font-medium">
                      <BedDouble className="size-3.5 mr-1 text-[var(--color-admin-faint)]" />
                      {r.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          tone={r.status === "maintenance" ? "violet" : "danger"}
                          small
                        >
                          {roomStatusLabels[r.status]}
                        </Badge>
                        {r.availableFrom ? (
                          <span className="text-[11.5px] text-[var(--color-admin-muted)] tnum">
                            Remise prévue : {fmtDate(r.availableFrom)}
                          </span>
                        ) : null}
                      </div>
                      {r.note ? (
                        <p className="mt-1 text-[12.5px] text-[var(--color-admin-muted)] line-clamp-2">
                          {r.note}
                        </p>
                      ) : (
                        <p className="mt-1 text-[12px] italic text-[var(--color-admin-faint)]">
                          Pas de note.
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {linked ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelected(linked)}
                          rightIcon={<ExternalLink className="size-3.5" />}
                        >
                          Voir la tâche
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Plus className="size-3.5" />}
                          onClick={() => setCreateOpen(true)}
                        >
                          Créer une tâche
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Toolbar */}
      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Titre, chambre, personne…"
        filters={
          <>
            {STATUS_FILTERS.map((s) => (
              <FilterChip
                key={s}
                label={taskStatusLabels[s]}
                active={activeStatuses.has(s)}
                onClick={() => toggleStatus(s)}
                onClear={activeStatuses.has(s) ? () => toggleStatus(s) : undefined}
              />
            ))}
            <span
              className="hidden md:inline-block h-5 w-px bg-[var(--color-admin-border)] mx-1"
              aria-hidden
            />
            {PRIORITY_FILTERS.map((p) => (
              <FilterChip
                key={p}
                label={taskPriorityLabels[p]}
                active={activePriorities.has(p)}
                onClick={() => togglePriority(p)}
                onClear={
                  activePriorities.has(p) ? () => togglePriority(p) : undefined
                }
              />
            ))}
            {filterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-8 items-center rounded-[var(--radius-admin-sm)] px-2 text-[12px] text-[var(--color-admin-muted)] underline-offset-2 transition-colors duration-150 hover:text-[var(--color-admin-text)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-marine"
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
          icon={<Wrench className="size-5" />}
          title="Aucun incident maintenance"
          body={
            filterCount > 0 || search
              ? "Aucun résultat avec ces filtres."
              : "Tout fonctionne — rien à signaler."
          }
          action={
            filterCount > 0 || search ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => setCreateOpen(true)}
              >
                Signaler une panne
              </Button>
            )
          }
        />
      ) : view === "board" ? (
        <TaskBoard tasks={filtered} staff={staff} onSelect={setSelected} />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(t) => t.id}
          density="comfortable"
          onRowClick={setSelected}
        />
      )}

      <TaskDetailSheet
        task={selectedTask}
        staff={staff}
        onClose={() => setSelected(null)}
        assignableRoles={[...ASSIGN_ROLES]}
      />

      <TaskCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        kind="maintenance"
        rooms={rooms}
        staff={staff}
        assignableRoles={[...ASSIGN_ROLES]}
        withRoomStatusUpdate
        roomStatusOnCreate="maintenance"
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
          { value: "board", label: "Tableau" },
          { value: "list", label: "Liste" },
        ] as const
      ).map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "h-10 rounded-[var(--radius-admin-sm)] px-3 text-[12.5px] font-medium transition-colors duration-150 md:h-8",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-marine",
              active
                ? "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)]"
                : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
