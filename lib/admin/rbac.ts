// Mapping rôle → permissions. Lue par `hasPermission(perm)` en client comme
// en serveur — la garde finale reste UI/optimiste, pas une vraie sécurité.
//
// Quand un agent ajoute une nouvelle permission (§5 conventions), il
// l'enregistre ici et l'octroie aux rôles concernés.

import type { Permission, StaffRole } from "./types";

const rolePermissions: Record<StaffRole, Permission[]> = {
  direction: [
    "view-dashboard",
    "manage-reservations",
    "check-in-out",
    "manage-rooms",
    "housekeeping",
    "maintenance",
    "manage-guests",
    "send-messages",
    "manage-rates",
    "manage-promos",
    "manage-channels",
    "view-billing",
    "manage-billing",
    "process-payments",
    "view-reports",
    "night-audit",
    "manage-staff",
    "manage-roles",
    "manage-notifications",
  ],
  manager: [
    "view-dashboard",
    "manage-reservations",
    "check-in-out",
    "manage-rooms",
    "housekeeping",
    "maintenance",
    "manage-guests",
    "send-messages",
    "manage-rates",
    "manage-promos",
    "manage-channels",
    "view-billing",
    "manage-billing",
    "process-payments",
    "view-reports",
    "night-audit",
    "manage-staff",
    "manage-notifications",
  ],
  reception: [
    "view-dashboard",
    "manage-reservations",
    "check-in-out",
    "manage-rooms",
    "manage-guests",
    "send-messages",
    "view-billing",
    "manage-billing",
    "process-payments",
  ],
  gouvernante: [
    "view-dashboard",
    "manage-rooms",
    "housekeeping",
    "maintenance",
  ],
  comptabilite: [
    "view-dashboard",
    "view-billing",
    "manage-billing",
    "process-payments",
    "view-reports",
    "night-audit",
  ],
};

export function permissionsFor(role: StaffRole): Permission[] {
  return rolePermissions[role];
}

export function roleHas(role: StaffRole, perm: Permission): boolean {
  return rolePermissions[role].includes(perm);
}
