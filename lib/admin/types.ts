// Domain types for the Aperture admin app. Source of truth for all six
// feature agents — extend here if you add a field, never widen a shape
// inline in a component.

import type { Room as GuestRoom } from "@/lib/data/rooms";

// ─── Staff & RBAC ──────────────────────────────────────────────────────

export type StaffRole =
  | "direction"
  | "manager"
  | "reception"
  | "gouvernante"
  | "comptabilite";

export const staffRoleLabels: Record<StaffRole, string> = {
  direction: "Direction",
  manager: "Manager",
  reception: "Réception",
  gouvernante: "Gouvernante",
  comptabilite: "Comptabilité",
};

export type Permission =
  | "view-dashboard"
  | "manage-reservations"
  | "check-in-out"
  | "manage-rooms"
  | "housekeeping"
  | "maintenance"
  | "manage-guests"
  | "send-messages"
  | "manage-rates"
  | "manage-promos"
  | "manage-channels"
  | "view-billing"
  | "manage-billing"
  | "process-payments"
  | "view-reports"
  | "night-audit"
  | "manage-staff"
  | "manage-roles"
  | "manage-notifications";

export type Shift = "matin" | "apres-midi" | "nuit" | "flexible";

export const shiftLabels: Record<Shift, string> = {
  matin: "Matin (06h–14h)",
  "apres-midi": "Après-midi (14h–22h)",
  nuit: "Nuit (22h–06h)",
  flexible: "Flexible",
};

export type Staff = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  shift: Shift;
  active: boolean;
  /** Couleur de chip dérivée à l'affichage (pas stockée). */
  avatarInitials: string;
  /** Mock auth — accepté littéralement. Ne JAMAIS faire ça en prod. */
  password: string;
  createdAt: string;
  lastLoginAt?: string;
};

// ─── Rooms ─────────────────────────────────────────────────────────────

export type RoomStatus =
  | "vacant-clean"
  | "occupied"
  | "vacant-dirty"
  | "inspection"
  | "out-of-order"
  | "maintenance";

export const roomStatusLabels: Record<RoomStatus, string> = {
  "vacant-clean": "Libre & propre",
  occupied: "Occupée",
  "vacant-dirty": "Libre à nettoyer",
  inspection: "Inspection requise",
  "out-of-order": "Hors service",
  maintenance: "En maintenance",
};

export type RoomTypeCode =
  | "single"
  | "double"
  | "twin"
  | "triple"
  | "familiale"
  | "suite"
  | "appartement";

export const roomTypeLabels: Record<RoomTypeCode, string> = {
  single: "Chambre Single",
  double: "Chambre Double",
  twin: "Chambre Twin",
  triple: "Chambre Triple",
  familiale: "Chambre Familiale",
  suite: "Suite Senior",
  appartement: "Appartement",
};

export type Room = {
  /** Numéro affiché (= ID — naturellement unique côté propriété). */
  number: string;
  floor: number;
  type: RoomTypeCode;
  status: RoomStatus;
  /** Slug de chambre côté site invité (rooms/[slug]) si correspondance. */
  publicSlug?: GuestRoom["slug"];
  note?: string;
  lastCleanedAt?: string;
  /** Réservation actuellement en chambre, si occupée. */
  occupiedBy?: string;
  /** Date prévue de remise à disposition (sortie de maintenance / OOO). */
  availableFrom?: string;
};

// ─── Reservations ──────────────────────────────────────────────────────

export type ReservationStatus =
  | "confirmed"
  | "option"
  | "arrival-expected"
  | "checked-in"
  | "departure-expected"
  | "checked-out"
  | "cancelled"
  | "no-show";

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  confirmed: "Confirmée",
  option: "Option",
  "arrival-expected": "Arrivée prévue",
  "checked-in": "Arrivée",
  "departure-expected": "Départ prévu",
  "checked-out": "Partie",
  cancelled: "Annulée",
  "no-show": "No-show",
};

