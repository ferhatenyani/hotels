"use client";

import { forwardRef } from "react";
import { AlertCircle, Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Shared control styling ────────────────────────────────────────────
//
// Apple-like (macOS System Settings) field controls:
//  • radius   → --radius-admin-md
//  • border   → hairline --color-admin-border, → --color-admin-border-strong
//               on hover (calm), accent border + soft halo on focus-visible
//  • text     → 16px on mobile (no iOS zoom), 14px desktop
//  • height   → min 44px touch target on mobile, ~36px desktop
//  • disabled → sunken fill, faint text, no-drop cursor
//  • error    → danger border + danger focus halo (paired with icon below)
//
// The focus halo mirrors the `.admin-ring` utility (soft accent halo) but is
// applied through the focus-visible variant so it only shows on keyboard focus.

const focusRing =
  "focus-visible:outline-none focus-visible:border-[var(--color-admin-accent)] " +
  "focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)]";

const controlBase =
  "block w-full appearance-none rounded-[var(--radius-admin-md)] " +
  "border border-[var(--color-admin-border)] bg-[var(--color-admin-panel)] " +
  "px-3 text-[16px] md:text-[14px] leading-5 text-[var(--color-admin-text)] " +
  "placeholder:text-[var(--color-admin-faint)] " +
  "transition-[color,background-color,border-color,box-shadow] duration-150 ease-out " +
  "hover:border-[var(--color-admin-border-strong)] " +
  focusRing +
  " disabled:cursor-not-allowed disabled:border-[var(--color-admin-border)] " +
  "disabled:bg-[var(--color-admin-sunken)] disabled:text-[var(--color-admin-faint)] " +
  "disabled:hover:border-[var(--color-admin-border)] " +
  // read-only: legible but visibly non-editable, no hover affordance
  "read-only:bg-[var(--color-admin-sunken)] read-only:cursor-default " +
  "read-only:hover:border-[var(--color-admin-border)]";

const invalidRing =
  "border-[var(--color-admin-danger-fg)] hover:border-[var(--color-admin-danger-fg)] " +
  "focus-visible:border-[var(--color-admin-danger-fg)] " +
  "focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-danger-bg)]";

// Comfortable height: 44px touch target on mobile, ~36px desktop.
const controlHeight = "h-11 md:h-9";

// ─── Label ─────────────────────────────────────────────────────────────

export const Label = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(function Label({ className, required, children, ...rest }, ref) {
  return (
    <label
      ref={ref}
      className={cn(
        "block text-[13px] font-medium leading-4 text-[var(--color-admin-text)]",
        className,
      )}
      {...rest}
    >
      {children}
      {required ? (
        <span
          aria-hidden
          className="ml-0.5 text-[var(--color-admin-danger-fg)]"
        >
          *
        </span>
      ) : null}
    </label>
  );
});

// ─── Field (label + control + helper / error) ──────────────────────────

export function Field({
  label,
  required,
  htmlFor,
  helper,
  error,
  children,
  className,
}: {
  label?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const describedById = htmlFor
    ? error
      ? `${htmlFor}-error`
      : helper
        ? `${htmlFor}-helper`
        : undefined
    : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p
          id={describedById}
          role="alert"
          className="flex items-start gap-1.5 text-[12px] leading-4 text-[var(--color-admin-danger-fg)]"
        >
          <AlertCircle
            aria-hidden
            strokeWidth={1.75}
            className="mt-px size-3.5 shrink-0"
          />
          <span>{error}</span>
        </p>
      ) : helper ? (
        <p
          id={describedById}
          className="text-[12px] leading-4 text-[var(--color-admin-muted)]"
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...rest }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        controlHeight,
        invalid && invalidRing,
        className,
      )}
      {...rest}
    />
  );
});

// ─── Textarea ──────────────────────────────────────────────────────────

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        "min-h-[88px] resize-y py-2.5",
        invalid && invalidRing,
        className,
      )}
      {...rest}
    />
  );
});

// ─── DatePicker (native date input, styled) ────────────────────────────
//
// No new dependency: wraps the native <input type="date"> so the browser's
// own calendar handles locale/selection while we keep the Apple-like shell.
// Same prop surface as Input.

export const DatePicker = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    invalid?: boolean;
  }
>(function DatePicker({ className, invalid, ...rest }, ref) {
  return (
    <input
      ref={ref}
      type="date"
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        controlHeight,
        "tnum [&::-webkit-calendar-picker-indicator]:cursor-pointer " +
          "[&::-webkit-calendar-picker-indicator]:opacity-60 " +
          "[&::-webkit-calendar-picker-indicator]:hover:opacity-100",
        invalid && invalidRing,
        className,
      )}
      {...rest}
    />
  );
});

