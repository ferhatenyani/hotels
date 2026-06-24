"use client";

import {
  AlarmClock,
  ArrowUpRight,
  Ban,
  BanknoteArrowDown,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Download,
  FileText,
  Hash,
  History,
  ListPlus,
  Plus,
  Receipt,
  TicketCheck,
  Wallet,
  Wallet2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge, InvoiceStatusPill, ReservationStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { Field, Input, RadioGroup, Textarea } from "@/components/admin/form";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { Tabs } from "@/components/admin/Tabs";
import { useToast } from "@/components/admin/Toast";
import { toneDot } from "@/components/admin/tone";

import { currentSession } from "@/lib/admin/auth";
import { fmtDA, fmtDate, fmtDateTime } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  invoiceItemSourceLabels,
  paymentMethodLabels,
  type Guest,
  type Invoice,
  type InvoiceItem,
  type InvoiceItemSource,
  type Payment,
  type PaymentMethod,
  type Reservation,
  type Staff,
} from "@/lib/admin/types";

import {
  byAddedDesc,
  byReceivedDesc,
  daysUntilDue,
  invoiceOverdue,
  itemSourceTone,
  paymentMethodTone,
} from "./helpers";

type TabId = "items" | "payments" | "history";

export function InvoiceDetailClient({ invoiceId }: { invoiceId: string }) {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    (async () => {
      try {
        const inv = await repo.invoices.byId(invoiceId);
        if (!inv) throw new Error("Facture introuvable.");
        const [g, r, s] = await Promise.all([
          repo.guests.byId(inv.guestId),
          repo.reservations.byId(inv.reservationId),
          repo.staff.list(),
        ]);
        if (!mounted) return;
        setInvoice(inv);
        setGuest(g ?? null);
        setReservation(r ?? null);
        setStaff(s);
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
  }, [invoiceId, tick]);

  const staffById = useMemo(() => {
    const m = new Map<string, Staff>();
    for (const s of staff) m.set(s.id, s);
    return m;
  }, [staff]);

  const [tab, setTab] = useState<TabId>("items");
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [voidConfirmOpen, setVoidConfirmOpen] = useState(false);

  if (loading) {
    return (
      <>
        <PageHeader
          crumbs={[
            { label: "Facturation", href: "/admin/facturation" },
            { label: "Chargement…" },
          ]}
          title="Folio en cours de chargement"
        />
        <Card>
          <LoadingState variant="rows" rows={8} />
        </Card>
      </>
    );
  }

  if (error || !invoice) {
    return (
      <>
        <PageHeader
          crumbs={[
            { label: "Facturation", href: "/admin/facturation" },
            { label: "Erreur" },
          ]}
          title="Folio introuvable"
        />
        <Card>
          <ErrorState
            body={error ?? "Cette facture n'a pas pu être chargée."}
            onRetry={() => setTick((t) => t + 1)}
          />
        </Card>
      </>
    );
  }

  const overdue = invoiceOverdue(invoice);
  const due = daysUntilDue(invoice);
  const balance = invoice.balanceDA;

  const onMarkPaid = async () => {
    if (balance <= 0) return;
    const session = currentSession();
    await repo.invoices.addPayment(invoice.id, {
      method: "cash",
      amountDA: balance,
      receivedAt: new Date().toISOString(),
      takenBy: session?.staffId ?? "user_marie",
      note: "Marquée comme payée — règlement direct.",
    });
    toast.push({
      tone: "ok",
      title: "Folio soldé",
      body: `Solde de ${fmtDA(balance)} encaissé.`,
    });
  };

  const onVoid = async () => {
    await repo.invoices.void(invoice.id);
    toast.push({
      tone: "warn",
      title: "Facture annulée",
      body: `${invoice.ref} a été marquée comme annulée.`,
    });
    setVoidConfirmOpen(false);
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Facturation", href: "/admin/facturation" },
          { label: invoice.ref },
        ]}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            <span>{invoice.ref}</span>
            <InvoiceStatusPill status={invoice.status} small={false} />
            {overdue ? (
              <Badge tone="danger" small={false} icon={<AlarmClock className="size-3.5" />}>
                En retard
              </Badge>
            ) : null}
          </span>
        }
        subtitle={
          <>
            {"Émise le "}
            <span className="tnum">{fmtDate(invoice.issuedAt)}</span>
            {invoice.dueAt ? (
              <>
                {" · échéance "}
                <span className="tnum">{fmtDate(invoice.dueAt)}</span>
              </>
            ) : null}
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              href="/admin/facturation"
              leftIcon={<Receipt className="size-4" />}
            >
              Retour aux factures
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ─── Main : tabs ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Tabs
              tabs={[
                {
                  id: "items",
                  label: "Lignes",
                  badge: `${invoice.items.length}`,
                },
                {
                  id: "payments",
                  label: "Paiements",
                  badge: `${invoice.payments.length}`,
                },
                {
                  id: "history",
                  label: "Historique",
                },
              ]}
              active={tab}
              onChange={(id) => setTab(id as TabId)}
              className="px-4"
            />

            {tab === "items" ? (
              <ItemsTab
                invoice={invoice}
                onAdd={() => setAddItemOpen(true)}
                voidStatus={invoice.status === "void"}
              />
            ) : null}

            {tab === "payments" ? (
              <PaymentsTab
                invoice={invoice}
                staffById={staffById}
                onAdd={() => setAddPaymentOpen(true)}
                voidStatus={invoice.status === "void"}
              />
            ) : null}

            {tab === "history" ? (
              <HistoryTab invoice={invoice} staffById={staffById} />
            ) : null}
          </Card>
        </div>

        {/* ─── Side : récapitulatif ────────────────────────────────── */}
        <div className="space-y-4">
          {/* Récapitulatif */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <CircleDollarSign className="size-4 text-[var(--color-admin-accent)]" />
                  Récapitulatif
                </span>
              }
            />
            <CardBody>
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                <StatTile
                  label="Total"
                  value={fmtDA(invoice.totalDA)}
                  icon={<FileText className="size-4" />}
                />
                <StatTile
                  label="Payé"
                  value={fmtDA(invoice.paidDA)}
                  icon={<Wallet className="size-4" />}
                />
                <StatTile
                  label="Solde"
                  value={fmtDA(balance)}
                  deltaTone={balance > 0 ? (overdue ? "danger" : "warn") : "ok"}
                  helper={balance > 0 ? "Reste dû" : "Soldé"}
                  icon={<Wallet2 className="size-4" />}
                />
                <StatTile
                  label="Échéance"
                  value={
                    due === null
                      ? "—"
                      : due > 0
                        ? `J−${due}`
                        : due === 0
                          ? "Aujourd'hui"
                          : `J+${Math.abs(due)}`
                  }
                  helper={invoice.dueAt ? fmtDate(invoice.dueAt) : "Aucune"}
                  deltaTone={
                    due === null
                      ? undefined
                      : due >= 0
                        ? "ok"
                        : "danger"
                  }
                  icon={<AlarmClock className="size-4" />}
                />
              </div>
            </CardBody>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Hash className="size-4 text-[var(--color-admin-accent)]" />
                  Client
                </span>
              }
            />
            <CardBody>
              {guest ? (
                <>
                  <AvatarChip
                    firstName={guest.firstName}
                    lastName={guest.lastName}
                    subtitle={guest.email}
                    size="md"
                  />
                  <dl className="mt-3 space-y-1.5 text-[12.5px]">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[var(--color-admin-muted)]">Téléphone</dt>
                      <dd className="tnum text-[var(--color-admin-text)]">
                        {guest.phone}
                      </dd>
                    </div>
                    {guest.nationality ? (
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-[var(--color-admin-muted)]">Nationalité</dt>
                        <dd className="text-[var(--color-admin-text)]">
                          {guest.nationality}
                        </dd>
                      </div>
                    ) : null}
                    {guest.vip ? (
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-[var(--color-admin-muted)]">Statut</dt>
                        <dd>
                          <Badge tone="amber" small>
                            VIP
                          </Badge>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      href={`/admin/clients/${guest.id}`}
                      rightIcon={<ArrowUpRight className="size-4" />}
                    >
                      Voir le profil client
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Client introuvable"
                  body="La fiche client liée à cette facture n'existe plus."
                />
              )}
            </CardBody>
          </Card>

          {/* Réservation */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-[var(--color-admin-accent)]" />
                  Réservation
                </span>
              }
            />
            <CardBody>
              {reservation ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="tnum text-[13px] font-medium text-[var(--color-admin-text)]">
                      {reservation.ref}
                    </span>
                    <ReservationStatusPill status={reservation.status} />
                  </div>
                  <dl className="mt-3 space-y-1.5 text-[12.5px]">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[var(--color-admin-muted)]">Arrivée</dt>
                      <dd className="tnum text-[var(--color-admin-text)]">
                        {fmtDate(reservation.checkIn)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[var(--color-admin-muted)]">Départ</dt>
                      <dd className="tnum text-[var(--color-admin-text)]">
                        {fmtDate(reservation.checkOut)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[var(--color-admin-muted)]">Chambre</dt>
                      <dd className="tnum text-[var(--color-admin-text)]">
                        {reservation.roomNumber ?? "à attribuer"}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[var(--color-admin-muted)]">Occupants</dt>
                      <dd className="tnum text-[var(--color-admin-text)]">
                        {reservation.adults} adulte
                        {reservation.adults > 1 ? "s" : ""}
                        {reservation.children > 0
                          ? ` · ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}`
                          : ""}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      href={`/admin/reservations/${reservation.id}`}
                      rightIcon={<ArrowUpRight className="size-4" />}
                    >
                      Voir la réservation
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Réservation introuvable"
                  body="Le séjour associé n'est plus présent dans le système."
                />
              )}
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <TicketCheck className="size-4 text-[var(--color-admin-accent)]" />
                  Actions
                </span>
              }
            />
            <CardBody>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Wallet className="size-4" />}
                  onClick={onMarkPaid}
                  disabled={balance <= 0 || invoice.status === "void"}
                  title={
                    balance <= 0
                      ? "Le folio est déjà soldé."
                      : invoice.status === "void"
                        ? "Folio annulé — règlement impossible."
                        : undefined
                  }
                >
                  Marquer comme payée
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Ban className="size-4" />}
                  onClick={() => setVoidConfirmOpen(true)}
                  disabled={invoice.status === "void"}
                >
                  Annuler la facture
                </Button>
                <span
                  title="Export PDF — fonctionnalité à venir dans une prochaine livraison."
                  className="inline-block"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Download className="size-4" />}
                    disabled
                    className="w-full justify-start"
                  >
                    Exporter PDF
                  </Button>
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <AddItemDialog
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        invoice={invoice}
        onAdded={() => {
          toast.push({ tone: "ok", title: "Ligne ajoutée au folio." });
          setAddItemOpen(false);
        }}
      />

      <AddPaymentDialog
        open={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        invoice={invoice}
        onAdded={() => {
          toast.push({ tone: "ok", title: "Paiement enregistré." });
          setAddPaymentOpen(false);
        }}
      />

      <Dialog
        open={voidConfirmOpen}
        onClose={() => setVoidConfirmOpen(false)}
        title="Annuler cette facture ?"
        description="Le folio sera marqué comme annulé. Les lignes et paiements restent visibles pour audit, mais le folio n'est plus actif."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVoidConfirmOpen(false)}
            >
              Conserver
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Ban className="size-4" />}
              onClick={onVoid}
            >
              Oui, annuler
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-[var(--color-admin-text)]">
          {"Vous êtes sur le point d'annuler "}
          <span className="font-medium tnum">{invoice.ref}</span>
          {"."}
        </p>
        <p className="mt-2 text-[12.5px] text-[var(--color-admin-muted)]">
          {balance > 0
            ? `Solde restant : ${fmtDA(balance)}. Toute somme déjà encaissée devra être traitée séparément (avoir / remboursement).`
            : "Le folio est déjà soldé — l'annulation est purement administrative."}
        </p>
      </Dialog>

      <p className="text-center text-[11px] text-[var(--color-admin-faint)] pt-2">
        <Link href="/admin/facturation" className="hover:text-[var(--color-admin-text)] transition-colors">
          Revenir à la liste des factures
        </Link>
      </p>

      <span className="sr-only" aria-live="polite">
        Onglet actif : {tab === "items" ? "Lignes" : tab === "payments" ? "Paiements" : "Historique"}.
      </span>
    </>
  );
}

