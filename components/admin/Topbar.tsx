"use client";

import { Bell, ChevronDown, LogOut, Menu, RotateCcw, Shield } from "lucide-react";
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

import { useNavDrawer } from "./AdminGate";
import { Avatar } from "./AvatarChip";
import { IconButton } from "./Button";
import { Kbd } from "./Kbd";

export function Topbar() {
  const router = useRouter();
  const session = useSession();
  const { toggle: toggleDrawer } = useNavDrawer();
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

  const unreadLabel = `Notifications — ${unread.length} non lue${unread.length > 1 ? "s" : ""}`;

  return (
    <header
      className="h-16 sticky top-0 bg-[var(--color-admin-panel)]/85 backdrop-blur-xl border-b border-[var(--color-admin-border)] flex items-center px-3 sm:px-4 lg:px-6 gap-2 sm:gap-3"
      style={{ zIndex: "var(--z-admin-sticky)" }}
    >
      {/* Hamburger — ouvre le tiroir de navigation sous lg. */}
      <button
        type="button"
        onClick={toggleDrawer}
        aria-label="Ouvrir la navigation"
        className={cn(
          "lg:hidden inline-flex size-11 items-center justify-center rounded-[var(--radius-admin-md)] shrink-0",
          "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
          "hover:bg-[var(--color-admin-sunken)] transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
        )}
      >
        <Menu className="size-[20px]" strokeWidth={1.75} />
      </button>

      {/* Zone de recherche / commande rapide (masquée sur très petit écran). */}
      <div className="flex-1 min-w-0 flex items-center">
        <button
          type="button"
          className={cn(
            "hidden md:inline-flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-[var(--radius-admin-md)]",
            "text-[13px] text-[var(--color-admin-muted)] bg-[var(--color-admin-sunken)]",
            "hover:bg-[var(--color-admin-border)] transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
          )}
        >
          <span>Commande rapide</span>
          <span className="inline-flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className={cn(
          "hidden lg:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-[var(--radius-admin-md)] text-[12.5px] font-medium",
          "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
          "hover:bg-[var(--color-admin-sunken)] transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
        )}
        title="Réinitialiser les données de démo"
      >
        <RotateCcw className="size-4" strokeWidth={1.75} />
        Réinitialiser la démo
      </button>

      <button
        type="button"
        className={cn(
          "relative inline-flex size-11 lg:size-10 items-center justify-center rounded-[var(--radius-admin-md)] shrink-0",
          "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]",
          "hover:bg-[var(--color-admin-sunken)] transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
        )}
        aria-label={unreadLabel}
      >
        <Bell className="size-[18px]" strokeWidth={1.75} />
        {unread.length > 0 ? (
          <span
            className="absolute top-2 right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-admin-danger-fg)] px-1 text-[10px] font-medium text-white tnum ring-2 ring-[var(--color-admin-panel)]"
            aria-hidden
          >
            {unread.length}
          </span>
        ) : null}
      </button>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            "inline-flex items-center gap-2 h-11 lg:h-10 pl-1 pr-1.5 sm:pr-2 rounded-[var(--radius-admin-md)]",
            "hover:bg-[var(--color-admin-sunken)] transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
          )}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Avatar firstName={session.firstName} lastName={session.lastName} size="sm" />
          <span className="hidden sm:block text-left leading-tight max-w-[10rem]">
            <span className="block text-[13px] font-medium text-[var(--color-admin-text)] truncate">
              {session.firstName} {session.lastName}
            </span>
            <span className="block text-[11px] text-[var(--color-admin-muted)] truncate">
              {staffRoleLabels[session.role]}
            </span>
          </span>
          <ChevronDown className="hidden sm:block size-3.5 text-[var(--color-admin-faint)] shrink-0" />
        </button>
        {menuOpen ? (
          <>
            <button
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0"
              style={{ zIndex: "var(--z-admin-sticky)" }}
              onClick={() => setMenuOpen(false)}
            />
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-[var(--radius-admin-lg)] bg-[var(--color-admin-panel)] shadow-[var(--shadow-admin-pop)] ring-1 ring-[var(--color-admin-border)] p-2"
              style={{ zIndex: "var(--z-admin-dropdown)" }}
            >
              <div className="px-2.5 py-2 border-b border-[var(--color-admin-divider)] mb-2">
                <p className="text-[13px] font-medium text-[var(--color-admin-text)] truncate">
                  {session.firstName} {session.lastName}
                </p>
                <p className="text-[12px] text-[var(--color-admin-muted)] truncate">
                  {session.email}
                </p>
              </div>

              <p className="px-2.5 pt-1 pb-1.5 text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-faint)]">
                Basculer le rôle (démo)
              </p>
              {(Object.keys(staffRoleLabels) as StaffRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="menuitem"
                  onClick={() => onSwitch(r)}
                  className={cn(
                    "w-full inline-flex items-center justify-between gap-2 px-2.5 h-9 rounded-[var(--radius-admin-sm)] text-[13px]",
                    "transition-colors duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine",
                    r === session.role
                      ? "bg-[var(--color-admin-accent-soft)] text-[var(--color-admin-accent)] font-medium"
                      : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)]",
                  )}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Shield
                      className={cn(
                        "size-4",
                        r === session.role
                          ? "text-[var(--color-admin-accent)]"
                          : "text-[var(--color-admin-faint)]",
                      )}
                      strokeWidth={1.75}
                    />
                    {staffRoleLabels[r]}
                  </span>
                  {r === session.role ? (
                    <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--color-admin-accent)]">
                      Actuel
                    </span>
                  ) : null}
                </button>
              ))}

              {/* Réinitialisation accessible au mobile via le menu (cachée du topbar < lg). */}
              <div className="lg:hidden border-t border-[var(--color-admin-divider)] mt-2 pt-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onReset();
                  }}
                  className="w-full inline-flex items-center gap-2.5 px-2.5 h-9 rounded-[var(--radius-admin-sm)] text-[13px] text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)] transition-colors duration-150"
                >
                  <RotateCcw className="size-4" strokeWidth={1.75} />
                  Réinitialiser la démo
                </button>
              </div>

              <div className="border-t border-[var(--color-admin-divider)] mt-2 pt-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={onSignOut}
                  className="w-full inline-flex items-center gap-2.5 px-2.5 h-9 rounded-[var(--radius-admin-sm)] text-[13px] text-[var(--color-admin-danger-fg)] hover:bg-[var(--color-admin-danger-bg)] transition-colors duration-150"
                >
                  <LogOut className="size-4" strokeWidth={1.75} />
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
        className="hidden lg:inline-flex shrink-0"
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
