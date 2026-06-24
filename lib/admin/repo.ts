// Repository — la seule API publique pour interagir avec les données admin.
// Garde la signature `async` partout pour que le swap vers un vrai backend
// soit indolore (les composants `await repo.x.y()` resteront identiques).
//
// Ajoute ici les méthodes manquantes au fur et à mesure que les agents en
// ont besoin — pas dans les composants.

import { newId, newRef } from "./id";
import { readDb, writeDb } from "./store";
import type {
  Channel,
  ChannelStatus,
  Guest,
  GuestNote,
  Invoice,
  InvoiceItem,
  Message,
  MessageChannel,
  Notification,
  Payment,
  Promo,
  Rate,
  Reservation,
  ReservationStatus,
  Room,
  RoomStatus,
  Staff,
  StaffRole,
  Task,
  TaskStatus,
} from "./types";

const nowIso = () => new Date().toISOString();

// ─── staff ─────────────────────────────────────────────────────────────

export const staffRepo = {
  list: async (): Promise<Staff[]> => readDb().staff,
  byId: async (id: string): Promise<Staff | undefined> =>
    readDb().staff.find((s) => s.id === id),
  byEmail: async (email: string): Promise<Staff | undefined> =>
    readDb().staff.find((s) => s.email.toLowerCase() === email.toLowerCase()),
  update: async (id: string, patch: Partial<Staff>): Promise<Staff | undefined> => {
    let result: Staff | undefined;
    writeDb((db) => {
      const i = db.staff.findIndex((s) => s.id === id);
      if (i >= 0) {
        db.staff[i] = { ...db.staff[i], ...patch };
        result = db.staff[i];
      }
    });
    return result;
  },
  create: async (input: Omit<Staff, "id" | "createdAt">): Promise<Staff> => {
    const created: Staff = { ...input, id: newId("user"), createdAt: nowIso() };
    writeDb((db) => {
      db.staff.push(created);
    });
    return created;
  },
};

// ─── rooms ─────────────────────────────────────────────────────────────

export const roomsRepo = {
  list: async (): Promise<Room[]> => readDb().rooms,
  byNumber: async (number: string): Promise<Room | undefined> =>
    readDb().rooms.find((r) => r.number === number),
  byStatus: async (status: RoomStatus): Promise<Room[]> =>
    readDb().rooms.filter((r) => r.status === status),
  setStatus: async (
    number: string,
    status: RoomStatus,
    note?: string,
  ): Promise<Room | undefined> => {
    let result: Room | undefined;
    writeDb((db) => {
      const i = db.rooms.findIndex((r) => r.number === number);
      if (i >= 0) {
        db.rooms[i] = {
          ...db.rooms[i],
          status,
          note: note ?? db.rooms[i].note,
          lastCleanedAt:
            status === "vacant-clean" ? nowIso() : db.rooms[i].lastCleanedAt,
        };
        result = db.rooms[i];
      }
    });
    return result;
  },
  setNote: async (number: string, note: string): Promise<Room | undefined> => {
    let result: Room | undefined;
    writeDb((db) => {
      const i = db.rooms.findIndex((r) => r.number === number);
      if (i >= 0) {
        db.rooms[i] = { ...db.rooms[i], note };
        result = db.rooms[i];
      }
    });
    return result;
  },
};

// ─── reservations ──────────────────────────────────────────────────────

export type ReservationFilter = {
  status?: ReservationStatus | ReservationStatus[];
  guestId?: string;
  roomNumber?: string;
  dateRange?: { from: string; to: string };
  search?: string;
};

