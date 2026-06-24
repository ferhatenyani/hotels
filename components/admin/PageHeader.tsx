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
          <ol className="flex items-center flex-wrap gap-1.5 text-[11.5px] text-[var(--color-admin-muted)]">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                  {c.href && !last ? (
                    <Link
                      href={c.href}
                      className="hover:text-[var(--color-admin-text)] transition-colors"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className={cn(last && "text-[var(--color-admin-text)]")}>{c.label}</span>
                  )}
                  {!last ? (
                    <ChevronRight
                      className="size-3 text-[var(--color-admin-faint)]"
                      aria-hidden
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] leading-7 tracking-tight text-[var(--color-admin-text)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-[13px] leading-5 text-[var(--color-admin-muted)] max-w-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}
