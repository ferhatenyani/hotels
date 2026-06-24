"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const inputBase =
  "block w-full rounded-md border border-[var(--color-admin-border-strong)] " +
  "bg-[var(--color-admin-panel)] px-3 py-1.5 text-[14px] leading-5 " +
  "text-[var(--color-admin-text)] placeholder:text-[var(--color-admin-faint)] " +
  "transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-marine " +
  "disabled:bg-[var(--color-admin-sunken)] disabled:cursor-not-allowed";

// ─── Label ─────────────────────────────────────────────────────────────

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }>(
  function Label({ className, required, children, ...rest }, ref) {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-[12.5px] font-medium leading-4 text-[var(--color-admin-muted)]",
          className,
        )}
        {...rest}
      >
        {children}
        {required ? <span className="ml-0.5 text-[var(--color-admin-danger-fg)]">*</span> : null}
      </label>
    );
  },
);

// ─── Field (label + control + helper + error) ──────────────────────────

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
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-[12px] leading-4 text-[var(--color-admin-danger-fg)]" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="text-[12px] leading-4 text-[var(--color-admin-muted)]">{helper}</p>
      ) : null}
    </div>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          inputBase,
          "h-9",
          invalid && "border-[var(--color-admin-danger-fg)] focus-visible:outline-[var(--color-admin-danger-fg)]",
          className,
        )}
        {...rest}
      />
    );
  },
);

// ─── Textarea ──────────────────────────────────────────────────────────

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          inputBase,
          "py-2 resize-y min-h-[80px]",
          invalid && "border-[var(--color-admin-danger-fg)] focus-visible:outline-[var(--color-admin-danger-fg)]",
          className,
        )}
        {...rest}
      />
    );
  },
);

// ─── Select (natif) ───────────────────────────────────────────────────

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  function Select({ className, children, invalid, ...rest }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            inputBase,
            "h-9 appearance-none pr-9 cursor-pointer",
            invalid && "border-[var(--color-admin-danger-fg)] focus-visible:outline-[var(--color-admin-danger-fg)]",
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-admin-muted)]"
          viewBox="0 0 12 12"
          aria-hidden
        >
          <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  },
);

// ─── Checkbox ──────────────────────────────────────────────────────────

export const Checkbox = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Checkbox({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "size-4 rounded-[4px] border border-[var(--color-admin-border-strong)] " +
            "bg-[var(--color-admin-panel)] text-marine accent-marine " +
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine " +
            "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...rest}
      />
    );
  },
);

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
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
        checked ? "bg-marine" : "bg-[var(--color-admin-border-strong)]",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
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
  options: Array<{ value: T; label: React.ReactNode; helper?: React.ReactNode }>;
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
              "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors duration-150",
              active
                ? "border-marine bg-[var(--color-admin-ok-bg)]/40"
                : "border-[var(--color-admin-border)] hover:bg-[var(--color-admin-sunken)]",
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 size-4 accent-marine cursor-pointer"
            />
            <span className="min-w-0">
              <span className="block text-[13.5px] font-medium text-[var(--color-admin-text)]">
                {opt.label}
              </span>
              {opt.helper ? (
                <span className="mt-0.5 block text-[12px] text-[var(--color-admin-muted)]">
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