export const reservationsRepo = {
  list: async (filter?: ReservationFilter): Promise<Reservation[]> => {
    const all = readDb().reservations;
    if (!filter) return all;
    return all.filter((r) => {
      if (filter.status) {
        const statuses = Array.isArray(filter.status)
          ? filter.status
          : [filter.status];
        if (!statuses.includes(r.status)) return false;
      }
      if (filter.guestId && r.guestId !== filter.guestId) return false;
      if (filter.roomNumber && r.roomNumber !== filter.roomNumber) return false;
      if (filter.dateRange) {
        // chevauche la fenêtre [from, to)
        if (r.checkOut <= filter.dateRange.from) return false;
        if (r.checkIn >= filter.dateRange.to) return false;
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!r.ref.toLowerCase().includes(q) && !r.notes?.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  },
  byId: async (id: string): Promise<Reservation | undefined> =>
    readDb().reservations.find((r) => r.id === id),
  byRef: async (ref: string): Promise<Reservation | undefined> =>
    readDb().reservations.find((r) => r.ref === ref),
  forDate: async (isoDate: string): Promise<Reservation[]> =>
    readDb().reservations.filter(
      (r) => r.checkIn <= isoDate && r.checkOut > isoDate,
    ),
  arrivalsToday: async (): Promise<Reservation[]> => {
    const today = nowIso().slice(0, 10);
    return readDb().reservations.filter(
      (r) =>
        r.checkIn === today &&
        (r.status === "arrival-expected" || r.status === "confirmed"),
    );
  },
  departuresToday: async (): Promise<Reservation[]> => {
    const today = nowIso().slice(0, 10);
    return readDb().reservations.filter(
      (r) =>
        r.checkOut === today &&
        (r.status === "departure-expected" || r.status === "checked-in"),
    );
  },
  create: async (
    input: Omit<Reservation, "id" | "ref" | "createdAt">,
  ): Promise<Reservation> => {
    const created: Reservation = {
      ...input,
      id: newId("res"),
      ref: newRef("RES"),
      createdAt: nowIso(),
    };
    writeDb((db) => {
      db.reservations.push(created);
    });
    return created;
  },
  update: async (
    id: string,
    patch: Partial<Reservation>,
  ): Promise<Reservation | undefined> => {
    let result: Reservation | undefined;
    writeDb((db) => {
      const i = db.reservations.findIndex((r) => r.id === id);
      if (i >= 0) {
        db.reservations[i] = {
          ...db.reservations[i],
          ...patch,
          modifiedAt: nowIso(),
        };
        result = db.reservations[i];
      }
    });
    return result;
  },
  cancel: async (id: string): Promise<Reservation | undefined> =>
    reservationsRepo.update(id, { status: "cancelled" }),
  checkIn: async (id: string, roomNumber: string): Promise<Reservation | undefined> => {
    let result: Reservation | undefined;
    writeDb((db) => {
      const i = db.reservations.findIndex((r) => r.id === id);
      if (i >= 0) {
        db.reservations[i] = {
          ...db.reservations[i],
          status: "checked-in",
          roomNumber,
          modifiedAt: nowIso(),
        };
        result = db.reservations[i];
        const ri = db.rooms.findIndex((r) => r.number === roomNumber);
        if (ri >= 0) {
          db.rooms[ri] = {
            ...db.rooms[ri],
            status: "occupied",
            occupiedBy: id,
          };
        }
      }
    });
    return result;
  },
  checkOut: async (id: string): Promise<Reservation | undefined> => {
    let result: Reservation | undefined;
    writeDb((db) => {
      const i = db.reservations.findIndex((r) => r.id === id);
      if (i >= 0) {
        const reservation = db.reservations[i];
        db.reservations[i] = {
          ...reservation,
          status: "checked-out",
          modifiedAt: nowIso(),
        };
        result = db.reservations[i];
        if (reservation.roomNumber) {
          const ri = db.rooms.findIndex((r) => r.number === reservation.roomNumber);
          if (ri >= 0) {
            db.rooms[ri] = {
              ...db.rooms[ri],
              status: "vacant-dirty",
              occupiedBy: undefined,
            };
          }
        }
      }
    });
    return result;
  },
};

// ─── guests ────────────────────────────────────────────────────────────

export const guestsRepo = {
  list: async (): Promise<Guest[]> => readDb().guests,
  byId: async (id: string): Promise<Guest | undefined> =>
    readDb().guests.find((g) => g.id === id),
  search: async (q: string): Promise<Guest[]> => {
    const needle = q.toLowerCase();
    return readDb().guests.filter((g) =>
      `${g.firstName} ${g.lastName} ${g.email} ${g.phone}`
        .toLowerCase()
        .includes(needle),
    );
  },
  create: async (
    input: Omit<Guest, "id" | "createdAt" | "notes" | "documents" | "totalStays" | "totalSpentDA" | "loyaltyPoints" | "vip">,
  ): Promise<Guest> => {
    const created: Guest = {
      ...input,
      id: newId("g"),
      createdAt: nowIso(),
      notes: [],
      documents: [],
      loyaltyPoints: 0,
      totalStays: 0,
      totalSpentDA: 0,
      vip: false,
    };
    writeDb((db) => {
      db.guests.push(created);
    });
    return created;
  },
  update: async (id: string, patch: Partial<Guest>): Promise<Guest | undefined> => {
    let result: Guest | undefined;
    writeDb((db) => {
      const i = db.guests.findIndex((g) => g.id === id);
      if (i >= 0) {
        db.guests[i] = { ...db.guests[i], ...patch };
        result = db.guests[i];
      }
    });
    return result;
  },
  addNote: async (
    id: string,
    note: Omit<GuestNote, "id" | "createdAt">,
  ): Promise<Guest | undefined> => {
    let result: Guest | undefined;
    writeDb((db) => {
      const i = db.guests.findIndex((g) => g.id === id);
      if (i >= 0) {
        db.guests[i] = {
          ...db.guests[i],
          notes: [
            ...db.guests[i].notes,
            { ...note, id: newId("gn"), createdAt: nowIso() },
          ],
        };
        result = db.guests[i];
      }
    });
    return result;
  },
};

// ─── tasks ─────────────────────────────────────────────────────────────

export const tasksRepo = {
  list: async (filter?: { status?: TaskStatus; assignedTo?: string }): Promise<Task[]> => {
    const all = readDb().tasks;
    if (!filter) return all;
    return all.filter((t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.assignedTo && t.assignedTo !== filter.assignedTo) return false;
      return true;
    });
  },
  forUser: async (userId: string): Promise<Task[]> =>
    readDb().tasks.filter((t) => t.assignedTo === userId),
  create: async (input: Omit<Task, "id" | "createdAt">): Promise<Task> => {
    const created: Task = { ...input, id: newId("t"), createdAt: nowIso() };
    writeDb((db) => {
      db.tasks.push(created);
    });
    return created;
  },
  assign: async (id: string, userId: string): Promise<Task | undefined> => {
    let result: Task | undefined;
    writeDb((db) => {
      const i = db.tasks.findIndex((t) => t.id === id);
      if (i >= 0) {
        db.tasks[i] = { ...db.tasks[i], assignedTo: userId };
        result = db.tasks[i];
      }
    });
    return result;
  },
  setStatus: async (id: string, status: TaskStatus): Promise<Task | undefined> => {
    let result: Task | undefined;
    writeDb((db) => {
      const i = db.tasks.findIndex((t) => t.id === id);
      if (i >= 0) {
        db.tasks[i] = {
          ...db.tasks[i],
          status,
          completedAt: status === "done" ? nowIso() : undefined,
        };
        result = db.tasks[i];
      }
    });
    return result;
  },
  complete: async (id: string, resolution?: string): Promise<Task | undefined> => {
    let result: Task | undefined;
    writeDb((db) => {
      const i = db.tasks.findIndex((t) => t.id === id);
      if (i >= 0) {
        db.tasks[i] = {
          ...db.tasks[i],
          status: "done",
          completedAt: nowIso(),
          resolution,
        };
        result = db.tasks[i];
      }
    });
    return result;
  },
};

// ─── invoices ──────────────────────────────────────────────────────────

export const invoicesRepo = {
  list: async (): Promise<Invoice[]> => readDb().invoices,
  byId: async (id: string): Promise<Invoice | undefined> =>
    readDb().invoices.find((i) => i.id === id),
  forReservation: async (reservationId: string): Promise<Invoice[]> =>
    readDb().invoices.filter((i) => i.reservationId === reservationId),
  create: async (
    input: Omit<Invoice, "id" | "ref" | "issuedAt" | "totalDA" | "paidDA" | "balanceDA">,
  ): Promise<Invoice> => {
    const totalDA = input.items.reduce((s, it) => s + it.totalDA, 0);
    const paidDA = input.payments.reduce((s, p) => s + p.amountDA, 0);
    const created: Invoice = {
      ...input,
      id: newId("inv"),
      ref: newRef("F"),
      issuedAt: nowIso(),
      totalDA,
      paidDA,
      balanceDA: totalDA - paidDA,
    };
    writeDb((db) => {
      db.invoices.push(created);
    });
    return created;
  },
  addItem: async (
    invoiceId: string,
    item: Omit<InvoiceItem, "id" | "addedAt">,
  ): Promise<Invoice | undefined> => {
    let result: Invoice | undefined;
    writeDb((db) => {
      const i = db.invoices.findIndex((inv) => inv.id === invoiceId);
      if (i >= 0) {
        const items = [
          ...db.invoices[i].items,
          { ...item, id: newId("it"), addedAt: nowIso() },
        ];
        const totalDA = items.reduce((s, it) => s + it.totalDA, 0);
        const paidDA = db.invoices[i].paidDA;
        db.invoices[i] = {
          ...db.invoices[i],
          items,
          totalDA,
          balanceDA: totalDA - paidDA,
          status: paidDA >= totalDA ? "paid" : paidDA > 0 ? "partial" : "open",
        };
        result = db.invoices[i];
      }
    });
    return result;
  },
  addPayment: async (
    invoiceId: string,
    payment: Omit<Payment, "id">,
  ): Promise<Invoice | undefined> => {
    let result: Invoice | undefined;
    writeDb((db) => {
      const i = db.invoices.findIndex((inv) => inv.id === invoiceId);
      if (i >= 0) {
        const payments = [...db.invoices[i].payments, { ...payment, id: newId("pay") }];
        const paidDA = payments.reduce((s, p) => s + p.amountDA, 0);
        const totalDA = db.invoices[i].totalDA;
        db.invoices[i] = {
          ...db.invoices[i],
          payments,
          paidDA,
          balanceDA: totalDA - paidDA,
          status: paidDA >= totalDA ? "paid" : paidDA > 0 ? "partial" : "open",
        };
        result = db.invoices[i];
      }
    });
    return result;
  },
  void: async (invoiceId: string): Promise<Invoice | undefined> => {
    let result: Invoice | undefined;
    writeDb((db) => {
      const i = db.invoices.findIndex((inv) => inv.id === invoiceId);
      if (i >= 0) {
        db.invoices[i] = { ...db.invoices[i], status: "void" };
        result = db.invoices[i];
      }
    });
    return result;
  },
};

// ─── rates ─────────────────────────────────────────────────────────────

export const ratesRepo = {
  list: async (): Promise<Rate[]> => readDb().rates,
  create: async (input: Omit<Rate, "id">): Promise<Rate> => {
    const created: Rate = { ...input, id: newId("rate") };
    writeDb((db) => {
      db.rates.push(created);
    });
    return created;
  },
  update: async (id: string, patch: Partial<Rate>): Promise<Rate | undefined> => {
    let result: Rate | undefined;
    writeDb((db) => {
      const i = db.rates.findIndex((r) => r.id === id);
      if (i >= 0) {
        db.rates[i] = { ...db.rates[i], ...patch };
        result = db.rates[i];
      }
    });
    return result;
  },
};

// ─── promos ────────────────────────────────────────────────────────────

export const promosRepo = {
  list: async (): Promise<Promo[]> => readDb().promos,
  byCode: async (code: string): Promise<Promo | undefined> =>
    readDb().promos.find((p) => p.code.toLowerCase() === code.toLowerCase()),
  create: async (input: Omit<Promo, "id" | "usageCount">): Promise<Promo> => {
    const created: Promo = { ...input, id: newId("pr"), usageCount: 0 };
    writeDb((db) => {
      db.promos.push(created);
    });
    return created;
  },
  update: async (id: string, patch: Partial<Promo>): Promise<Promo | undefined> => {
    let result: Promo | undefined;
    writeDb((db) => {
      const i = db.promos.findIndex((p) => p.id === id);
      if (i >= 0) {
        db.promos[i] = { ...db.promos[i], ...patch };
        result = db.promos[i];
      }
    });
    return result;
  },
  archive: async (id: string): Promise<Promo | undefined> =>
    promosRepo.update(id, { active: false }),
};

// ─── channels ──────────────────────────────────────────────────────────

export const channelsRepo = {
  list: async (): Promise<Channel[]> => readDb().channels,
  byId: async (id: string): Promise<Channel | undefined> =>
    readDb().channels.find((c) => c.id === id),
  setEnabled: async (id: string, enabled: boolean): Promise<Channel | undefined> => {
    let result: Channel | undefined;
    writeDb((db) => {
      const i = db.channels.findIndex((c) => c.id === id);
      if (i >= 0) {
        db.channels[i] = {
          ...db.channels[i],
          enabled,
          status: enabled ? "synced" : "off",
        };
        result = db.channels[i];
      }
    });
    return result;
  },
  sync: async (id: string): Promise<Channel | undefined> => {
    let result: Channel | undefined;
    writeDb((db) => {
      const i = db.channels.findIndex((c) => c.id === id);
      if (i >= 0) {
        db.channels[i] = {
          ...db.channels[i],
          status: "synced" as ChannelStatus,
          lastSyncedAt: nowIso(),
          statusMessage: undefined,
          inventorySynced: db.channels[i].totalInventory,
        };
        result = db.channels[i];
      }
    });
    return result;
  },
};

// ─── messages ──────────────────────────────────────────────────────────

export const messagesRepo = {
  list: async (): Promise<Message[]> => readDb().messages,
  threadsForGuest: async (guestId: string): Promise<Message[]> =>
    readDb().messages.filter((m) => m.guestId === guestId),
  send: async (
    input: Omit<Message, "id" | "sentAt" | "direction" | "threadId"> & {
      threadId?: string;
      channel: MessageChannel;
    },
  ): Promise<Message> => {
    const sent: Message = {
      ...input,
      id: newId("msg"),
      direction: "outbound",
      sentAt: nowIso(),
      threadId: input.threadId ?? newId("thr"),
    };
    writeDb((db) => {
      db.messages.push(sent);
    });
    return sent;
  },
  markRead: async (id: string): Promise<Message | undefined> => {
    let result: Message | undefined;
    writeDb((db) => {
      const i = db.messages.findIndex((m) => m.id === id);
      if (i >= 0) {
        db.messages[i] = { ...db.messages[i], readAt: nowIso() };
        result = db.messages[i];
      }
    });
    return result;
  },
};

// ─── notifications ─────────────────────────────────────────────────────

export const notificationsRepo = {
  list: async (role?: StaffRole): Promise<Notification[]> => {
    const all = readDb().notifications;
    if (!role) return all;
    return all.filter((n) => !n.audience || n.audience.includes(role));
  },
  unread: async (role?: StaffRole): Promise<Notification[]> => {
    const list = await notificationsRepo.list(role);
    return list.filter((n) => !n.readAt);
  },
  markRead: async (id: string): Promise<Notification | undefined> => {
    let result: Notification | undefined;
    writeDb((db) => {
      const i = db.notifications.findIndex((n) => n.id === id);
      if (i >= 0) {
        db.notifications[i] = { ...db.notifications[i], readAt: nowIso() };
        result = db.notifications[i];
      }
    });
    return result;
  },
  markAllRead: async (role?: StaffRole): Promise<void> => {
    writeDb((db) => {
      db.notifications = db.notifications.map((n) => {
        if (role && n.audience && !n.audience.includes(role)) return n;
        return n.readAt ? n : { ...n, readAt: nowIso() };
      });
    });
  },
  push: async (input: Omit<Notification, "id" | "createdAt">): Promise<Notification> => {
    const created: Notification = { ...input, id: newId("not"), createdAt: nowIso() };
    writeDb((db) => {
      db.notifications.unshift(created);
    });
    return created;
  },
};

// ─── Façade exportée ──────────────────────────────────────────────────

export const repo = {
  staff: staffRepo,
  rooms: roomsRepo,
  reservations: reservationsRepo,
  guests: guestsRepo,
  tasks: tasksRepo,
  invoices: invoicesRepo,
  rates: ratesRepo,
  promos: promosRepo,
  channels: channelsRepo,
  messages: messagesRepo,
  notifications: notificationsRepo,
};
