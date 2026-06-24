import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { toneText, type Tone } from "./tone";

export function StatTile({
  label,
  value,
  helper,
  delta,
  deltaLabel,
  deltaTone,
  icon,
  className,
}: {
  label: React.ReactNode;
  /** Valeur principale — généralement un nombre formaté. */
  value: React.ReactNode;
  /** Texte sous la valeur (ex: « sur 30 chambres »). */
  helper?: React.ReactNode;
  /** Variation chiffrée à droite (ex: « +12 % »). Si négative, mettre le `-`. */
  delta?: React.ReactNode;
  /** Libellé du delta (ex: « vs hier »). */
  deltaLabel?: React.ReactNode;
  /** Force la teinte du delta. Sinon, déduit du signe (« + » → ok, « - » → danger). */
  deltaTone?: Tone;
  icon?: React.ReactNode;
  className?: string;
}) {
  const inferredTone: Tone | undefined =
    deltaTone ??
    (typeof delta === "string"
      ? delta.trim().startsWith("-")
        ? "danger"
        : delta.trim().startsWith("+")
          ? "ok"
          : undefined
      : undefined);

  const TrendIcon =
    inferredTone === "danger" ? TrendingDown : inferredTone === "ok" ? TrendingUp : null;

  return (
    <div
      className={cn(
        "rounded-xl bg-[var(--color-admin-panel)] ring-1 ring-[var(--color-admin-border)] p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
          {label}
        </p>
        {icon ? (
          <span className="text-[var(--color-admin-faint)]" aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="font-display tnum text-[28px] leading-9 tracking-tight text-[var(--color-admin-text)]">
          {value}
        </span>
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[12px] font-medium tnum",
              inferredTone ? toneText[inferredTone] : "text-[var(--color-admin-muted)]",
            )}
          >
            {TrendIcon ? <TrendIcon className="size-3" /> : null}
            {delta}
          </span>
        ) : null}
      </div>
      {(helper || deltaLabel) && (
        <p className="mt-1 text-[12px] text-[var(--color-admin-muted)]">
          {helper}
          {helper && deltaLabel ? " · " : ""}
          {deltaLabel}
        </p>
      )}
    </div>
  );
}
