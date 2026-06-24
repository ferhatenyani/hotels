"use client";

import { Bell, ChevronDown, LogOut, RotateCcw, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  signOut as authSignOut,
  switchRole as authSwitchRole,
  useSession,
} from "@/lib/admin/auth";
import { repo } from "@/lib/admin/repo";
import { resetDb } from "@/lib/admin/store";
import { staffRoleLabels, type Notification, type StaffRole } from "@/lib/admin/types";

import { Avatar } from "./AvatarChip";
import { IconButton } from "./Button";
import { Kbd } from "./Kbd";

export function Topbar() {
  const router = useRouter();
  const session = useSession();
  const [unread, setUnread] = useState<Notification[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnread([]);
      return;
    }
    void repo.notifications.unread(session.role).then(setUnread);
  }, [session]);

  if (!session) return null;

  const onSignOut = () => {
    authSignOut();
    router.replace("/admin/login");
  };

  const onSwitch = async (role: StaffRole) => {
    await authSwitchRole(role);
    setMenuOpen(false);
    router.refresh();
  };

  const onReset = () => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      "Réinitialiser la démo ? Toutes les modifications locales seront perdues et les données reprendront leur état initial.",
    );
    if (!ok) return;
    resetDb();
    router.refresh();
  };

  return (
    <header className="h-14 sticky top-0 z-30 bg-[var(--color-admin-panel)]/95 backdrop-blur border-b border-[var(--color-admin-border)] flex items-center px-4 gap-3">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] text-[var(--color-admin-muted)] bg-[var(--color-admin-sunken)]">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <span className="ml-1">Commande rapide</span>
        </span>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="hidden md:inline-flex items-center gap-1.5 h-8 px-2 rounded-md text-[11.5px] font-medium text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)] transition-colors"
        title="Réinitialiser les données de démo"
      >
        <RotateCcw className="size-3.5" />
        Réinitialiser la démo
      </button>

      <button
        type="button"
        className="relative inline-flex size-9 items-center justify-center rounded-md text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)] transition-colors"
        aria-label={`Notifications — ${unread.length} non lue${unread.length > 1 ? "s" : ""}`}
      >
        <Bell className="size-4" strokeWidth={1.75} />
        {unread.length > 0 ? (
          <span
            className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-admin-danger-fg)] px-1 text-[9.5px] font-medium text-white tnum"
            aria-hidden
          >
            {unread.length}
          </span>
        ) : null}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex items-center gap-2 h-9 pl-1 pr-2 rounded-md hover:bg-[var(--color-admin-sunken)] transition-colors"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Avatar firstName={session.firstName} lastName={session.lastName} size="sm" />
          <span className="hidden sm:block text-left leading-tight">
            <span className="block text-[12.5px] font-medium text-[var(--color-admin-text)]">
              {session.firstName} {session.lastName}
            </span>
            <span className="block text-[10.5px] text-[var(--color-admin-muted)] uppercase tracking-[0.06em]">
              {staffRoleLabels[session.role]}
            </span>
          </span>
          <ChevronDown className="size-3 text-[var(--color-admin-faint)]" />
        </button>
        {menuOpen ? (
          <>
            <button
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-30"
              onClick={() => setMenuOpen(false)}
            />
            <div
              role="menu"
              className="absolute right-0 top-full mt-1.5 w-64 z-40 rounded-lg bg-[var(--color-admin-panel)] shadow-lg ring-1 ring-[var(--color-admin-border)] p-1.5"
            >
              <div className="px-2.5 py-2 border-b border-[var(--color-admin-divider)] mb-1.5">
                <p className="text-[12.5px] font-medium text-[var(--color-admin-text)] truncate">
                  {session.firstName} {session.lastName}
                </p>
                <p className="text-[11.5px] text-[var(--color-admin-muted)] truncate">
                  {session.email}
                </p>
              </div>

              <p className="px-2.5 pt-1 pb-1 text-[10px] uppercase tracking-[0.1em] text-[var(--color-admin-faint)]">
                Basculer le rôle (démo)
              </p>
              {(Object.keys(staffRoleLabels) as StaffRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSwitch(r)}
                  className={cn(
                    "w-full inline-flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-[12.5px]",
                    "transition-colors",
                    r === session.role
                      ? "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)]"
                      : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)]",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Shield className="size-3.5 text-[var(--color-admin-faint)]" />
                    {staffRoleLabels[r]}
                  </span>
                  {r === session.role ? (
                    <span className="text-[10px] uppercase tracking-[0.06em] text-marine">
                      Actuel
                    </span>
                  ) : null}
                </button>
              ))}

              <div className="border-t border-[var(--color-admin-divider)] mt-1.5 pt-1.5">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full inline-flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-[var(--color-admin-danger-fg)] hover:bg-[var(--color-admin-danger-bg)] transition-colors"
                  role="menuitem"
                >
                  <LogOut className="size-3.5" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <IconButton
        aria-label="Aide"
        icon={<HelpDot />}
        className="hidden md:inline-flex"
      />
    </header>
  );
}

function HelpDot() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <path
        d="M6.5 6.2c.25-.85 1-1.45 1.9-1.45 1.05 0 1.85.78 1.85 1.7 0 1.45-1.85 1.55-1.85 2.55"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="8.4" cy="11.4" r="0.7" fill="currentColor" />
    </svg>
  );
}
