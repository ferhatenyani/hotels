import { cn } from "@/lib/utils";

export function Card({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-admin-lg)] bg-[var(--color-admin-panel)]",
        "shadow-[var(--shadow-admin-sm)] ring-1 ring-[var(--color-admin-border)]",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  className,
  title,
  subtitle,
  actions,
  ...rest
}: Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-5 pt-4 pb-3.5",
        "border-b border-[var(--color-admin-divider)]",
        className,
      )}
      {...rest}
    >
      <div className="min-w-0">
        <h2 className="text-[14px] font-semibold leading-5 text-[var(--color-admin-text)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[12px] leading-4 text-[var(--color-admin-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function CardBody({
  className,
  padded = true,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return <div className={cn(padded && "px-5 py-4", className)} {...rest} />;
}

export function CardFooter({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-3",
        "rounded-b-[var(--radius-admin-lg)] border-t border-[var(--color-admin-divider)]",
        "bg-[var(--color-admin-sunken)]/40",
        className,
      )}
      {...rest}
    />
  );
}
