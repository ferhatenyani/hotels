import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

import { toneText, type Tone } from "./tone";

export function EmptyState({
  icon,
  tone,
  title,
  body,
  action,
  className,
}: {
  /** Icône Lucide (taille 22). Si absent, une icône `Inbox` neutre est utilisée. */
  icon?: React.ReactNode;
  /** Si fourni, l'icône et le titre prennent cette teinte. */
  tone?: Tone;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12",
        className,
      )}
    >
      <div
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full",
          "bg-[var(--color-admin-sunken)] text-[var(--color-admin-muted)]",
          tone && toneText[tone],
        )}
      >
        {icon ?? <Inbox className="size-5" />}
      </div>
      <h3
        className={cn(
          "mt-4 text-[15px] font-medium text-[var(--color-admin-text)]",
          tone && toneText[tone],
        )}
      >
        {title}
      </h3>
      {body ? (
        <p className="mt-1.5 max-w-md text-[13px] leading-5 text-[var(--color-admin-muted)]">
          {body}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