export type ReservationSource =
  | "direct"
  | "booking-com"
  | "expedia"
  | "walk-in"
  | "phone"
  | "partner";

export const reservationSourceLabels: Record<ReservationSource, string> = {
  direct: "Site direct",
  "booking-com": "Booking.com",
  expedia: "Expedia",
  "walk-in": "Walk-in",
  phone: "Téléphone",
  partner: "Partenaire",
};

export type Reservation = {
  id: string;
  ref: string;
  status: ReservationStatus;
  source: ReservationSource;
  guestId: string;
  /** Chambre attribuée si déjà fait. Sinon, juste un type. */
  roomNumber?: string;
  roomType: RoomTypeCode;
  /** Dates ISO (YYYY-MM-DD). */
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  ratePerNightDA: number;
  totalDA: number;
  paidDA: number;
  promoCode?: string;
  notes?: string;
  addOnIds: string[];
  /** Heure d'arrivée estimée (texte libre, vient du formulaire client). */
  arrivalTime?: string;
  /** Pour les options : date limite après laquelle ça tombe. */
  holdUntil?: string;
  /** Réservation de groupe (mariage, séminaire) — partage un groupRef. */
  groupRef?: string;
  createdAt: string;
  createdBy: string;
  modifiedAt?: string;
};

// ─── Guests ────────────────────────────────────────────────────────────

export type GuestLanguage = "fr" | "ar" | "en";
export const guestLanguageLabels: Record<GuestLanguage, string> = {
  fr: "Français",
  ar: "Arabe",
  en: "Anglais",
};

export type LoyaltyTier = "bronze" | "argent" | "or" | "platine";
export const loyaltyTierLabels: Record<LoyaltyTier, string> = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
  platine: "Platine",
};

export type GuestNote = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
  kind: "general" | "preference" | "incident" | "vip";
};

export type GuestDocument = {
  id: string;
  kind: "id" | "passport" | "marriage-booklet" | "other";
  label: string;
  /** En démo, on stocke uniquement le nom et la date — pas le fichier. */
  uploadedAt: string;
  uploadedBy: string;
};

export type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality?: string;
  language: GuestLanguage;
  dob?: string;
  idNumber?: string;
  address?: string;
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints: number;
  /** Préférences libres : « chambre haute », « oreiller ferme », etc. */
  preferences: string[];
  notes: GuestNote[];
  documents: GuestDocument[];
  createdAt: string;
  totalStays: number;
  totalSpentDA: number;
  vip: boolean;
};

// ─── Tasks (housekeeping + maintenance) ────────────────────────────────

export type TaskKind = "housekeeping" | "maintenance";
export const taskKindLabels: Record<TaskKind, string> = {
  housekeeping: "Ménage",
  maintenance: "Maintenance",
};

export type TaskPriority = "low" | "normal" | "high" | "urgent";
export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "Faible",
  normal: "Normale",
  high: "Élevée",
  urgent: "Urgente",
};

export type TaskStatus = "pending" | "in-progress" | "done" | "blocked";
export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: "À faire",
  "in-progress": "En cours",
  done: "Terminée",
  blocked: "Bloquée",
};

export type Task = {
  id: string;
  kind: TaskKind;
  priority: TaskPriority;
  status: TaskStatus;
  roomNumber?: string;
  title: string;
  body?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  dueAt?: string;
  completedAt?: string;
  resolution?: string;
};

// ─── Invoices / Billing ────────────────────────────────────────────────

export type InvoiceItemSource =
  | "room"
  | "tax"
  | "addon"
  | "pos-restaurant"
  | "pos-bar"
  | "pos-spa"
  | "extra";

export const invoiceItemSourceLabels: Record<InvoiceItemSource, string> = {
  room: "Hébergement",
  tax: "Taxe de séjour",
  addon: "Option",
  "pos-restaurant": "Restaurant",
  "pos-bar": "Bar / Café",
  "pos-spa": "Bien-être",
  extra: "Autre",
};

