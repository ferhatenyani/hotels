"use client";

import {
  ArrowLeft,
  Bed,
  CalendarDays,
  Clock,
  CreditCard,
  Edit3,
  Mail,
  Phone,
  Receipt,
  Sparkles,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Avatar } from "@/components/admin/AvatarChip";
import {
  Badge,
  InvoiceStatusPill,
  ReservationStatusPill,
} from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { Field, Input, Select, Textarea } from "@/components/admin/form";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Sheet } from "@/components/admin/Sheet";
import { StatTile } from "@/components/admin/StatTile";
import { Tabs } from "@/components/admin/Tabs";
import { useToast } from "@/components/admin/Toast";

import {
  fmtDA,
  fmtDate,
  fmtDateLong,
  fmtDateTime,
  fmtRelative,
} from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  loyaltyTierLabels,
  reservationSourceLabels,
  roomTypeLabels,
  type Guest,
  type Invoice,
  type Reservation,
  type Room,
  type Staff,
} from "@/lib/admin/types";

import { balanceDA, nightsBetween } from "../_components/helpers";

type TabId = "apercu" | "client" | "facture" | "historique";

export function ReservationDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [createdBy, setCreatedBy] = useState<Staff | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    (async () => {
      try {
        const r = await repo.reservations.byId(id);
        if (!r) {
          if (!mounted) return;
          setError("Réservation introuvable.");
          setLoading(false);
          return;
        }
        const [g, invs, staff, ro] = await Promise.all([
          repo.guests.byId(r.guestId),
          repo.invoices.forReservation(r.id),
          repo.staff.byId(r.createdBy),
          repo.rooms.list(),
        ]);
        if (!mounted) return;
        setReservation(r);
        setGuest(g ?? null);
        setInvoice(invs[0] ?? null);
        setCreatedBy(staff ?? null);
        setRooms(ro);
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Erreur inconnue");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, tick]);

  const [tab, setTab] = useState<TabId>("apercu");
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ─── États dérivés ─────────────────────────────────────────────────────
  const nights = reservation
    ? nightsBetween(reservation.checkIn, reservation.checkOut)
    : 0;

  // ─── Cancel ────────────────────────────────────────────────────────────
  const doCancel = async () => {
    if (!reservation) return;
    setCancelling(true);
    try {
      await repo.reservations.cancel(reservation.id);
      toast.push({
        tone: "info",
        title: "Réservation annulée",
        body: reservation.ref,
      });
      setCancelOpen(false);
    } catch (err) {
      toast.push({
        tone: "danger",
        title: "Annulation impossible",
        body: err instanceof Error ? err.message : "Erreur inconnue.",
      });
    } finally {
      setCancelling(false);
    }
  };

  // ─── Edit ──────────────────────────────────────────────────────────────
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!reservation) return;
    // Synchronisation des champs du formulaire depuis l'objet chargé.
    // C'est une initialisation de form contrôlé, pas une cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditCheckIn(reservation.checkIn);
    setEditCheckOut(reservation.checkOut);
    setEditRoom(reservation.roomNumber ?? "");
    setEditNotes(reservation.notes ?? "");
  }, [reservation]);

  const editableRooms = useMemo(() => {
    if (!reservation) return [];
    return rooms
      .filter(
        (r) =>
          r.type === reservation.roomType &&
          (r.status === "vacant-clean" ||
            r.number === reservation.roomNumber),
      )
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [rooms, reservation]);

  const saveEdit = async () => {
    if (!reservation) return;
    if (editCheckOut <= editCheckIn) {
      toast.push({
        tone: "warn",
        title: "Dates invalides",
        body: "Le départ doit être postérieur à l'arrivée.",
      });
      return;
    }
    setEditing(true);
    try {
      await repo.reservations.update(reservation.id, {
        checkIn: editCheckIn,
        checkOut: editCheckOut,
        roomNumber: editRoom || undefined,
        notes: editNotes || undefined,
      });
      toast.push({
        tone: "ok",
        title: "Réservation mise à jour",
        body: reservation.ref,
      });
      setEditOpen(false);
    } catch (err) {
      toast.push({
        tone: "danger",
        title: "Mise à jour impossible",
        body: err instanceof Error ? err.message : "Erreur inconnue.",
      });
    } finally {
      setEditing(false);
    }
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <PageHeader
          crumbs={[
            { label: "Réservations", href: "/admin/reservations" },
            { label: "Chargement…" },
          ]}
          title="Détail réservation"
        />
        <Card>
          <LoadingState variant="block" />
        </Card>
      </>
    );
  }

  if (error || !reservation) {
    return (
      <>
        <PageHeader
          crumbs={[
            { label: "Réservations", href: "/admin/reservations" },
            { label: "Erreur" },
          ]}
          title="Détail réservation"
          actions={
            <Button
              variant="ghost"
              size="sm"
              href="/admin/reservations"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Retour à la liste
            </Button>
          }
        />
        <Card>
          <ErrorState
            title="Réservation introuvable"
            body={error ?? "Le dossier demandé n'existe plus ou a été supprimé."}
            onRetry={() => router.push("/admin/reservations")}
            retryLabel="Retour à la liste"
          />
        </Card>
      </>
    );
  }

  const bal = balanceDA(reservation);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Réservations", href: "/admin/reservations" },
          { label: reservation.ref },
        ]}
        title={
          <span className="inline-flex items-center gap-3">
            <span className="tnum">{reservation.ref}</span>
            <ReservationStatusPill status={reservation.status} />
          </span>
        }
        subtitle={
          <>
            <span className="tnum">{fmtDateLong(reservation.checkIn)}</span>
            {" → "}
            <span className="tnum">{fmtDateLong(reservation.checkOut)}</span>
            {" · "}
            {nights} nuit{nights > 1 ? "s" : ""}
            {reservation.roomNumber ? ` · chambre ${reservation.roomNumber}` : ""}
          </>
        }
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              href="/admin/reservations"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Liste
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditOpen(true)}
              leftIcon={<Edit3 className="size-4" />}
            >
              Modifier
            </Button>
            {reservation.status !== "cancelled" &&
            reservation.status !== "checked-out" ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCancelOpen(true)}
                leftIcon={<XCircle className="size-4" />}
              >
                Annuler
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Main */}
        <div className="space-y-4">
          <Tabs
            tabs={[
              { id: "apercu", label: "Aperçu" },
              { id: "client", label: "Client" },
              {
                id: "facture",
                label: "Facture",
                badge: invoice ? "1" : "—",
              },
              { id: "historique", label: "Historique" },
            ]}
            active={tab}
            onChange={(id) => setTab(id as TabId)}
          />

          {tab === "apercu" ? (
            <ApercuTab
              reservation={reservation}
              guest={guest}
              invoice={invoice}
              nights={nights}
            />
          ) : tab === "client" ? (
            <ClientTab guest={guest} />
          ) : tab === "facture" ? (
            <FactureTab reservation={reservation} invoice={invoice} />
          ) : (
            <HistoriqueTab
              reservation={reservation}
              createdBy={createdBy}
            />
          )}
        </div>

        {/* Side */}
        <div className="space-y-4">
          <GuestCard guest={guest} />

          <Card>
            <CardHeader title="Solde rapide" />
            <CardBody className="space-y-2.5">
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="text-[var(--color-admin-muted)]">Total</span>
                <span className="tnum text-[var(--color-admin-text)]">
                  {fmtDA(reservation.totalDA)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="text-[var(--color-admin-muted)]">Versé</span>
                <span className="tnum text-[var(--color-admin-text)]">
                  {fmtDA(reservation.paidDA)}
                </span>
              </div>
              <div className="border-t border-[var(--color-admin-divider)] pt-2.5 flex items-baseline justify-between text-[14px] font-medium">
                <span className="text-[var(--color-admin-text)]">Solde</span>
                <span
                  className={`tnum ${bal > 0 ? "text-[var(--color-admin-warn-fg)]" : "text-[var(--color-admin-ok-fg)]"}`}
                >
                  {bal > 0 ? fmtDA(bal) : "Soldé"}
                </span>
              </div>
              {invoice ? (
                <Button
                  variant="secondary"
                  size="sm"
                  href={`/admin/facturation/${invoice.id}`}
                  leftIcon={<Receipt className="size-4" />}
                  className="w-full"
                >
                  Voir la facture · {invoice.ref}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  href="/admin/facturation"
                  leftIcon={<Receipt className="size-4" />}
                  className="w-full"
                >
                  Créer une facture
                </Button>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Métadonnées" />
            <CardBody className="space-y-2 text-[12.5px]">
              <Meta label="Source" value={reservationSourceLabels[reservation.source]} />
              <Meta
                label="Créée le"
                value={fmtDateTime(reservation.createdAt)}
              />
              <Meta
                label="Créée par"
                value={
                  createdBy
                    ? `${createdBy.firstName} ${createdBy.lastName}`
                    : reservation.createdBy
                }
              />
              {reservation.modifiedAt ? (
                <Meta
                  label="Modifiée"
                  value={fmtRelative(reservation.modifiedAt)}
                />
              ) : null}
              {reservation.groupRef ? (
                <Meta label="Groupe" value={reservation.groupRef} />
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Sheet : modifier */}
      <Sheet
        open={editOpen}
        onClose={() => (editing ? null : setEditOpen(false))}
        title="Modifier la réservation"
        description={reservation.ref}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(false)}
              disabled={editing}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveEdit}
              loading={editing}
              loadingLabel="Enregistrement…"
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Arrivée" htmlFor="edit-ci">
              <Input
                id="edit-ci"
                type="date"
                value={editCheckIn}
                max={editCheckOut}
                onChange={(e) => setEditCheckIn(e.target.value)}
              />
            </Field>
            <Field label="Départ" htmlFor="edit-co">
              <Input
                id="edit-co"
                type="date"
                value={editCheckOut}
                min={editCheckIn}
                onChange={(e) => setEditCheckOut(e.target.value)}
              />
            </Field>
          </div>
          <Field
            label="Chambre attribuée"
            htmlFor="edit-room"
            helper={`${roomTypeLabels[reservation.roomType]} · uniquement les chambres libres & propres du bon type sont listées.`}
          >
            <Select
              id="edit-room"
              value={editRoom}
              onChange={(e) => setEditRoom(e.target.value)}
            >
              <option value="">— Aucune —</option>
              {editableRooms.map((r) => (
                <option key={r.number} value={r.number}>
                  Chambre {r.number} · étage {r.floor}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notes internes" htmlFor="edit-notes">
            <Textarea
              id="edit-notes"
              rows={4}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </Field>
        </div>
      </Sheet>

      {/* Dialog : annuler */}
      <Dialog
        open={cancelOpen}
        onClose={() => (cancelling ? null : setCancelOpen(false))}
        title="Annuler cette réservation ?"
        description={`${reservation.ref} — cette action est immédiate.`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
            >
              Garder la réservation
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={doCancel}
              loading={cancelling}
              loadingLabel="Annulation…"
              leftIcon={<XCircle className="size-4" />}
            >
              Confirmer l&apos;annulation
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-[var(--color-admin-muted)]">
          La réservation passera au statut {"« Annulée »"}. Si une chambre était
          attribuée, elle restera dans son état actuel — pensez à la libérer
          depuis l&apos;onglet Chambres si besoin.
        </p>
      </Dialog>
    </>
  );
}

// ─── Tabs ───────────────────────────────────────────────────────────────

function ApercuTab({
  reservation,
  guest,
  invoice,
  nights,
}: {
  reservation: Reservation;
  guest: Guest | null;
  invoice: Invoice | null;
  nights: number;
}) {
  const bal = balanceDA(reservation);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Nuits"
          value={nights}
          helper={`${reservation.adults + reservation.children} personne${reservation.adults + reservation.children > 1 ? "s" : ""}`}
          icon={<CalendarDays className="size-4" />}
        />
        <StatTile
          label="Total séjour"
          value={fmtDA(reservation.totalDA)}
          helper={`${fmtDA(reservation.ratePerNightDA)} / nuit`}
          icon={<CreditCard className="size-4" />}
        />
        <StatTile
          label="Acompte versé"
          value={fmtDA(reservation.paidDA)}
          helper={reservation.paidDA > 0 ? "déjà encaissé" : "aucun versement"}
          icon={<Sparkles className="size-4" />}
        />
        <StatTile
          label="Solde"
          value={bal > 0 ? fmtDA(bal) : "Soldé"}
          helper={bal > 0 ? "à percevoir" : "rien à payer"}
          deltaTone={bal > 0 ? "warn" : "ok"}
          icon={<Receipt className="size-4" />}
        />
      </div>

      <Card>
        <CardHeader title="Détails du séjour" />
        <CardBody>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <Row icon={<CalendarDays className="size-4" />} label="Arrivée">
              <span className="tnum">{fmtDateLong(reservation.checkIn)}</span>
              {reservation.arrivalTime ? (
                <span className="ml-2 text-[var(--color-admin-muted)] tnum">
                  · {reservation.arrivalTime}
                </span>
              ) : null}
            </Row>
            <Row icon={<CalendarDays className="size-4" />} label="Départ">
              <span className="tnum">{fmtDateLong(reservation.checkOut)}</span>
            </Row>
            <Row icon={<Bed className="size-4" />} label="Type de chambre">
              {roomTypeLabels[reservation.roomType]}
            </Row>
            <Row icon={<Bed className="size-4" />} label="Chambre attribuée">
              {reservation.roomNumber ? (
                <span className="tnum">Chambre {reservation.roomNumber}</span>
              ) : (
                <span className="text-[var(--color-admin-faint)]">à attribuer</span>
              )}
            </Row>
            <Row icon={<Users className="size-4" />} label="Occupants">
              {reservation.adults} adulte{reservation.adults > 1 ? "s" : ""}
              {reservation.children > 0
                ? ` · ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}`
                : ""}
            </Row>
            <Row icon={<User className="size-4" />} label="Source">
              <Badge tone="muted" small>
                {reservationSourceLabels[reservation.source]}
              </Badge>
            </Row>
          </dl>
          {reservation.notes ? (
            <div className="mt-4 rounded-md bg-[var(--color-admin-sunken)] p-3 text-[13px] text-[var(--color-admin-text)]">
              <p className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)] mb-1">
                Notes
              </p>
              {reservation.notes}
            </div>
          ) : null}
        </CardBody>
      </Card>

      {reservation.addOnIds.length > 0 ? (
        <Card>
          <CardHeader title="Options & extras" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {reservation.addOnIds.map((id) => (
                <Badge key={id} tone="info" small>
                  <Sparkles className="size-3 mr-1" />
                  {labelForAddOn(id)}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {invoice ? (
        <Card>
          <CardHeader
            title="Folio en cours"
            subtitle={`${invoice.ref} · ${invoice.items.length} ligne${invoice.items.length > 1 ? "s" : ""}`}
            actions={<InvoiceStatusPill status={invoice.status} />}
          />
          <CardBody className="space-y-1.5">
            {invoice.items.slice(0, 4).map((it) => (
              <div
                key={it.id}
                className="flex items-baseline justify-between gap-3 text-[12.5px]"
              >
                <span className="text-[var(--color-admin-muted)] truncate">
                  {it.label}
                </span>
                <span className="tnum text-[var(--color-admin-text)] shrink-0">
                  {fmtDA(it.totalDA)}
                </span>
              </div>
            ))}
            {invoice.items.length > 4 ? (
              <p className="text-[11.5px] text-[var(--color-admin-muted)] pt-1">
                + {invoice.items.length - 4} autre
                {invoice.items.length - 4 > 1 ? "s" : ""} ligne
                {invoice.items.length - 4 > 1 ? "s" : ""}
              </p>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      {guest?.preferences && guest.preferences.length > 0 ? (
        <Card>
          <CardHeader title="Préférences du client" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {guest.preferences.map((p, i) => (
                <Badge key={i} tone="muted" small>
                  {p}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function ClientTab({ guest }: { guest: Guest | null }) {
  if (!guest) {
    return (
      <Card>
        <EmptyState title="Client introuvable" body="Le dossier client lié n'existe plus." />
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Identité" />
        <CardBody>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <Row icon={<User className="size-4" />} label="Nom complet">
              {guest.firstName} {guest.lastName}
            </Row>
            {guest.email ? (
              <Row icon={<Mail className="size-4" />} label="E-mail">
                <a
                  href={`mailto:${guest.email}`}
                  className="hover:text-marine transition-colors"
                >
                  {guest.email}
                </a>
              </Row>
            ) : null}
            {guest.phone ? (
              <Row icon={<Phone className="size-4" />} label="Téléphone">
                <a
                  href={`tel:${guest.phone.replace(/\s/g, "")}`}
                  className="hover:text-marine transition-colors tnum"
                >
                  {guest.phone}
                </a>
              </Row>
            ) : null}
            {guest.nationality ? (
              <Row label="Nationalité">{guest.nationality}</Row>
            ) : null}
            {guest.idNumber ? (
              <Row label="Pièce d&apos;identité">
                <span className="tnum">{guest.idNumber}</span>
              </Row>
            ) : null}
            {guest.address ? (
              <Row label="Adresse">{guest.address}</Row>
            ) : null}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Fidélité & historique"
          actions={
            <Button
              variant="secondary"
              size="sm"
              href={`/admin/clients/${guest.id}`}
            >
              Profil complet
            </Button>
          }
        />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat
              label="Statut"
              value={
                guest.loyaltyTier
                  ? loyaltyTierLabels[guest.loyaltyTier]
                  : "Aucun"
              }
            />
            <Stat label="Points" value={guest.loyaltyPoints.toLocaleString("fr-FR")} />
            <Stat label="Séjours" value={guest.totalStays} />
            <Stat label="Dépenses" value={fmtDA(guest.totalSpentDA)} />
          </div>
        </CardBody>
      </Card>

      {guest.notes.length > 0 ? (
        <Card>
          <CardHeader title="Notes" />
          <CardBody className="space-y-3">
            {guest.notes.map((n) => (
              <div
                key={n.id}
                className="rounded-md border border-[var(--color-admin-divider)] p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    tone={n.kind === "vip" ? "info" : n.kind === "incident" ? "danger" : "muted"}
                    small
                  >
                    {n.kind === "vip"
                      ? "VIP"
                      : n.kind === "incident"
                        ? "Incident"
                        : n.kind === "preference"
                          ? "Préférence"
                          : "Note"}
                  </Badge>
                  <span className="text-[11.5px] text-[var(--color-admin-muted)] tnum">
                    {fmtRelative(n.createdAt)}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--color-admin-text)]">
                  {n.body}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function FactureTab({
  reservation,
  invoice,
}: {
  reservation: Reservation;
  invoice: Invoice | null;
}) {
  if (!invoice) {
    return (
      <Card>
        <EmptyState
          icon={<Receipt className="size-5" />}
          title="Aucune facture créée"
          body={"Le folio sera créé automatiquement à la facturation ou peut être ouvert depuis la liste des facturations."}
          action={
            <Button
              variant="primary"
              size="sm"
              href="/admin/facturation"
              leftIcon={<Receipt className="size-4" />}
            >
              Ouvrir la facturation
            </Button>
          }
        />
      </Card>
    );
  }
  const bal = balanceDA(reservation);
  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span className="tnum">{invoice.ref}</span>
            <InvoiceStatusPill status={invoice.status} />
          </span>
        }
        subtitle={`Émise le ${fmtDate(invoice.issuedAt)}`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            href={`/admin/facturation/${invoice.id}`}
          >
            Folio complet
          </Button>
        }
      />
      <CardBody padded={false}>
        <ul className="divide-y divide-[var(--color-admin-divider)]">
          {invoice.items.map((it) => (
            <li
              key={it.id}
              className="px-5 py-3 flex items-baseline justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[13.5px] text-[var(--color-admin-text)] truncate">
                  {it.label}
                </p>
                <p className="text-[11.5px] text-[var(--color-admin-muted)] tnum">
                  {it.qty} × {fmtDA(it.unitPriceDA)}
                </p>
              </div>
              <span className="tnum text-[13px] text-[var(--color-admin-text)] shrink-0">
                {fmtDA(it.totalDA)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-[var(--color-admin-divider)] p-5 space-y-1.5 bg-[var(--color-admin-sunken)]/40 rounded-b-xl">
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="text-[var(--color-admin-muted)]">Total</span>
            <span className="tnum text-[var(--color-admin-text)]">
              {fmtDA(invoice.totalDA)}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="text-[var(--color-admin-muted)]">Versé</span>
            <span className="tnum text-[var(--color-admin-text)]">
              {fmtDA(invoice.paidDA)}
            </span>
          </div>
          <div className="border-t border-[var(--color-admin-divider)] pt-1.5 flex items-baseline justify-between text-[14px] font-medium">
            <span className="text-[var(--color-admin-text)]">Solde</span>
            <span
              className={`tnum ${bal > 0 ? "text-[var(--color-admin-warn-fg)]" : "text-[var(--color-admin-ok-fg)]"}`}
            >
              {bal > 0 ? fmtDA(bal) : "Soldé"}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function HistoriqueTab({
  reservation,
  createdBy,
}: {
  reservation: Reservation;
  createdBy: Staff | null;
}) {
  const events: Array<{
    at: string;
    label: string;
    detail?: string;
  }> = [
    {
      at: reservation.createdAt,
      label: "Réservation créée",
      detail: createdBy
        ? `par ${createdBy.firstName} ${createdBy.lastName}`
        : `par ${reservation.createdBy}`,
    },
  ];
  if (reservation.modifiedAt) {
    events.push({
      at: reservation.modifiedAt,
      label: "Dernière modification",
    });
  }
  events.sort((a, b) => b.at.localeCompare(a.at));

  return (
    <Card>
      <CardHeader title="Historique" subtitle="Événements liés à ce dossier." />
      <CardBody padded={false}>
        <ul className="divide-y divide-[var(--color-admin-divider)]">
          {events.map((e, i) => (
            <li key={i} className="px-5 py-3 flex items-start gap-3">
              <span className="size-7 inline-flex items-center justify-center rounded-full bg-[var(--color-admin-sunken)] text-[var(--color-admin-muted)] shrink-0">
                <Clock className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-[var(--color-admin-text)]">
                  {e.label}
                </p>
                {e.detail ? (
                  <p className="text-[11.5px] text-[var(--color-admin-muted)]">
                    {e.detail}
                  </p>
                ) : null}
              </div>
              <span className="text-[11.5px] text-[var(--color-admin-faint)] tnum shrink-0">
                {fmtDateTime(e.at)}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

// ─── Bits ───────────────────────────────────────────────────────────────

function GuestCard({ guest }: { guest: Guest | null }) {
  if (!guest) {
    return (
      <Card>
        <CardHeader title="Client" />
        <CardBody>
          <p className="text-[12.5px] text-[var(--color-admin-muted)]">
            Aucun client associé.
          </p>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader title="Client" />
      <CardBody className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar firstName={guest.firstName} lastName={guest.lastName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-[var(--color-admin-text)] truncate">
              {guest.firstName} {guest.lastName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {guest.loyaltyTier ? (
                <Badge tone="info" small>
                  Fidélité · {loyaltyTierLabels[guest.loyaltyTier]}
                </Badge>
              ) : null}
              {guest.vip ? (
                <Badge tone="warn" small>
                  VIP
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        {guest.phone ? (
          <a
            href={`tel:${guest.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 rounded-md bg-[var(--color-admin-sunken)] px-3 py-2 text-[12.5px] text-[var(--color-admin-text)] hover:bg-[var(--color-admin-border)] transition-colors"
          >
            <Phone className="size-3.5 text-[var(--color-admin-muted)]" />
            <span className="tnum">{guest.phone}</span>
          </a>
        ) : null}
        {guest.email ? (
          <a
            href={`mailto:${guest.email}`}
            className="flex items-center gap-2 rounded-md bg-[var(--color-admin-sunken)] px-3 py-2 text-[12.5px] text-[var(--color-admin-text)] hover:bg-[var(--color-admin-border)] transition-colors truncate"
          >
            <Mail className="size-3.5 text-[var(--color-admin-muted)] shrink-0" />
            <span className="truncate">{guest.email}</span>
          </a>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          href={`/admin/clients/${guest.id}`}
          className="w-full"
        >
          Voir le profil client
        </Button>
      </CardBody>
    </Card>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2">
      {icon ? (
        <span className="text-[var(--color-admin-faint)] shrink-0">{icon}</span>
      ) : null}
      <dt className="text-[12px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)] w-32 shrink-0">
        {label}
      </dt>
      <dd className="text-[13.5px] text-[var(--color-admin-text)] min-w-0">
        {children}
      </dd>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--color-admin-muted)]">
        {label}
      </span>
      <span className="text-[12.5px] text-[var(--color-admin-text)] text-right tnum truncate min-w-0">
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-[var(--color-admin-sunken)] p-3">
      <p className="text-[10.5px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-medium tnum text-[var(--color-admin-text)]">
        {value}
      </p>
    </div>
  );
}

function labelForAddOn(id: string): string {
  switch (id) {
    case "breakfast":
      return "Petit-déjeuner";
    case "late-checkout":
      return "Départ tardif";
    case "airport-pickup":
      return "Transfert aéroport";
    case "champagne":
      return "Fleurs & bulles";
    default:
      return id;
  }
}
