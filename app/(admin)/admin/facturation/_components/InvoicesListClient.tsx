"use client";

import {
  AlarmClock,
  CircleDollarSign,
  FileText,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { InvoiceStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { Field, Input, RadioGroup, Select } from "@/components/admin/form";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { useToast } from "@/components/admin/Toast";
import { FilterChip, Toolbar } from "@/components/admin/Toolbar";

import { fmtDA, fmtDate } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  invoiceItemSourceLabels,
  type Guest,
  type Invoice,
  type InvoiceItemSource,
  type InvoiceStatus,
  type Reservation,
} from "@/lib/admin/types";

import {
  byIssuedDesc,
  firstOfMonthIso,
  firstOfNextMonthIso,
  invoiceInWindow,
  invoiceOverdue,
} from "./helpers";

const STATUS_FILTERS: Array<{ id: InvoiceStatus; label: string }> = [
  { id: "open", label: "Ouverte" },
  { id: "paid", label: "Payée" },
  { id: "partial", label: "Partielle" },
  { id: "void", label: "Annulée" },
  { id: "refunded", label: "Remboursée" },
];

type PeriodFilter = "all" | "today" | "month" | "overdue";

const PERIODS: Array<{ id: PeriodFilter; label: string }> = [
  { id: "all", label: "Toutes périodes" },
  { id: "today", label: "Aujourd'hui" },
  { id: "month", label: "Ce mois" },
  { id: "overdue", label: "En retard" },
];

export function InvoicesListClient() {
  const router = useRouter();
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([
      repo.invoices.list(),
      repo.guests.list(),
      repo.reservations.list(),
    ])
      .then(([i, g, r]) => {
        if (!mounted) return;
        setInvoices(i);
        setGuests(g);
        setReservations(r);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Erreur inconnue");
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tick]);

  const [search, setSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Set<InvoiceStatus>>(
    () => new Set(),
  );
  const [period, setPeriod] = useState<PeriodFilter>("all");

  const [createOpen, setCreateOpen] = useState(false);

  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  const reservationById = useMemo(() => {
    const m = new Map<string, Reservation>();
    for (const r of reservations) m.set(r.id, r);
    return m;
  }, [reservations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    const monthStart = firstOfMonthIso();
    const monthEnd = firstOfNextMonthIso();
    return invoices
      .filter((inv) => {
        if (activeStatuses.size > 0 && !activeStatuses.has(inv.status)) return false;
        if (period === "today" && inv.issuedAt.slice(0, 10) !== today) return false;
        if (period === "month" && !invoiceInWindow(inv, monthStart, monthEnd))
          return false;
        if (period === "overdue" && !invoiceOverdue(inv)) return false;
        if (q) {
          const g = guestById.get(inv.guestId);
          const res = reservationById.get(inv.reservationId);
          const haystack = [
            inv.ref,
            res?.ref ?? "",
            g ? `${g.firstName} ${g.lastName}` : "",
            g?.email ?? "",
            g?.phone ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(byIssuedDesc);
  }, [invoices, search, activeStatuses, period, guestById, reservationById]);

  const kpis = useMemo(() => {
    const monthStart = firstOfMonthIso();
    const monthEnd = firstOfNextMonthIso();
    const monthly = invoices.filter((i) => invoiceInWindow(i, monthStart, monthEnd));
    const revenue = monthly.reduce(
      (s, i) => (i.status === "void" ? s : s + i.totalDA),
      0,
    );
    const cashed = invoices.reduce(
      (s, i) => (i.status === "void" ? s : s + i.paidDA),
      0,
    );
    const outstanding = invoices.reduce(
      (s, i) =>
        i.status === "open" || i.status === "partial" ? s + i.balanceDA : s,
      0,
    );
    const overdueCount = invoices.filter(invoiceOverdue).length;
    return { revenue, cashed, outstanding, overdueCount };
  }, [invoices]);

  const toggleStatus = (s: InvoiceStatus) =>
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const columns: Column<Invoice>[] = [
    {
      key: "ref",
      header: "Référence",
      cell: (i) => (
        <span className="tnum text-[12.5px] font-medium text-[var(--color-admin-text)]">
          {i.ref}
        </span>
      ),
      width: "w-[140px]",
      sortable: true,
      sortFn: (a, b) => a.ref.localeCompare(b.ref),
    },
    {
      key: "guest",
      header: "Client",
      cell: (i) => {
        const g = guestById.get(i.guestId);
        return (
          <AvatarChip
            firstName={g?.firstName}
            lastName={g?.lastName}
            subtitle={g?.email ?? g?.phone ?? ""}
          />
        );
      },
    },
    {
      key: "reservation",
      header: "Réservation",
      cell: (i) => {
        const res = reservationById.get(i.reservationId);
        if (!res) return <span className="text-[12px] text-[var(--color-admin-faint)]">—</span>;
        return (
          <Link
            href={`/admin/reservations/${res.id}`}
            onClick={(e) => e.stopPropagation()}
            className="tnum text-[12.5px] text-[var(--color-admin-text)] hover:text-[var(--color-admin-accent)] underline-offset-2 hover:underline"
          >
            {res.ref}
          </Link>
        );
      },
      width: "w-[160px]",
      hideBelow: "md",
    },
    {
      key: "issued",
      header: "Émise le",
      cell: (i) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtDate(i.issuedAt)}
        </span>
      ),
      width: "w-[120px]",
      hideBelow: "lg",
      sortable: true,
      sortFn: (a, b) => a.issuedAt.localeCompare(b.issuedAt),
    },
    {
      key: "due",
      header: "Échéance",
      cell: (i) => {
        if (!i.dueAt) {
          return <span className="text-[12px] text-[var(--color-admin-faint)]">—</span>;
        }
        const overdue = invoiceOverdue(i);
        return (
          <span
            className={`tnum text-[12.5px] ${overdue ? "text-[var(--color-admin-danger-fg)]" : "text-[var(--color-admin-muted)]"}`}
          >
            {fmtDate(i.dueAt)}
          </span>
        );
      },
      width: "w-[120px]",
      hideBelow: "lg",
    },
    {
      key: "total",
      header: "Total",
      cell: (i) => <span className="tnum">{fmtDA(i.totalDA)}</span>,
      align: "right",
      width: "w-[120px]",
      sortable: true,
      sortFn: (a, b) => a.totalDA - b.totalDA,
    },
    {
      key: "paid",
      header: "Payé",
      cell: (i) => (
        <span className="tnum text-[var(--color-admin-muted)]">{fmtDA(i.paidDA)}</span>
      ),
      align: "right",
      width: "w-[110px]",
      hideBelow: "md",
    },
    {
      key: "balance",
      header: "Solde",
      cell: (i) => {
        const overdue = invoiceOverdue(i);
        if (i.balanceDA <= 0) {
          return (
            <span className="tnum text-[var(--color-admin-muted)]">{fmtDA(0)}</span>
          );
        }
        return (
          <span
            className={`tnum font-medium ${overdue ? "text-[var(--color-admin-danger-fg)]" : "text-[var(--color-admin-warn-fg)]"}`}
          >
            {fmtDA(i.balanceDA)}
          </span>
        );
      },
      align: "right",
      width: "w-[120px]",
      sortable: true,
      sortFn: (a, b) => a.balanceDA - b.balanceDA,
    },
    {
      key: "status",
      header: "Statut",
      cell: (i) => <InvoiceStatusPill status={i.status} />,
      width: "w-[120px]",
      align: "right",
    },
  ];

  return (
    <>
      <PageHeader
        title="Facturation"
        subtitle="Folios, factures et soldes en cours pour l'ensemble des séjours."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              href="/admin/facturation/paiements"
              leftIcon={<Wallet className="size-4" />}
            >
              Paiements
            </Button>
            <Button
              variant="secondary"
              size="sm"
              href="/admin/facturation/pos"
              leftIcon={<Receipt className="size-4" />}
            >
              Points de vente
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="size-4" />}
              onClick={() => setCreateOpen(true)}
            >
              Nouvelle facture
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Chiffre d'affaires du mois"
          value={fmtDA(kpis.revenue)}
          helper="Total facturé (hors annulations)"
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatTile
          label="Encaissé (tous folios)"
          value={fmtDA(kpis.cashed)}
          helper="Cumul des paiements reçus"
          icon={<Wallet className="size-4" />}
        />
        <StatTile
          label="À encaisser"
          value={fmtDA(kpis.outstanding)}
          helper="Soldes des folios ouverts ou partiels"
          deltaTone={kpis.outstanding > 0 ? "warn" : "ok"}
          icon={<FileText className="size-4" />}
        />
        <StatTile
          label="En retard"
          value={kpis.overdueCount}
          helper="Échéances dépassées avec solde dû"
          deltaTone={kpis.overdueCount > 0 ? "danger" : "ok"}
          icon={<AlarmClock className="size-4" />}
        />
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher par référence, client, réservation…"
        filters={
          <>
            {STATUS_FILTERS.map((s) => (
              <FilterChip
                key={s.id}
                label={s.label}
                active={activeStatuses.has(s.id)}
                onClick={() => toggleStatus(s.id)}
                onClear={() => toggleStatus(s.id)}
              />
            ))}
          </>
        }
        trailing={
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="h-10 w-full cursor-pointer appearance-none rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] ring-1 ring-[var(--color-admin-border)] pl-3 pr-8 text-[16px] md:h-9 md:w-auto md:text-[12.5px] text-[var(--color-admin-text)] outline-none transition-shadow duration-150 focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)]"
            aria-label="Filtrer par période"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        }
      />

      {error ? (
        <Card>
          <ErrorState
            body={`Impossible de charger les factures. ${error}`}
            onRetry={() => setTick((t) => t + 1)}
          />
        </Card>
      ) : loading ? (
        <Card>
          <LoadingState variant="rows" rows={8} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Receipt className="size-5" />}
            title="Aucune facture ne correspond"
            body={"Ajustez la recherche, les filtres, ou créez une nouvelle facture."}
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => setCreateOpen(true)}
              >
                Nouvelle facture
              </Button>
            }
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(i) => i.id}
          density="comfortable"
          onRowClick={(i) => {
            router.push(`/admin/facturation/${i.id}`);
          }}
        />
      )}

      <NewInvoiceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        reservations={reservations}
        guests={guests}
        invoices={invoices}
        onCreated={(inv) => {
          toast.push({
            tone: "ok",
            title: "Facture créée",
            body: `${inv.ref} ouverte.`,
          });
          setCreateOpen(false);
          router.push(`/admin/facturation/${inv.id}`);
        }}
      />
    </>
  );
}

