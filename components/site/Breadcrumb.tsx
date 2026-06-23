// Quiet, editorial breadcrumb for sub-routes (room detail, offer detail,
// booking funnel). The home crumb is implicit — first crumb is the section.
// Uses the same eyebrow type-scale as section labels so it never competes.

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
  /** Use on dark surfaces (booking funnel ink banners). */
  invert?: boolean;
  className?: string;
};

export default function Breadcrumb({ items, invert = false, className }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "font-sans text-[10.5px] uppercase tracking-[0.22em]",
        invert ? "text-white/55" : "text-ink/55",
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className={cn(
                    "transition-colors",
                    invert ? "hover:text-white" : "hover:text-ink",
                  )}
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={cn(invert ? "text-white" : "text-ink", last && "font-medium")}
                  aria-current={last ? "page" : undefined}
                >
                  {c.label}
                </span>
              )}
              {!last && (
                <ChevronRight
                  aria-hidden
                  className={cn("h-3 w-3", invert ? "text-white/35" : "text-ink/35")}
                  strokeWidth={1.75}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
