"use client";

import {
  AlertOctagon,
  CheckCircle2,
  ListChecks,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Avatar } from "@/components/admin/AvatarChip";
import { Badge, TaskStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
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
const VIEW_KEY = "admin:gouvernante:view:v1";
const ASSIGN_ROLES = ["gouvernante"] as const;

export function GouvernanteClient() {
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
        // Sur mobile : démarre en liste, sur desktop : board.
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
  const [activeAssignee, setActiveAssignee] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Garde le « selected » synchrone avec le store
  const selectedTask = useMemo(() => {
    if (!selected) return null;
    return tasks.find((t) => t.id === selected.id) ?? null;
  }, [selected, tasks]);

  // ─── Filtrage ─────────────────────────────────────────────────────────
  const housekeepingTasks = useMemo(
    () => tasks.filter((t) => t.kind === "housekeeping"),
    [tasks],
  );

  const housekeepers = useMemo(
    () => staff.filter((s) => s.role === "gouvernante" && s.active),
    [staff],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return housekeepingTasks.filter((t) => {
      if (activeStatuses.size > 0 && !activeStatuses.has(t.status)) return false;
      if (activePriorities.size > 0 && !activePriorities.has(t.priority))
        return false;
      if (activeAssignee !== null) {
        if (activeAssignee === "__none__" && t.assignedTo) return false;
        if (activeAssignee !== "__none__" && t.assignedTo !== activeAssignee)
          return false;
      }
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
  }, [housekeepingTasks, search, activeStatuses, activePriorities, activeAssignee, staff]);

  // ─── KPIs (sur les tâches ménage globales) ───────────────────────────
  const kpis = useMemo(() => {
    const open = housekeepingTasks.filter((t) => t.status !== "done").length;
    const urgent = housekeepingTasks.filter(
      (t) => t.priority === "urgent" && t.status !== "done",
    ).length;
    const overdue = housekeepingTasks.filter((t) => isOverdue(t)).length;
    const doneToday = housekeepingTasks.filter((t) => wasDoneToday(t)).length;
    return { open, urgent, overdue, doneToday };
  }, [housekeepingTasks]);

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
    setActiveAssignee(null);
  };

  const filterCount =
    activeStatuses.size +
    activePriorities.size +
    (activeAssignee !== null ? 1 : 0);

  // ─── Colonnes liste ──────────────────────────────────────────────────
  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "Tâche",
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-[var(--color-admin-text)]">
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
          { label: "Gouvernante" },
        ]}
        title="Gouvernante & ménage"
        subtitle="Affectations, priorités et avancement du recouchage."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={() => setCreateOpen(true)}
          >
            Nouvelle tâche
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="À faire"
          value={kpis.open}
          helper="tâches ouvertes"
          icon={<ListChecks className="size-4" />}
        />
        <StatTile
          label="Urgentes"
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
          label="Faites aujourd'hui"
          value={kpis.doneToday}
          helper="clôturées dans la journée"
          icon={<CheckCircle2 className="size-4" />}
        />
      </div>

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
            <span
              className="hidden md:inline-block h-5 w-px bg-[var(--color-admin-border)] mx-1"
              aria-hidden
            />
            <FilterChip
              label="Non assignées"
              active={activeAssignee === "__none__"}
              onClick={() =>
                setActiveAssignee((curr) => (curr === "__none__" ? null : "__none__"))
              }
              onClear={
                activeAssignee === "__none__"
                  ? () => setActiveAssignee(null)
                  : undefined
              }
            />
            {housekeepers.map((s) => (
              <FilterChip
                key={s.id}
                label={`${s.firstName} ${s.lastName[0]}.`}
                active={activeAssignee === s.id}
                onClick={() =>
                  setActiveAssignee((curr) => (curr === s.id ? null : s.id))
                }
                onClear={
                  activeAssignee === s.id ? () => setActiveAssignee(null) : undefined
                }
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
          icon={<Sparkles className="size-5" />}
          title="Aucune tâche ménage"
          body={
            filterCount > 0 || search
              ? "Aucun résultat avec ces filtres."
              : "Pas de recouchage en attente — bonne journée."
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
                Créer une tâche
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
        kind="housekeeping"
        rooms={rooms}
        staff={staff}
        assignableRoles={[...ASSIGN_ROLES]}
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
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-admin-accent)]",
              active
                ? "bg-[var(--color-admin-accent-soft)] text-[var(--color-admin-accent)] ring-1 ring-inset ring-[var(--color-admin-accent)]/15"
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