// ─── Onglet « Lignes » ────────────────────────────────────────────────

function ItemsTab({
  invoice,
  onAdd,
  voidStatus,
}: {
  invoice: Invoice;
  onAdd: () => void;
  voidStatus: boolean;
}) {
  const cols: Column<InvoiceItem>[] = [
    {
      key: "source",
      header: "Source",
      cell: (it) => (
        <Badge tone={itemSourceTone[it.source]} small>
          {invoiceItemSourceLabels[it.source]}
        </Badge>
      ),
      width: "w-[130px]",
    },
    {
      key: "label",
      header: "Libellé",
      cell: (it) => (
        <span className="text-[13px] text-[var(--color-admin-text)]">{it.label}</span>
      ),
    },
    {
      key: "qty",
      header: "Quantité",
      cell: (it) => <span className="tnum">{it.qty}</span>,
      align: "right",
      width: "w-[100px]",
      hideBelow: "md",
    },
    {
      key: "unit",
      header: "Prix unitaire",
      cell: (it) => <span className="tnum">{fmtDA(it.unitPriceDA)}</span>,
      align: "right",
      width: "w-[140px]",
      hideBelow: "md",
    },
    {
      key: "total",
      header: "Total",
      cell: (it) => (
        <span className="tnum font-medium text-[var(--color-admin-text)]">
          {fmtDA(it.totalDA)}
        </span>
      ),
      align: "right",
      width: "w-[140px]",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-admin-divider)]">
        <p className="text-[12.5px] text-[var(--color-admin-muted)]">
          {invoice.items.length} ligne{invoice.items.length > 1 ? "s" : ""} sur le folio.
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="size-4" />}
          onClick={onAdd}
          disabled={voidStatus}
          title={voidStatus ? "Folio annulé — aucune ligne ne peut être ajoutée." : undefined}
        >
          Ajouter une ligne
        </Button>
      </div>

      {invoice.items.length === 0 ? (
        <EmptyState
          icon={<ListPlus className="size-5" />}
          title="Aucune ligne pour ce folio"
          body="Commencez par ajouter l'hébergement et les taxes de séjour."
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="size-4" />}
              onClick={onAdd}
              disabled={voidStatus}
            >
              Ajouter une ligne
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={cols}
            rows={[...invoice.items].sort(byAddedDesc).reverse()}
            rowKey={(it) => it.id}
            density="comfortable"
            className="rounded-none border-0 ring-0 shadow-none"
          />
          <div className="flex items-center justify-between gap-3 px-4 py-4 border-t border-[var(--color-admin-divider)] bg-[var(--color-admin-sunken)] rounded-b-[var(--radius-admin-lg)]">
            <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
              Total facture
            </span>
            <span className="font-semibold tnum text-[20px] leading-7 text-[var(--color-admin-text)]">
              {fmtDA(invoice.totalDA)}
            </span>
          </div>
        </>
      )}
    </>
  );
}

