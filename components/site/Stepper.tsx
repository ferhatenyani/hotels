// The guest-counter stepper pattern hoisted from Hero.tsx so /booking/search
// (and any other guest-count UI) doesn't redefine it.

"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  /** Larger touch targets, used inside the mobile bottom-sheet. */
  large?: boolean;
};

export default function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  large,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        large ? "px-1 py-5" : "px-3 py-3",
      )}
    >
      <div>
        <p
          className={cn(
            "font-sans font-medium text-ink leading-none",
            large ? "text-[16px]" : "text-[14px]",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-1.5 font-sans text-ink/45 leading-none",
            large ? "text-[13px]" : "text-[12px]",
          )}
        >
          {hint}
        </p>
      </div>
      <div className={cn("flex items-center", large ? "gap-4" : "gap-3")}>
        <StepButton
          ariaLabel={`Retirer un ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          large={large}
        >
          <Minus className={large ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2} />
        </StepButton>
        <span
          className={cn(
            "text-center font-display font-medium tabular-nums text-ink",
            large ? "w-8 text-[22px]" : "w-6 text-[18px]",
          )}
        >
          {value}
        </span>
        <StepButton
          ariaLabel={`Ajouter un ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          large={large}
        >
          <Plus className={large ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2} />
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  children,
  ariaLabel,
  disabled,
  onClick,
  large,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-marine hover:text-marine disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
        large ? "h-11 w-11" : "h-8 w-8",
      )}
    >
      {children}
    </button>
  );
}
