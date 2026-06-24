"use client";

import { AlertOctagon, BedDouble, CalendarClock, User2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/admin/Badge";
import { Avatar } from "@/components/admin/AvatarChip";

import { fmtRelative } from "@/lib/admin/format";
import { taskPriorityLabels, type Staff, type Task } from "@/lib/admin/types";

import { isOverdue, taskPriorityTone } from "./helpers";

export function TaskCard({
  task,
  staff,
  onClick,
}: {
  task: Task;
  staff: Staff[];
  onClick: () => void;
}) {
  const assignee = staff.find((s) => s.id === task.assignedTo);
  const overdue = isOverdue(task);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group block w-full rounded-[var(--radius-admin-md)] bg-[var(--color-admin-panel)] p-3 text-left",
        "shadow-[var(--shadow-admin-xs)] ring-1 ring-[var(--color-admin-border)]",
        "transition-[transform,box-shadow] duration-150 ease-out motion-reduce:transition-none",
        "hover:-translate-y-px hover:shadow-[var(--shadow-admin-sm)] hover:ring-[var(--color-admin-border-strong)] motion-reduce:hover:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge tone={taskPriorityTone[task.priority]} small>
          {taskPriorityLabels[task.priority]}
        </Badge>
        {task.roomNumber ? (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium tnum text-[var(--color-admin-muted)]">
            <BedDouble className="size-3" />
            ch. {task.roomNumber}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[13px] leading-5 font-medium text-[var(--color-admin-text)] line-clamp-2">
        {task.title}
      </p>
      {task.body ? (
        <p className="mt-1 text-[12px] leading-[18px] text-[var(--color-admin-muted)] line-clamp-2">
          {task.body}
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-2 text-[11.5px]">
        <span className="inline-flex items-center gap-1.5 min-w-0 text-[var(--color-admin-muted)]">
          {assignee ? (
            <>
              <Avatar
                firstName={assignee.firstName}
                lastName={assignee.lastName}
                size="xs"
              />
              <span className="truncate">
                {assignee.firstName} {assignee.lastName[0]}.
              </span>
            </>
          ) : (
            <>
              <User2 className="size-3.5 text-[var(--color-admin-faint)]" />
              <span className="italic text-[var(--color-admin-faint)]">Non assignée</span>
            </>
          )}
        </span>
        {task.dueAt ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 tnum shrink-0",
              overdue
                ? "text-[var(--color-admin-danger-fg)] font-medium"
                : "text-[var(--color-admin-muted)]",
            )}
            title={overdue ? "En retard" : undefined}
          >
            {overdue ? (
              <AlertOctagon className="size-3" />
            ) : (
              <CalendarClock className="size-3" />
            )}
            {fmtRelative(task.dueAt)}
          </span>
        ) : (
          <span className="text-[11px] text-[var(--color-admin-faint)] tnum">Sans échéance</span>
        )}
      </div>
    </button>
  );
}
