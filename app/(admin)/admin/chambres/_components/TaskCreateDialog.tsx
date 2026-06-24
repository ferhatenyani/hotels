"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { Field, Input, Select, Switch, Textarea } from "@/components/admin/form";
import { useToast } from "@/components/admin/Toast";

import { currentSession } from "@/lib/admin/auth";
import { repo } from "@/lib/admin/repo";
import {
  roomStatusLabels,
  taskPriorityLabels,
  type Room,
  type RoomStatus,
  type Staff,
  type TaskKind,
  type TaskPriority,
} from "@/lib/admin/types";

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "normal", "high", "urgent"];

export function TaskCreateDialog({
  open,
  onClose,
  kind,
  rooms,
  staff,
  /** Restreint les options d'affectation à ces rôles. */
  assignableRoles,
  /** Si vrai, propose de basculer la chambre dans le statut indiqué. */
  withRoomStatusUpdate,
  /** Statut à appliquer à la chambre si « withRoomStatusUpdate » est coché. */
  roomStatusOnCreate,
}: {
  open: boolean;
  onClose: () => void;
  kind: TaskKind;
  rooms: Room[];
  staff: Staff[];
  assignableRoles?: Array<Staff["role"]>;
  withRoomStatusUpdate?: boolean;
  roomStatusOnCreate?: RoomStatus;
}) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [dueAt, setDueAt] = useState<string>("");
  const [updateRoom, setUpdateRoom] = useState<boolean>(!!withRoomStatusUpdate);
  const [submitting, setSubmitting] = useState(false);

  // Réinitialisation à chaque ouverture
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setBody("");
      setRoomNumber("");
      setPriority("normal");
      setAssignedTo("");
      setDueAt("");
      setUpdateRoom(!!withRoomStatusUpdate);
    }
  }, [open, withRoomStatusUpdate]);

  const assignableStaff = useMemo(() => {
    return assignableRoles
      ? staff.filter((s) => s.active && assignableRoles.includes(s.role))
      : staff.filter((s) => s.active);
  }, [staff, assignableRoles]);

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => a.number.localeCompare(b.number)),
    [rooms],
  );

  const canSubmit = title.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const session = currentSession();
    if (!session) {
      toast.push({
        tone: "danger",
        title: "Session expirée",
        body: "Reconnectez-vous pour créer une tâche.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const dueAtIso = dueAt ? new Date(dueAt).toISOString() : undefined;
      await repo.tasks.create({
        kind,
        priority,
        status: "pending",
        title: title.trim(),
        body: body.trim() || undefined,
        roomNumber: roomNumber || undefined,
        assignedTo: assignedTo || undefined,
        dueAt: dueAtIso,
        createdBy: session.staffId,
      });

      if (
        withRoomStatusUpdate &&
        updateRoom &&
        roomNumber &&
        roomStatusOnCreate
      ) {
        await repo.rooms.setStatus(
          roomNumber,
          roomStatusOnCreate,
          body.trim() || title.trim(),
        );
      }

      toast.push({
        tone: "ok",
        title: kind === "housekeeping" ? "Tâche ménage créée" : "Incident enregistré",
        body: title.trim(),
      });
      onClose();
    } catch (err) {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: err instanceof Error ? err.message : "Création impossible.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={kind === "housekeeping" ? "Nouvelle tâche ménage" : "Signaler un incident"}
      description={
        kind === "housekeeping"
          ? "Affectez à une gouvernante avec une priorité et une échéance."
          : "Crée une intervention maintenance — l'équipe technique prend le relais."
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="task-create-form"
            disabled={!canSubmit}
            loading={submitting}
            loadingLabel="Création…"
          >
            {kind === "housekeeping" ? "Créer la tâche" : "Signaler"}
          </Button>
        </>
      }
    >
      <form id="task-create-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Titre" required htmlFor="task-title">
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === "housekeeping"
                ? "Ex : Recouchage complet après départ"
                : "Ex : Climatisation HS"
            }
            required
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Chambre concernée" htmlFor="task-room">
            <Select
              id="task-room"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            >
              <option value="">— Sans chambre —</option>
              {sortedRooms.map((r) => (
                <option key={r.number} value={r.number}>
                  {r.number} · {roomStatusLabels[r.status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priorité" htmlFor="task-priority">
            <Select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {taskPriorityLabels[p]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Affectée à" htmlFor="task-assign">
            <Select
              id="task-assign"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">— Non assignée —</option>
              {assignableStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Échéance" htmlFor="task-due">
            <Input
              id="task-due"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Détails" htmlFor="task-body">
          <Textarea
            id="task-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={"Contexte, particularités, accès, etc."}
          />
        </Field>

        {withRoomStatusUpdate && roomStatusOnCreate ? (
          <div className="flex items-start justify-between gap-3 rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)]/60 p-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[var(--color-admin-text)]">
                Basculer la chambre en « {roomStatusLabels[roomStatusOnCreate]} »
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--color-admin-muted)]">
                {roomNumber
                  ? `La chambre ${roomNumber} sera marquée indisponible jusqu'à clôture.`
                  : "Sélectionnez une chambre pour activer ce comportement."}
              </p>
            </div>
            <Switch
              checked={updateRoom && !!roomNumber}
              onChange={setUpdateRoom}
              disabled={!roomNumber}
              label="Basculer le statut de la chambre"
            />
          </div>
        ) : null}
      </form>
    </Dialog>
  );
}