// ─── Dialog : Nouvelle facture ────────────────────────────────────────

function NewInvoiceDialog({
  open,
  onClose,
  reservations,
  guests,
  invoices,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  reservations: Reservation[];
  guests: Guest[];
  invoices: Invoice[];
  onCreated: (inv: Invoice) => void;
}) {
  // Réservations actives = pas annulées / no-show / déjà parties.
  const activeReservations = useMemo(
    () =>
      reservations
        .filter(
          (r) =>
            r.status !== "cancelled" &&
            r.status !== "no-show" &&
            r.status !== "checked-out",
        )
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn)),
    [reservations],
  );

  // Marquer les réservations qui ont déjà une facture (info utile au comptoir).
  const reservationHasInvoice = useMemo(() => {
    const set = new Set<string>();
    for (const i of invoices) {
      if (i.status !== "void") set.add(i.reservationId);
    }
    return set;
  }, [invoices]);

  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  const [reservationId, setReservationId] = useState<string>("");
  const [dueAt, setDueAt] = useState<string>("");
  const [itemLabel, setItemLabel] = useState<string>("Hébergement");
  const [itemQty, setItemQty] = useState<string>("1");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemSource, setItemSource] = useState<InvoiceItemSource>("room");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Réinitialiser à l'ouverture / fermeture.
  useEffect(() => {
    if (!open) return;
    const first = activeReservations[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReservationId(first?.id ?? "");
    setDueAt("");
    setItemLabel(first ? `Hébergement — ${first.ref}` : "Hébergement");
    setItemQty("1");
    setItemPrice(first ? String(first.ratePerNightDA) : "");
    setItemSource("room");
    setSubmitting(false);
    setErr(null);
  }, [open, activeReservations]);

  // Mettre à jour le libellé et le prix à chaque changement de réservation.
  useEffect(() => {
    const res = activeReservations.find((r) => r.id === reservationId);
    if (!res) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItemLabel(`Hébergement — ${res.ref}`);
    setItemPrice(String(res.ratePerNightDA));
  }, [reservationId, activeReservations]);

  const selectedReservation = activeReservations.find((r) => r.id === reservationId);
  const selectedGuest = selectedReservation
    ? guestById.get(selectedReservation.guestId)
    : undefined;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation || !selectedGuest) {
      setErr("Sélectionnez une réservation pour continuer.");
      return;
    }
    const qty = Number(itemQty);
    const price = Number(itemPrice);
    if (!Number.isFinite(qty) || qty <= 0) {
      setErr("La quantité doit être un nombre positif.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setErr("Le prix unitaire doit être un nombre positif.");
      return;
    }
    if (!itemLabel.trim()) {
      setErr("Saisissez un libellé pour la première ligne.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const item = {
        id: "",
        label: itemLabel.trim(),
        qty,
        unitPriceDA: price,
        totalDA: qty * price,
        source: itemSource,
        addedAt: "",
      };
      const created = await repo.invoices.create({
        reservationId: selectedReservation.id,
        guestId: selectedGuest.id,
        status: "open",
        items: [item],
        payments: [],
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      onCreated(created);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur inconnue");
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nouvelle facture"
      description="Ouvrez un folio rattaché à une réservation. Vous pourrez ajouter d'autres lignes et paiements ensuite."
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSubmit}
            loading={submitting}
            loadingLabel="Création…"
            type="submit"
            form="new-invoice-form"
          >
            Créer la facture
          </Button>
        </>
      }
    >
      <form id="new-invoice-form" className="space-y-4" onSubmit={onSubmit}>
        {activeReservations.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-5" />}
            title="Aucune réservation active"
            body="Créez d'abord une réservation pour ouvrir une facture."
          />
        ) : (
          <>
            <Field
              label="Réservation"
              htmlFor="new-inv-reservation"
              required
              helper={
                selectedReservation && reservationHasInvoice.has(selectedReservation.id)
                  ? "Cette réservation possède déjà une facture — vous en créerez une seconde."
                  : undefined
              }
            >
              <Select
                id="new-inv-reservation"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
              >
                {activeReservations.map((r) => {
                  const g = guestById.get(r.guestId);
                  const name = g ? `${g.firstName} ${g.lastName}` : "Client inconnu";
                  return (
                    <option key={r.id} value={r.id}>
                      {r.ref} · {name}
                      {r.roomNumber ? ` · ch. ${r.roomNumber}` : ""}
                    </option>
                  );
                })}
              </Select>
            </Field>

            {selectedGuest ? (
              <div className="rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
                  Client rattaché
                </p>
                <div className="mt-1.5">
                  <AvatarChip
                    firstName={selectedGuest.firstName}
                    lastName={selectedGuest.lastName}
                    subtitle={selectedGuest.email}
                  />
                </div>
              </div>
            ) : null}

            <Field label="Échéance" htmlFor="new-inv-due" helper="Optionnelle.">
              <Input
                id="new-inv-due"
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </Field>

            <div className="space-y-3 pt-2 border-t border-[var(--color-admin-divider)]">
              <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
                Première ligne
              </p>
              <Field label="Libellé" htmlFor="new-inv-item-label" required>
                <Input
                  id="new-inv-item-label"
                  type="text"
                  value={itemLabel}
                  onChange={(e) => setItemLabel(e.target.value)}
                  placeholder="Ex : Suite Senior — 3 nuits"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantité" htmlFor="new-inv-item-qty" required>
                  <Input
                    id="new-inv-item-qty"
                    type="number"
                    min={1}
                    step={1}
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="tnum"
                  />
                </Field>
                <Field
                  label="Prix unitaire (DA)"
                  htmlFor="new-inv-item-price"
                  required
                >
                  <Input
                    id="new-inv-item-price"
                    type="number"
                    min={0}
                    step={100}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="tnum"
                  />
                </Field>
              </div>
              <Field label="Source" required>
                <RadioGroup
                  name="new-inv-item-source"
                  value={itemSource}
                  onChange={setItemSource}
                  options={(
                    Object.keys(invoiceItemSourceLabels) as InvoiceItemSource[]
                  ).map((src) => ({
                    value: src,
                    label: invoiceItemSourceLabels[src],
                  }))}
                />
              </Field>
              <div className="flex items-center justify-between rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] px-3 py-2.5">
                <span className="text-[12.5px] text-[var(--color-admin-muted)]">
                  Total ligne
                </span>
                <span className="tnum font-semibold text-[15px] text-[var(--color-admin-text)]">
                  {fmtDA(
                    Number.isFinite(Number(itemQty)) && Number.isFinite(Number(itemPrice))
                      ? Number(itemQty) * Number(itemPrice)
                      : 0,
                  )}
                </span>
              </div>
            </div>

            {err ? (
              <p
                className="text-[12px] text-[var(--color-admin-danger-fg)]"
                role="alert"
              >
                {err}
              </p>
            ) : null}
          </>
        )}
      </form>
    </Dialog>
  );
}