// ─── Onglet « Paiements » ─────────────────────────────────────────────

function PaymentsTab({
  invoice,
  staffById,
  onAdd,
  voidStatus,
}: {
  invoice: Invoice;
  staffById: Map<string, Staff>;
  onAdd: () => void;
  voidStatus: boolean;
}) {
  const cols: Column<Payment>[] = [
    {
      key: "method",
      header: "Méthode",
      cell: (p) => (
        <Badge tone={paymentMethodTone[p.method]} small icon={methodIcon(p.method)}>
          {paymentMethodLabels[p.method]}
        </Badge>
      ),
      width: "w-[150px]",
    },
    {
      key: "amount",
      header: "Montant",
      cell: (p) => (
        <span className="tnum font-medium text-[var(--color-admin-text)]">
          {fmtDA(p.amountDA)}
        </span>
      ),
      align: "right",
      width: "w-[140px]",
    },
    {
      key: "received",
      header: "Reçu le",
      cell: (p) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtDateTime(p.receivedAt)}
        </span>
      ),
      width: "w-[170px]",
      hideBelow: "md",
    },
    {
      key: "takenBy",
      header: "Pris par",
      cell: (p) => {
        const s = staffById.get(p.takenBy);
        return s ? (
          <AvatarChip firstName={s.firstName} lastName={s.lastName} />
        ) : (
          <span className="text-[12px] text-[var(--color-admin-faint)]">—</span>
        );
      },
      width: "w-[180px]",
      hideBelow: "lg",
    },
    {
      key: "note",
      header: "Note",
      cell: (p) =>
        p.note ? (
          <span className="text-[12.5px] text-[var(--color-admin-muted)]">{p.note}</span>
        ) : (
          <span className="text-[12px] text-[var(--color-admin-faint)]">—</span>
        ),
      hideBelow: "lg",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-admin-divider)]">
        <p className="text-[12.5px] text-[var(--color-admin-muted)]">
          {invoice.payments.length} paiement
          {invoice.payments.length > 1 ? "s" : ""} reçu
          {invoice.payments.length > 1 ? "s" : ""} sur ce folio.
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<BanknoteArrowDown className="size-4" />}
          onClick={onAdd}
          disabled={voidStatus || invoice.balanceDA <= 0}
          title={
            voidStatus
              ? "Folio annulé — aucun encaissement possible."
              : invoice.balanceDA <= 0
                ? "Folio soldé — aucun montant à encaisser."
                : undefined
          }
        >
          Enregistrer un paiement
        </Button>
      </div>

      {invoice.payments.length === 0 ? (
        <EmptyState
          icon={<BanknoteArrowDown className="size-5" />}
          title="Aucun paiement reçu"
          body="Enregistrez le premier acompte ou paiement complet pour solder ce folio."
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<BanknoteArrowDown className="size-4" />}
              onClick={onAdd}
              disabled={voidStatus || invoice.balanceDA <= 0}
            >
              Enregistrer un paiement
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={cols}
          rows={[...invoice.payments].sort(byReceivedDesc)}
          rowKey={(p) => p.id}
          density="comfortable"
          className="rounded-none border-0 ring-0 shadow-none"
        />
      )}
    </>
  );
}

