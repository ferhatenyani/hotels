// The letter-style form field pattern from Contact.tsx, hoisted into a
// reusable primitive. Used by /contact, /events enquiry, /booking/guest,
// /booking/payment, /booking/lookup, /dining table-reservation hook.

"use client";

import {
  useId,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

type SharedProps = {
  /** Two-digit numeric label aligned to the left ("01", "02"…) per the Contact form. */
  index?: string;
  label: string;
  required?: boolean;
  /** Helper text shown under the field, even when no error. */
  helper?: string;
  /** Error message — turns the rule red and exposes role="alert". */
  error?: string;
  /** Class for the outer wrapper (e.g. col-span grid overrides). */
  wrapperClassName?: string;
};

type InputProps = SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

type TextareaProps = SharedProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Single-line input. */
export function Field({
  index,
  label,
  required,
  helper,
  error,
  wrapperClassName,
  id: idProp,
  className: inputClassName,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <FieldShell
      id={id}
      index={index}
      label={label}
      required={required}
      helper={helper}
      error={error}
      wrapperClassName={wrapperClassName}
    >
      {({ onFocus, onBlur, focused }) => (
        <input
          id={id}
          required={required}
          {...rest}
          onFocus={(e) => {
            onFocus();
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            onBlur();
            rest.onBlur?.(e);
          }}
          className={cn(
            "w-full bg-transparent font-sans font-normal text-[16px] text-ink placeholder:text-ink/30 outline-none pb-3 max-md:min-h-[44px] max-md:pt-2",
            inputClassName,
          )}
          data-focused={focused ? "true" : undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error ? `${id}-err` : helper ? `${id}-help` : undefined
          }
        />
      )}
    </FieldShell>
  );
}

/** Multi-line textarea. */
export function TextArea({
  index,
  label,
  required,
  helper,
  error,
  wrapperClassName,
  id: idProp,
  className: textareaClassName,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <FieldShell
      id={id}
      index={index}
      label={label}
      required={required}
      helper={helper}
      error={error}
      wrapperClassName={wrapperClassName}
    >
      {({ onFocus, onBlur, focused }) => (
        <textarea
          id={id}
          rows={rest.rows ?? 4}
          required={required}
          {...rest}
          onFocus={(e) => {
            onFocus();
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            onBlur();
            rest.onBlur?.(e);
          }}
          className={cn(
            "w-full bg-transparent font-sans font-normal text-[16px] leading-[1.6] text-ink placeholder:text-ink/30 outline-none pb-3 resize-none",
            textareaClassName,
          )}
          data-focused={focused ? "true" : undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error ? `${id}-err` : helper ? `${id}-help` : undefined
          }
        />
      )}
    </FieldShell>
  );
}

type FieldShellProps = SharedProps & {
  id: string;
  children: (api: {
    onFocus: () => void;
    onBlur: () => void;
    focused: boolean;
  }) => React.ReactNode;
};

function FieldShell({
  id,
  index,
  label,
  required,
  helper,
  error,
  wrapperClassName,
  children,
}: FieldShellProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "contact-field group/field flex flex-col gap-3",
        wrapperClassName,
      )}
    >
      <label
        htmlFor={id}
        className="flex items-baseline gap-3 font-sans text-[10px] uppercase tracking-[0.24em] text-ink/60"
      >
        {index && (
          <span className="font-display text-[12px] tabular-nums text-marine not-italic tracking-tight">
            {index}
          </span>
        )}
        <span>
          {label}
          {required && (
            <span aria-hidden className="ml-1 text-marine">
              ·
            </span>
          )}
        </span>
      </label>

      <div className="relative">
        {children({
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
          focused,
        })}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-ink/15"
        />
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500 ease-out",
            error ? "bg-destructive" : "bg-marine",
            focused || error ? "scale-x-100" : "scale-x-0",
          )}
        />
      </div>

      {error ? (
        <p
          id={`${id}-err`}
          role="alert"
          className="font-sans text-[12px] text-destructive"
        >
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-help`} className="font-sans text-[12px] text-ink/55">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
