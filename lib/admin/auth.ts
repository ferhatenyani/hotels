// Auth mockée. Ne fonctionne PAS comme une vraie auth — accepte n'importe
// quel `staff` seedé avec son mot de passe en clair. Sert uniquement à
// faire jouer les permissions et la garde de route dans la démo admin.

"use client";

import { useEffect, useSyncExternalStore } from "react";

import { roleHas } from "./rbac";
import { repo } from "./repo";
import { subscribe as subscribeStore } from "./store";
import type { Permission, Session, StaffRole } from "./types";

const SESSION_KEY = "admin:session:v1";

// Cache mémoire de la session — `useSyncExternalStore` exige qu'on lui
// renvoie EXACTEMENT la même référence tant que rien n'a changé. Si on
// re-parse le JSON à chaque appel, on retourne un nouvel objet à chaque
// render → boucle de re-renders infinie. On compare donc la chaîne brute
// et on ne re-crée l'objet que si elle a vraiment changé.
let cachedRaw: string | null | undefined = undefined;
let cachedSession: Session | null = null;

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function read(): Session | null {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  try {
    cachedSession = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

function write(s: Session | null) {
  if (typeof window === "undefined") return;
  if (s) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
  // Force la prochaine lecture à reparser (la chaîne brute aura changé).
  cachedRaw = undefined;
  for (const l of listeners) l();
}

const listeners = new Set<() => void>();

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const getSnapshotServer = () => null;

/** Lecture instantanée de la session (synchrone, navigateur uniquement). */
export function currentSession(): Session | null {
  return read();
}

/** Hook React — rerend quand la session change. */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, read, getSnapshotServer);
}

/** Hook combiné : session + reflet du store admin pour les composants qui
 *  affichent du staff (sidebar etc.) */
export function useStoreReactivity() {
  const session = useSession();
  useEffect(() => {
    const unsub = subscribeStore(() => {});
    return unsub;
  }, []);
  return session;
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const staff = await repo.staff.byEmail(email.trim());
  if (!staff) return { ok: false, error: "Aucun compte avec cet e-mail." };
  if (!staff.active) return { ok: false, error: "Compte désactivé." };
  if (staff.password !== password)
    return { ok: false, error: "Mot de passe incorrect." };

  const session: Session = {
    staffId: staff.id,
    email: staff.email,
    firstName: staff.firstName,
    lastName: staff.lastName,
    role: staff.role,
    signedInAt: new Date().toISOString(),
  };
  write(session);
  await repo.staff.update(staff.id, { lastLoginAt: session.signedInAt });
  return { ok: true, session };
}

export function signOut() {
  write(null);
}

/** Bascule rapide de rôle pour la démo — uniquement disponible si la session
 *  courante est `direction` (ou si pas de session : signe quelqu'un d'autre). */
export async function switchRole(role: StaffRole): Promise<Session | null> {
  const all = await repo.staff.list();
  const target = all.find((s) => s.role === role && s.active);
  if (!target) return null;
  const session: Session = {
    staffId: target.id,
    email: target.email,
    firstName: target.firstName,
    lastName: target.lastName,
    role: target.role,
    signedInAt: new Date().toISOString(),
  };
  write(session);
  return session;
}

export function hasPermission(perm: Permission, session?: Session | null): boolean {
  const s = session ?? read();
  if (!s) return false;
  return roleHas(s.role, perm);
}