function methodIcon(m: PaymentMethod) {
  if (m === "cash") return <BanknoteArrowDown className="size-3" />;
  if (m === "card") return <CreditCard className="size-3" />;
  if (m === "transfer") return <ArrowUpRight className="size-3" />;
  return <TicketCheck className="size-3" />;
}

// ─── Onglet « Historique » ────────────────────────────────────────────

type HistoryEvent = {
  at: string;
  tone: "ok" | "info" | "warn" | "muted";
  title: string;
  body?: string;
};

function HistoryTab({
  invoice,
  staffById,
}: {
  invoice: Invoice;
  staffById: Map<string, Staff>;
}) {
  const events: HistoryEvent[] = [];
  events.push({
    at: invoice.issuedAt,
    tone: "info",
    title: `Facture ${invoice.ref} ouverte`,
    body: invoice.dueAt ? `Échéance fixée au ${fmtDate(invoice.dueAt)}.` : undefined,
  });
  for (const it of invoice.items) {
    events.push({
      at: it.addedAt,
      tone: "muted",
      title: `Ligne ajoutée — ${it.label}`,
      body: `${invoiceItemSourceLabels[it.source]} · ${it.qty} × ${fmtDA(it.unitPriceDA)} = ${fmtDA(it.totalDA)}`,
    });
  }
  for (const p of invoice.payments) {
    const s = staffById.get(p.takenBy);
    const name = s ? `${s.firstName} ${s.lastName}` : "Anonyme";
    events.push({
      at: p.receivedAt,
      tone: "ok",
      title: `Paiement reçu — ${fmtDA(p.amountDA)} (${paymentMethodLabels[p.method]})`,
      body: `Encaissé par ${name}.${p.note ? ` ${p.note}` : ""}`,
    });
  }
  if (invoice.status === "void") {
    events.push({
      at: invoice.issuedAt,
      tone: "warn",
      title: "Facture marquée comme annulée",
      body: "Le folio reste consultable pour audit.",
    });
  }
  if (invoice.status === "paid" && invoice.balanceDA <= 0 && invoice.payments.length > 0) {
    const last = invoice.payments[invoice.payments.length - 1];
    events.push({
      at: last.receivedAt,
      tone: "ok",
      title: "Folio soldé",
      body: "Plus aucun montant restant à encaisser.",
    });
  }
  events.sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <div className="px-4 py-3 border-b border-[var(--color-admin-divider)]">
        <p className="text-[12.5px] text-[var(--color-admin-muted)] inline-flex items-center gap-2">
          <History className="size-3.5" />
          {events.length} événement{events.length > 1 ? "s" : ""} sur le folio.
        </p>
      </div>
      {events.length === 0 ? (
        <EmptyState
          title="Pas encore d'historique"
          body="L'activité sur ce folio s'affichera ici dès la première modification."
        />
      ) : (
        <ul className="divide-y divide-[var(--color-admin-divider)]">
          {events.map((ev, idx) => (
            <li key={`${ev.at}-${idx}`} className="flex items-start gap-3 px-5 py-3">
              <span
                className={`status-dot mt-1.5 ${toneDot[ev.tone]}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--color-admin-text)]">
                  {ev.title}
                </p>
                {ev.body ? (
                  <p className="mt-0.5 text-[12px] text-[var(--color-admin-muted)]">
                    {ev.body}
                  </p>
                ) : null}
              </div>
              <span className="tnum text-[11.5px] text-[var(--color-admin-faint)] shrink-0">
                {fmtDateTime(ev.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ─── Dialog : Ajouter une ligne ───────────────────────────────────────

function AddItemDialog({
  open,
  onClose,
  invoice,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  onAdded: () => void;
}) {
  const [label, setLabel] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [source, setSource] = useState<InvoiceItemSource>("addon");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabel("");
    setQty("1");
    setPrice("");
    setSource("addon");
    setSubmitting(false);
    setErr(null);
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(qty);
    const p = Number(price);
    if (!label.trim()) {
      setErr("Saisissez un libellé.");
      return;
    }
    if (!Number.isFinite(q) || q <= 0) {
      setErr("La quantité doit être un nombre positif.");
      return;
    }
    if (!Number.isFinite(p) || p < 0) {
      setErr("Le prix unitaire doit être un nombre positif.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await repo.invoices.addItem(invoice.id, {
        label: label.trim(),
        qty: q,
        unitPriceDA: p,
        totalDA: q * p,
        source,
      });
      onAdded();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur inconnue");
      setSubmitting(false);
    }
  };

  const previewTotal =
    Number.isFinite(Number(qty)) && Number.isFinite(Number(price))
      ? Number(qty) * Number(price)
      : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Ajouter une ligne"
      description={`Sur le folio ${invoice.ref}.`}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="add-item-form"
            onClick={onSubmit}
            loading={submitting}
            loadingLabel="Ajout…"
          >
            Ajouter au folio
          </Button>
        </>
      }
    >
      <form id="add-item-form" className="space-y-4" onSubmit={onSubmit}>
        <Field label="Libellé" htmlFor="add-item-label" required>
          <Input
            id="add-item-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex : Bouteille d'eau — minibar"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantité" htmlFor="add-item-qty" required>
            <Input
              id="add-item-qty"
              type="number"
              min={1}
              step={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="tnum"
            />
          </Field>
          <Field label="Prix unitaire (DA)" htmlFor="add-item-price" required>
            <Input
              id="add-item-price"
              type="number"
              min={0}
              step={100}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="tnum"
            />
          </Field>
        </div>
        <Field label="Source" required>
          <RadioGroup
            name="add-item-source"
            value={source}
            onChange={setSource}
            options={(Object.keys(invoiceItemSourceLabels) as InvoiceItemSource[]).map(
              (src) => ({
                value: src,
                label: invoiceItemSourceLabels[src],
              }),
            )}
          />
        </Field>
        <div className="flex items-center justify-between rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] px-3 py-2.5">
          <span className="text-[12.5px] text-[var(--color-admin-muted)]">
            Total ligne
          </span>
          <span className="tnum font-semibold text-[15px] text-[var(--color-admin-text)]">
            {fmtDA(previewTotal)}
          </span>
        </div>
        {err ? (
          <p className="text-[12px] text-[var(--color-admin-danger-fg)]" role="alert">
            {err}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}

// ─── Dialog : Enregistrer un paiement ─────────────────────────────────

function AddPaymentDialog({
  open,
  onClose,
  invoice,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  onAdded: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [amount, setAmount] = useState<string>(String(invoice.balanceDA));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMethod("card");
    setAmount(String(invoice.balanceDA));
    setNote("");
    setSubmitting(false);
    setErr(null);
  }, [open, invoice.balanceDA]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setErr("Le montant doit être un nombre positif.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const session = currentSession();
      await repo.invoices.addPayment(invoice.id, {
        method,
        amountDA: amt,
        receivedAt: new Date().toISOString(),
        takenBy: session?.staffId ?? "user_marie",
        note: note.trim() || undefined,
      });
      onAdded();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur inconnue");
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Enregistrer un paiement"
      description={`Solde restant : ${fmtDA(invoice.balanceDA)}.`}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="add-payment-form"
            onClick={onSubmit}
            loading={submitting}
            loadingLabel="Encaissement…"
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="add-payment-form" className="space-y-4" onSubmit={onSubmit}>
        <Field label="Méthode" required>
          <RadioGroup
            name="add-payment-method"
            value={method}
            onChange={setMethod}
            options={(Object.keys(paymentMethodLabels) as PaymentMethod[]).map(
              (m) => ({
                value: m,
                label: (
                  <span className="inline-flex items-center gap-2">
                    {methodIcon(m)}
                    {paymentMethodLabels[m]}
                  </span>
                ),
              }),
            )}
          />
        </Field>
        <Field
          label="Montant (DA)"
          htmlFor="add-payment-amount"
          required
          helper={`Maximum suggéré : ${fmtDA(invoice.balanceDA)}.`}
        >
          <Input
            id="add-payment-amount"
            type="number"
            min={1}
            step={100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="tnum"
          />
        </Field>
        <Field label="Note" htmlFor="add-payment-note" helper="Optionnelle.">
          <Textarea
            id="add-payment-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : règlement par carte Visa, terminal n° 2"
            rows={3}
          />
        </Field>
        {err ? (
          <p className="text-[12px] text-[var(--color-admin-danger-fg)]" role="alert">
            {err}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}
