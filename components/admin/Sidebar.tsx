"use client";

import {
  BedDouble,
  CalendarRange,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  CreditCard,
  Gauge,
  Globe2,
  LineChart,
  type LucideIcon,
  PanelsTopLeft,
  Tag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { hasPermission } from "@/lib/admin/auth";
import type { Permission } from "@/lib/admin/types";

import { useNavDrawer } from "./AdminGate";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Permission requise pour afficher l'élément. */
  permission?: Permission;
  /** Match « strict » : actif uniquement si pathname === href. Sinon, startsWith. */
  exact?: boolean;
};

type NavSection = { label: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: "Vue d'ensemble",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: Gauge, exact: true, permission: "view-dashboard" },
    ],
  },
  {
    label: "Front office",
    items: [
      { href: "/admin/reservations", label: "Réservations", icon: CalendarRange, permission: "manage-reservations" },
      { href: "/admin/chambres", label: "Chambres", icon: BedDouble, permission: "manage-rooms" },
      { href: "/admin/clients", label: "Clients", icon: Users, permission: "manage-guests" },
    ],
  },
  {
    label: "Revenu",
    items: [
      { href: "/admin/tarifs", label: "Tarifs & promos", icon: Tag, permission: "manage-rates" },
      { href: "/admin/tarifs/canaux", label: "Canaux OTA", icon: Globe2, permission: "manage-channels" },
      { href: "/admin/facturation", label: "Facturation", icon: CreditCard, permission: "view-billing" },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { href: "/admin/exploitation", label: "Rapports & équipe", icon: LineChart, permission: "view-reports" },
      { href: "/admin/exploitation/notifications", label: "Notifications", icon: ClipboardList, permission: "view-dashboard" },
    ],
  },
];

const COLLAPSE_KEY = "admin:sidebar:collapsed:v1";

export function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useNavDrawer();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLLAPSE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setCollapsed(raw === "1");
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <>
      {/* ── Rail desktop (lg+) : repliable, hairline, collant ───────────── */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 h-dvh sticky top-0 flex-col",
          "border-r border-[var(--color-admin-border)] bg-[var(--color-admin-panel)]",
          "transition-[width] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "w-[68px]" : "w-[260px]",
        )}
        style={{ zIndex: "var(--z-admin-sidebar)" }}
        aria-label="Navigation principale"
      >
        <SidebarBrand collapsed={collapsed} />
        <SidebarNav pathname={pathname} collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {/* ── Tiroir hors-canevas (< lg) ──────────────────────────────────── */}
      <MobileDrawer open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}

/* ── Tiroir mobile : backdrop, ESC, scroll-lock, focus-trap-lite ───────── */

function MobileDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string | null;
}) {
  const panelRef = useRef<HTMLElement | null>(null);

  // Verrou de défilement du corps pendant que le tiroir est ouvert.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Fermeture sur Échap + focus-trap allégé (Tab cycle dans le panneau).
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  // Au montage ouvert : on déplace le focus dans le panneau.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div
      className={cn("lg:hidden", !open && "pointer-events-none")}
      onKeyDown={onKeyDown}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-[var(--color-admin-scrim)] transition-opacity duration-200 ease-out",
          "motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
        style={{ zIndex: "var(--z-admin-overlay)" }}
        aria-hidden
        onClick={onClose}
      />

      {/* Panneau */}
      <aside
        ref={panelRef as React.RefObject<HTMLElement>}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation principale"
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 left-0 w-[284px] max-w-[86vw] flex flex-col outline-none",
          "border-r border-[var(--color-admin-border)] bg-[var(--color-admin-panel)]",
          "shadow-[var(--shadow-admin-lg)]",
          "transition-transform duration-[220ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ zIndex: "var(--z-admin-modal)" }}
      >
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-[var(--color-admin-divider)]">
          <BrandMark />
          <BrandText />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la navigation"
            className={cn(
              "ml-auto inline-flex size-9 items-center justify-center rounded-[var(--radius-admin-md)]",
              "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
              "hover:bg-[var(--color-admin-sunken)] transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
            )}
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>
        <SidebarNav pathname={pathname} collapsed={false} touch />
      </aside>
    </div>
  );
}