export type InvoiceItem = {
  id: string;
  label: string;
  qty: number;
  unitPriceDA: number;
  totalDA: number;
  source: InvoiceItemSource;
  addedAt: string;
};

export type PaymentMethod = "cash" | "card" | "transfer" | "voucher";
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Espèces",
  card: "Carte bancaire",
  transfer: "Virement",
  voucher: "Bon / Avoir",
};

export type Payment = {
  id: string;
  method: PaymentMethod;
  amountDA: number;
  receivedAt: string;
  takenBy: string;
  note?: string;
};

export type InvoiceStatus = "open" | "paid" | "partial" | "void" | "refunded";
export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  open: "Ouverte",
  paid: "Payée",
  partial: "Partielle",
  void: "Annulée",
  refunded: "Remboursée",
};

export type Invoice = {
  id: string;
  ref: string;
  reservationId: string;
  guestId: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  payments: Payment[];
  issuedAt: string;
  dueAt?: string;
  totalDA: number;
  paidDA: number;
  balanceDA: number;
};

// ─── Rates & Promotions ────────────────────────────────────────────────

export type Season = "basse" | "moyenne" | "haute" | "tres-haute";
export const seasonLabels: Record<Season, string> = {
  basse: "Basse saison",
  moyenne: "Moyenne saison",
  haute: "Haute saison",
  "tres-haute": "Très haute saison",
};

export type Rate = {
  id: string;
  roomType: RoomTypeCode;
  season: Season;
  weekdayDA: number;
  weekendDA: number;
  startsOn: string;
  endsOn: string;
  label: string;
};

export type PromoKind = "percent" | "fixed" | "free-night";
export const promoKindLabels: Record<PromoKind, string> = {
  percent: "Pourcentage",
  fixed: "Montant fixe (DA)",
  "free-night": "Nuit offerte",
};

export type Promo = {
  id: string;
  code: string;
  label: string;
  kind: PromoKind;
  value: number;
  startsOn: string;
  endsOn: string;
  usageCount: number;
  usageLimit?: number;
  active: boolean;
  appliesTo?: RoomTypeCode[];
};

// ─── Channels (OTA) ────────────────────────────────────────────────────

export type ChannelStatus = "synced" | "syncing" | "warn" | "error" | "off";
export const channelStatusLabels: Record<ChannelStatus, string> = {
  synced: "Synchronisé",
  syncing: "Synchronisation…",
  warn: "Attention",
  error: "Erreur",
  off: "Désactivé",
};

export type Channel = {
  id: string;
  name: string;
  enabled: boolean;
  status: ChannelStatus;
  lastSyncedAt?: string;
  inventorySynced: number;
  totalInventory: number;
  statusMessage?: string;
  commissionPct: number;
};

// ─── Messages ──────────────────────────────────────────────────────────

export type MessageChannel = "email" | "sms" | "in-app";
export const messageChannelLabels: Record<MessageChannel, string> = {
  email: "E-mail",
  sms: "SMS",
  "in-app": "Messagerie interne",
};

export type Message = {
  id: string;
  threadId: string;
  guestId: string;
  channel: MessageChannel;
  direction: "inbound" | "outbound";
  subject?: string;
  body: string;
  sentAt: string;
  readAt?: string;
  sentBy?: string;
};

// ─── Notifications ─────────────────────────────────────────────────────

export type NotificationKind =
  | "reservation"
  | "task"
  | "payment"
  | "channel"
  | "system";

export type NotificationSeverity = "info" | "warn" | "danger";

export type Notification = {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  body?: string;
  link?: string;
  createdAt: string;
  readAt?: string;
  audience?: StaffRole[];
};

// ─── Session (mock auth) ───────────────────────────────────────────────

export type Session = {
  staffId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  signedInAt: string;
};
