import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function PageHeader({
  crumbs,
  title,
  subtitle,
  actions,
  className,
}: {
  crumbs?: Crumb[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("space-y-3", className)}>
      {crumbs && crumbs.length > 0 ? (
        <nav aria-label="Fil d'Ariane">
          <ol className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-[12px] text-[var(--color-admin-muted)]">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                  {c.href && !last ? (
                    <Link
                      href={c.href}
                      className="rounded-[var(--radius-admin-xs)] hover:text-[var(--color-admin-text)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className={cn(last && "text-[var(--color-admin-text)] font-medium")}>
                      {c.label}
                    </span>
                  )}
                  {!last ? (
                    <ChevronRight
                      className="size-3.5 text-[var(--color-admin-faint)]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-y-4 gap-x-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[21px] leading-7 font-semibold tracking-tight text-[var(--color-admin-text)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-[14px] leading-5 text-[var(--color-admin-muted)] max-w-2xl text-balance">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