/* ── Sous-composants partagés rail/tiroir ──────────────────────────────── */

function BrandMark() {
  return (
    <div className="inline-flex size-9 items-center justify-center rounded-[var(--radius-admin-md)] bg-marine text-white shrink-0 shadow-[var(--shadow-admin-xs)]">
      <PanelsTopLeft className="size-[18px]" strokeWidth={1.75} />
    </div>
  );
}

function BrandText() {
  return (
    <div className="min-w-0">
      <p className="text-[14px] font-semibold leading-tight tracking-tight text-[var(--color-admin-text)] truncate">
        Notre Hôtel
      </p>
      <p className="text-[11px] leading-tight text-[var(--color-admin-muted)] truncate">
        Espace d&apos;administration
      </p>
    </div>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "h-16 flex items-center gap-2.5 border-b border-[var(--color-admin-divider)]",
        collapsed ? "justify-center px-0" : "px-4",
      )}
    >
      <BrandMark />
      {!collapsed ? <BrandText /> : null}
    </div>
  );
}

function SidebarNav({
  pathname,
  collapsed,
  touch = false,
}: {
  pathname: string | null;
  collapsed: boolean;
  /** Cibles tactiles ≥44px (tiroir mobile). */
  touch?: boolean;
}) {
  return (
    <nav className="flex-1 overflow-y-auto scroll-dark px-3 py-4">
      {sections.map((section) => (
        <SidebarSection
          key={section.label}
          section={section}
          pathname={pathname}
          collapsed={collapsed}
          touch={touch}
        />
      ))}
    </nav>
  );
}

function SidebarFooter({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-[var(--color-admin-divider)] p-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
        className={cn(
          "w-full inline-flex items-center gap-2.5 h-9 rounded-[var(--radius-admin-md)] text-[13px] font-medium",
          "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
          "hover:bg-[var(--color-admin-sunken)] transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
          collapsed ? "justify-center px-0" : "px-2.5",
        )}
      >
        {collapsed ? (
          <ChevronsRight className="size-[18px]" strokeWidth={1.75} />
        ) : (
          <ChevronsLeft className="size-[18px]" strokeWidth={1.75} />
        )}
        {!collapsed ? <span>Replier</span> : null}
      </button>
    </div>
  );
}

function SidebarSection({
  section,
  pathname,
  collapsed,
  touch = false,
}: {
  section: NavSection;
  pathname: string | null;
  collapsed: boolean;
  touch?: boolean;
}) {
  const visible = section.items.filter((item) =>
    item.permission ? hasPermission(item.permission) : true,
  );
  if (visible.length === 0) return null;

  return (
    <div className="mb-3 last:mb-0">
      {!collapsed ? (
        <p className="px-2.5 pb-1.5 text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-faint)]">
          {section.label}
        </p>
      ) : (
        <div className="my-2 mx-auto h-px w-7 bg-[var(--color-admin-divider)]" aria-hidden />
      )}
      <ul className="space-y-1">
        {visible.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href) ?? false;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "group inline-flex w-full items-center gap-3 rounded-[var(--radius-admin-md)] text-[13.5px]",
                  touch ? "h-11" : "h-10",
                  "transition-colors duration-150 motion-reduce:transition-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
                  collapsed ? "justify-center px-0" : "px-2.5",
                  active
                    ? "bg-[var(--color-admin-accent-soft)] text-[var(--color-admin-accent)] font-medium"
                    : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)]",
                )}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-colors duration-150 motion-reduce:transition-none",
                    active
                      ? "text-[var(--color-admin-accent)]"
                      : "text-[var(--color-admin-faint)] group-hover:text-[var(--color-admin-muted)]",
                  )}
                  strokeWidth={1.75}
                />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
