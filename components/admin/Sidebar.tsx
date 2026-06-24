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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { hasPermission } from "@/lib/admin/auth";
import type { Permission } from "@/lib/admin/types";

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLLAPSE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setCollapsed(raw === "1");
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "shrink-0 h-dvh sticky top-0 border-r border-[var(--color-admin-border)]",
        "bg-[var(--color-admin-panel)] flex flex-col z-40 transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-[240px]",
      )}
      aria-label="Navigation admin"
    >
      <div
        className={cn(
          "h-14 flex items-center gap-2.5 px-3 border-b border-[var(--color-admin-divider)]",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="inline-flex size-8 items-center justify-center rounded-md bg-marine text-white shrink-0">
          <PanelsTopLeft className="size-4" />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="font-display text-[13px] leading-tight tracking-tight text-[var(--color-admin-text)] truncate">
              Notre Hôtel
            </p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-admin-muted)]">
              Aperture · Admin
            </p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto scroll-dark py-3">
        {sections.map((section) => (
          <SidebarSection
            key={section.label}
            section={section}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-[var(--color-admin-divider)] p-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
          className={cn(
            "w-full inline-flex items-center gap-2 h-8 rounded-md text-[12px] font-medium",
            "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)]",
            "transition-colors",
            collapsed ? "justify-center px-0" : "px-2",
          )}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!collapsed ? <span>Replier</span> : null}
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({
  section,
  pathname,
  collapsed,
}: {
  section: NavSection;
  pathname: string | null;
  collapsed: boolean;
}) {
  const visible = section.items.filter((item) =>
    item.permission ? hasPermission(item.permission) : true,
  );
  if (visible.length === 0) return null;

  return (
    <div className="mb-1.5">
      {!collapsed ? (
        <p className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-[0.12em] font-medium text-[var(--color-admin-faint)]">
          {section.label}
        </p>
      ) : (
        <div className="my-1 mx-auto h-px w-6 bg-[var(--color-admin-divider)]" aria-hidden />
      )}
      <ul className="px-2 space-y-0.5">
        {visible.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "group inline-flex w-full items-center gap-2.5 rounded-md h-9 text-[13px]",
                  "transition-colors duration-150",
                  collapsed ? "justify-center px-0" : "px-2.5",
                  active
                    ? "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)] font-medium"
                    : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)]",
                )}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-marine" : "text-[var(--color-admin-faint)] group-hover:text-[var(--color-admin-muted)]",
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
