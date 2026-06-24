"use client";

import {
  AlertOctagon,
  Ban,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  PlayCircle,
  Save,
  User2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge, TaskStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Field, Select, Textarea } from "@/components/admin/form";
import { Sheet } from "@/components/admin/Sheet";
import { useToast } from "@/components/admin/Toast";

import { fmtDateTime, fmtRelative } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import {
  taskKindLabels,
  taskPriorityLabels,
  taskStatusLabels,
  type Staff,
  type Task,
  type TaskStatus,
} from "@/lib/admin/types";

import { isOverdue, taskPriorityTone } from "./helpers";

export function TaskDetailSheet({
  task,
  staff,
  onClose,
  /** Restreint le picker d'assignation à ces rôles (ex. ['gouvernante']). */
  assignableRoles,
}: {
  task: Task | null;
  staff: Staff[];
  onClose: () => void;
  assignableRoles?: Array<Staff["role"]>;
}) {
  const toast = useToast();
  const [assignedTo, setAssignedTo] = useState<string>(task?.assignedTo ?? "");
  const [resolution, setResolution] = useState<string>(task?.resolution ?? "");
  const [busy, setBusy] = useState<null | "status" | "assign" | "complete">(null);

  useEffect(() => {
    if (task) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssignedTo(task.assignedTo ?? "");
      setResolution(task.resolution ?? "");
    }
  }, [task]);

  if (!task) {
    return (
      <Sheet open={false} onClose={onClose} title="Tâche" width="md">
        {null}
      </Sheet>
    );
  }

  const assignableStaff = assignableRoles
    ? staff.filter((s) => s.active && assignableRoles.includes(s.role))
    : staff.filter((s) => s.active);

  const overdue = isOverdue(task);
  const assignDirty = (assignedTo || "") !== (task.assignedTo || "");

  const handleSetStatus = async (next: TaskStatus) => {
    if (next === task.status) return;
    setBusy("status");
    try {
      await repo.tasks.setStatus(task.id, next);
      toast.push({
        tone: "ok",
        title: "Statut mis à jour",
        body: `« ${task.title} » → ${taskStatusLabels[next]}.`,
      });
    } catch (e) {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: e instanceof Error ? e.message : "Impossible de modifier le statut.",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleAssign = async () => {
    if (!assignDirty) return;
    setBusy("assign");
    try {
      await repo.tasks.assign(task.id, assignedTo);
      toast.push({ tone: "ok", title: "Tâche réassignée" });
    } catch (e) {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: e instanceof Error ? e.message : "Réassignation impossible.",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleComplete = async () => {
    setBusy("complete");
    try {
      await repo.tasks.complete(task.id, resolution.trim() || undefined);
      toast.push({
        tone: "ok",
        title: "Tâche terminée",
        body: `« ${task.title} » clôturée.`,
      });
      onClose();
    } catch (e) {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: e instanceof Error ? e.message : "Impossible de terminer la tâche.",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet
      open={!!task}
      onClose={onClose}
      title={
        <span className="inline-flex flex-wrap items-center gap-2">
          {task.title}
        </span>
      }
      description={
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
          <Badge tone={task.kind === "housekeeping" ? "amber" : "violet"} small>
            {taskKindLabels[task.kind]}
          </Badge>
          <Badge tone={taskPriorityTone[task.priority]} small>
            {taskPriorityLabels[task.priority]}
          </Badge>
          <TaskStatusPill status={task.status} small />
          {task.roomNumber ? (
            <span className="inline-flex items-center gap-1 text-[var(--color-admin-muted)] tnum">
              <BedDouble className="size-3" />
              ch. {task.roomNumber}
            </span>
          ) : null}
        </span>
      }
      width="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
          {task.status !== "done" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleComplete}
              loading={busy === "complete"}
              loadingLabel="Clôture…"
              leftIcon={<CheckCircle2 className="size-4" />}
            >
              Terminer
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-5">
        {/* Body / contexte */}
        {task.body ? (
          <section className="rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)]/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)] mb-1">
              Contexte
            </p>
            <p className="text-[13px] leading-5 text-[var(--color-admin-text)] whitespace-pre-wrap">
              {task.body}
            </p>
          </section>
        ) : null}

        {/* Méta */}
        <section className="grid grid-cols-2 gap-3 text-[12.5px]">
          <Meta
            label="Échéance"
            value={
              task.dueAt ? (
                <span
                  className={
                    overdue
                      ? "text-[var(--color-admin-danger-fg)] font-medium"
                      : "text-[var(--color-admin-text)]"
                  }
                >
                  {overdue ? (
                    <AlertOctagon className="size-3 inline mr-1" />
                  ) : (
                    <CalendarClock className="size-3 inline mr-1" />
                  )}
                  {fmtRelative(task.dueAt)}
                </span>
              ) : (
                <span className="text-[var(--color-admin-faint)]">Sans échéance</span>
              )
            }
          />
          <Meta
            label="Créée"
            value={
              <span className="tnum text-[var(--color-admin-text)]">
                {fmtDateTime(task.createdAt)}
              </span>
            }
          />
          {task.completedAt ? (
            <Meta
              label="Terminée"
              value={
                <span className="tnum text-[var(--color-admin-text)]">
                  {fmtDateTime(task.completedAt)}
                </span>
              }
            />
          ) : null}
          <Meta
            label="Créée par"
            value={(() => {
              const s = staff.find((x) => x.id === task.createdBy);
              return s ? (
                <span className="inline-flex items-center gap-1 text-[var(--color-admin-text)]">
                  <User2 className="size-3 text-[var(--color-admin-faint)]" />
                  {s.firstName} {s.lastName}
                </span>
              ) : (
                <span className="text-[var(--color-admin-faint)]">—</span>
              );
            })()}
          />
        </section>

        {/* Statut — actions rapides */}
        <Field
          label="Changer le statut"
          helper="Met à jour la colonne sur le tableau."
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant={task.status === "pending" ? "subtle" : "secondary"}
              size="sm"
              onClick={() => handleSetStatus("pending")}
              disabled={busy !== null || task.status === "pending"}
            >
              À faire
            </Button>
            <Button
              variant={task.status === "in-progress" ? "subtle" : "secondary"}
              size="sm"
              onClick={() => handleSetStatus("in-progress")}
              disabled={busy !== null || task.status === "in-progress"}
              leftIcon={<PlayCircle className="size-4" />}
            >
              En cours
            </Button>
            <Button
              variant={task.status === "blocked" ? "subtle" : "secondary"}
              size="sm"
              onClick={() => handleSetStatus("blocked")}
              disabled={busy !== null || task.status === "blocked"}
              leftIcon={<Ban className="size-4" />}
            >
              Bloquée
            </Button>
          </div>
        </Field>

        {/* Réassignation */}
        <Field
          label="Affectation"
          htmlFor={`task-${task.id}-assign`}
          helper={
            assignableRoles && assignableRoles.length > 0
              ? `Filtré aux rôles : ${assignableRoles.join(", ")}`
              : "Toute personne active peut être affectée."
          }
        >
          <div className="flex items-center gap-2">
            <Select
              id={`task-${task.id}-assign`}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="flex-1"
            >
              <option value="">— Non assignée —</option>
              {assignableStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAssign}
              disabled={!assignDirty}
              loading={busy === "assign"}
              loadingLabel="…"
              leftIcon={<Save className="size-4" />}
            >
              Affecter
            </Button>
          </div>
        </Field>

        {/* Résolution */}
        {task.status !== "done" ? (
          <Field
            label="Résolution"
            helper="Notes de clôture (visible sur la fiche). Saisissez puis « Terminer »."
          >
            <Textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={3}
              placeholder={"Ex : « Linge changé, salle de bain refaite à fond. »"}
            />
          </Field>
        ) : task.resolution ? (
          <section className="rounded-[var(--radius-admin-md)] ring-1 ring-[var(--color-admin-border)] p-3">
            <p className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)] mb-1">
              Résolution
            </p>
            <p className="text-[13px] leading-5 text-[var(--color-admin-text)] whitespace-pre-wrap">
              {task.resolution}
            </p>
          </section>
        ) : null}
      </div>
    </Sheet>
  );
}

function Meta({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)]">
        {label}
      </p>
      <p className="text-[12.5px]">{value}</p>
    </div>
  );
}
