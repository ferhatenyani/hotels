// Store en mémoire — la couche brute. Aucun composant n'y touche
// directement : passe par `lib/admin/repo`. Le store sait :
//   - se construire à partir des seeds au premier import,
//   - se rehydrater depuis localStorage côté navigateur,
//   - se sérialiser dans localStorage à chaque mutation,
//   - notifier les abonnés (hook `useStoreSnapshot` côté client).

import {
  seedChannels,
  seedGuests,
  seedInvoices,
  seedMessages,
  seedNotifications,
  seedPromos,
  seedRates,
  seedReservations,
  seedRooms,
  seedStaff,
  seedTasks,
} from "./seeds";

import type {
  Channel,
  Guest,
  Invoice,
  Message,
  Notification,
  Promo,
  Rate,
  Reservation,
  Room,
  Staff,
  Task,
} from "./types";

const STORAGE_KEY = "admin:db:v1";

export type AdminDb = {
  staff: Staff[];
  rooms: Room[];
  reservations: Reservation[];
  guests: Guest[];
  tasks: Task[];
  invoices: Invoice[];
  rates: Rate[];
  promos: Promo[];
  channels: Channel[];
  messages: Message[];
  notifications: Notification[];
};

function freshDb(): AdminDb {
  return {
    staff: structuredClone(seedStaff),
    rooms: structuredClone(seedRooms),
    reservations: structuredClone(seedReservations),
    guests: structuredClone(seedGuests),
    tasks: structuredClone(seedTasks),
    invoices: structuredClone(seedInvoices),
    rates: structuredClone(seedRates),
    promos: structuredClone(seedPromos),
    channels: structuredClone(seedChannels),
    messages: structuredClone(seedMessages),
    notifications: structuredClone(seedNotifications),
  };
}

const isBrowser = typeof window !== "undefined";

let db: AdminDb = freshDb();
let hydrated = false;
const listeners = new Set<() => void>();

function hydrateOnce() {
  if (hydrated || !isBrowser) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminDb;
      db = { ...freshDb(), ...parsed };
    }
  } catch {
    // localStorage corrompu — on retombe sur les seeds.
    db = freshDb();
  }
}

function persist() {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // quota atteint / mode privé — on continue en mémoire seule.
  }
}

function emit() {
  for (const l of listeners) l();
}

/** Lecture brute — utilisable côté server ET client (sans hydratation localStorage en SSR). */
export function readDb(): AdminDb {
  hydrateOnce();
  return db;
}

/** Mutation atomique — synchrone côté store, async côté repo. */
export function writeDb(mutator: (draft: AdminDb) => void): void {
  hydrateOnce();
  mutator(db);
  persist();
  emit();
}

/** Abonnement aux changements (hook React-friendly). */
export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Réinitialise au seed — utile pour le bouton « Réinitialiser la démo ». */
export function resetDb(): void {
  db = freshDb();
  persist();
  emit();
}
