import { cn } from "@/lib/utils";

import { initials } from "@/lib/admin/format";

export function Avatar({
  firstName,
  lastName,
  size = "md",
  className,
}: {
  firstName?: string;
  lastName?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const dim = size === "xs" ? "size-6" : size === "sm" ? "size-7" : "size-8";
  const text = size === "xs" ? "text-[9px]" : size === "sm" ? "text-[10.5px]" : "text-[11.5px]";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[var(--color-admin-sunken)]",
        "ring-1 ring-[var(--color-admin-border)] text-[var(--color-admin-muted)] font-medium",
        dim,
        text,
        className,
      )}
      aria-hidden
    >
      {initials(firstName, lastName)}
    </span>
  );
}

export function AvatarChip({
  firstName,
  lastName,
  subtitle,
  size = "sm",
  className,
}: {
  firstName?: string;
  lastName?: string;
  subtitle?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 min-w-0", className)}>
      <Avatar firstName={firstName} lastName={lastName} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-[var(--color-admin-text)]">
          {[firstName, lastName].filter(Boolean).join(" ") || "—"}
        </span>
        {subtitle ? (
          <span className="block truncate text-[11.5px] text-[var(--color-admin-muted)]">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