// ─── Select (natif) ───────────────────────────────────────────────────

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, children, invalid, disabled, ...rest }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          controlHeight,
          "cursor-pointer pr-9",
          // native select keeps the read-only styling off (not applicable)
          "read-only:bg-[var(--color-admin-panel)]",
          invalid && invalidRing,
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2",
          disabled
            ? "text-[var(--color-admin-faint)]"
            : "text-[var(--color-admin-muted)]",
        )}
        viewBox="0 0 12 12"
        aria-hidden
      >
        <path
          d="m3 4.5 3 3 3-3"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

// ─── Checkbox ──────────────────────────────────────────────────────────
//
// Custom-rendered box for a crisp macOS accent fill. The real <input> is the
// `peer`; the box and the check/dash glyphs are all *direct siblings* of it so
// the peer-* variants resolve. `indeterminate` is a DOM property (not an
// attribute) so we set it through a ref callback.

export const Checkbox = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }
>(function Checkbox({ className, indeterminate, disabled, ...rest }, ref) {
  const setIndeterminate = (node: HTMLInputElement | null) => {
    if (node) node.indeterminate = Boolean(indeterminate);
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <span className={cn("relative inline-flex size-[18px] shrink-0", className)}>
      <input
        ref={setIndeterminate}
        type="checkbox"
        disabled={disabled}
        className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        {...rest}
      />
      {/* box */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 rounded-[6px] " +
          "border border-[var(--color-admin-border-strong)] bg-[var(--color-admin-panel)] " +
          "transition-[background-color,border-color,box-shadow] duration-150 ease-out " +
          "peer-hover:border-[var(--color-admin-accent)] " +
          "peer-checked:border-[var(--color-admin-accent)] peer-checked:bg-[var(--color-admin-accent)] " +
          "peer-indeterminate:border-[var(--color-admin-accent)] peer-indeterminate:bg-[var(--color-admin-accent)] " +
          "peer-focus-visible:border-[var(--color-admin-accent)] " +
          "peer-focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)] " +
          "peer-disabled:border-[var(--color-admin-border)] peer-disabled:bg-[var(--color-admin-sunken)] " +
          "peer-disabled:peer-checked:bg-[var(--color-admin-faint)] " +
          "peer-disabled:peer-checked:border-[var(--color-admin-faint)]"
        }
      />
      {/* check glyph */}
      <Check
        aria-hidden
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto size-3 text-[var(--color-admin-panel)] opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
      />
      {/* indeterminate dash */}
      <Minus
        aria-hidden
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto size-3 text-[var(--color-admin-panel)] opacity-0 peer-indeterminate:opacity-100"
      />
    </span>
  );
});

// ─── Switch ────────────────────────────────────────────────────────────

export function Switch({
  checked,
  onChange,
  disabled,
  className,
  label,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full " +
          "border border-transparent p-0.5 transition-colors duration-200 ease-out " +
          "focus-visible:outline-none " +
          "focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)]",
        checked
          ? "bg-[var(--color-admin-accent)]"
          : "bg-[var(--color-admin-border-strong)]",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:opacity-90",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-[20px] rounded-full bg-[var(--color-admin-panel)] " +
            "shadow-[var(--shadow-admin-xs)] transition-transform duration-200 ease-out",
          checked ? "translate-x-[18px]" : "translate-x-0",
        )}
      />
    </button>
  );
}

// ─── Radio (groupe simple) ─────────────────────────────────────────────

export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  className,
}: {
  name: string;
  value: T;
  onChange: (next: T) => void;
  options: Array<{
    value: T;
    label: React.ReactNode;
    helper?: React.ReactNode;
    disabled?: boolean;
  }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)} role="radiogroup">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={cn(
              "flex items-start gap-3 rounded-[var(--radius-admin-md)] border px-3 py-3 " +
                "transition-[background-color,border-color,box-shadow] duration-150 ease-out " +
                "has-[:focus-visible]:border-[var(--color-admin-accent)] " +
                "has-[:focus-visible]:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)]",
              opt.disabled
                ? "cursor-not-allowed border-[var(--color-admin-border)] bg-[var(--color-admin-sunken)] opacity-60"
                : active
                  ? "cursor-pointer border-[var(--color-admin-accent)] bg-[var(--color-admin-accent-soft)]"
                  : "cursor-pointer border-[var(--color-admin-border)] hover:border-[var(--color-admin-border-strong)] hover:bg-[var(--color-admin-sunken)]",
            )}
          >
            <span className="relative mt-px inline-flex size-[18px] shrink-0">
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={active}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none flex size-[18px] items-center justify-center rounded-full " +
                    "border border-[var(--color-admin-border-strong)] bg-[var(--color-admin-panel)] " +
                    "transition-[border-color,box-shadow] duration-150 ease-out " +
                    "peer-checked:border-[5px] peer-checked:border-[var(--color-admin-accent)] " +
                    "peer-disabled:border-[var(--color-admin-border)]",
                )}
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-medium leading-5 text-[var(--color-admin-text)]">
                {opt.label}
              </span>
              {opt.helper ? (
                <span className="mt-0.5 block text-[12px] leading-4 text-[var(--color-admin-muted)]">
                  {opt.helper}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
