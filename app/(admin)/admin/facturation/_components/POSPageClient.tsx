"use client";

import {
  Coffee,
  PackagePlus,
  Plus,
  Receipt,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { Field, Input, Select } from "@/components/admin/form";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { useToast } from "@/components/admin/Toast";

import { fmtDA, fmtTime } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  invoiceItemSourceLabels,
  type Guest,
  type Invoice,
  type InvoiceItem,
  type InvoiceItemSource,
  type Reservation,
} from "@/lib/admin/types";

import { isToday, itemSourceTone, todayIso } from "./helpers";

type PosSource = "pos-restaurant" | "pos-bar" | "pos-spa" | "extra";

type PosCard = {
  source: PosSource;
  label: string;
  icon: LucideIcon;
  status: "active" | "coming";
  statusLabel: string;
};

const POS_CARDS: PosCard[] = [
  {
    source: "pos-restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    status: "active",
    statusLabel: "Actif",
  },
  {
    source: "pos-bar",
    label: "Bar & Café",
    icon: Coffee,
    status: "active",
    statusLabel: "Actif",
  },
  {
    source: "pos-spa",
    label: "Bien-être",
    icon: Sparkles,
    status: "coming",
    statusLabel: "Hors service",
  },
  {
    source: "extra",
    label: "Extras & service en chambre",
    icon: PackagePlus,
    status: "active",
    statusLabel: "Actif",
  },
];

type DayItem = InvoiceItem & { invoice: Invoice };

export function POSPageClient() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([
      repo.invoices.list(),
      repo.reservations.list(),
      repo.guests.list(),
    ])
      .then(([i, r, g]) => {
        if (!mounted) return;
        setInvoices(i);
        setReservations(r);
        setGuests(g);
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

  // Toutes les lignes des factures, à plat.
  const allItems = useMemo<DayItem[]>(
    () => invoices.flatMap((inv) => inv.items.map((it) => ({ ...it, invoice: inv }))),
    [invoices],
  );

  // Stats par source (jour).
  const statsBySource = useMemo(() => {
    const result = new Map<
      InvoiceItemSource,
      { count: number; revenue: number }
    >();
    for (const it of allItems) {
      if (it.invoice.status === "void") continue;
      if (!isToday(it.addedAt)) continue;
      const curr = result.get(it.source) ?? { count: 0, revenue: 0 };
      curr.count += 1;
      curr.revenue += it.totalDA;
      result.set(it.source, curr);
    }
    return result;
  }, [allItems]);

  // Notes du jour : items créés aujourd'hui hors hébergement/taxe.
  const dayItems = useMemo<DayItem[]>(
    () =>
      allItems
        .filter(
          (it) =>
            isToday(it.addedAt) &&
            it.source !== "room" &&
            it.source !== "tax" &&
            it.invoice.status !== "void",
        )
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    [allItems],
  );

  const [posDialogSource, setPosDialogSource] = useState<PosSource | null>(null);

  if (error) {
    return (
      <>
        <PageHeader title="Points de vente (POS)" />
        <Card>
          <ErrorState
            body={`Impossible de charger les points de vente. ${error}`}
            onRetry={() => setTick((t) => t + 1)}
          />
        </Card>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader
          crumbs={[{ label: "Facturation", href: "/admin/facturation" }, { label: "Points de vente" }]}
          title="Points de vente (POS)"
        />
        <LoadingState variant="cards" />
        <Card>
          <LoadingState variant="rows" rows={6} />
        </Card>
      </>
    );
  }

  const cols: Column<DayItem>[] = [
    {
      key: "time",
      header: "Heure",
      cell: (it) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtTime(it.addedAt)}
        </span>
      ),
      width: "w-[90px]",
      sortable: true,
      sortFn: (a, b) => a.addedAt.localeCompare(b.addedAt),
    },
    {
      key: "source",
      header: "Source",
      cell: (it) => (
        <Badge tone={itemSourceTone[it.source]} small>
          {invoiceItemSourceLabels[it.source]}
        </Badge>
      ),
      width: "w-[140px]",
    },
    {
      key: "label",
      header: "Libellé",
      cell: (it) => (
        <span className="text-[13px] text-[var(--color-admin-text)]">{it.label}</span>
      ),
    },
    {
      key: "room",
      header: "Chambre / Réservation",
      cell: (it) => {
        const res = reservationById.get(it.invoice.reservationId);
        const g = guestById.get(it.invoice.guestId);
        const room = res?.roomNumber;
        return (
          <div className="min-w-0">
            <Link
              href={`/admin/facturation/${it.invoice.id}`}
              className="block tnum text-[12.5px] font-medium text-[var(--color-admin-text)] hover:text-[var(--color-admin-accent)] underline-offset-2 hover:underline"
            >
              {room ? `Ch. ${room}` : it.invoice.ref}
            </Link>
            {g ? (
              <span className="block text-[11.5px] text-[var(--color-admin-muted)] truncate">
                {g.firstName} {g.lastName}
              </span>
            ) : null}
          </div>
        );
      },
      width: "w-[220px]",
      hideBelow: "md",
    },
    {
      key: "qty",
      header: "Quantité",
      cell: (it) => <span className="tnum">{it.qty}</span>,
      align: "right",
      width: "w-[90px]",
      hideBelow: "lg",
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
      width: "w-[120px]",
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Facturation", href: "/admin/facturation" }, { label: "Points de vente" }]}
        title="Points de vente (POS)"
        subtitle="Restaurant, bar, bien-être et extras — imputez les notes directement sur les folios."
      />

      {/* Sources POS connectées */}
      <section className="space-y-3">
        <h2 className="text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
          Sources connectées
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
          {POS_CARDS.map((card) => {
            const stats = statsBySource.get(card.source) ?? { count: 0, revenue: 0 };
            const disabled = card.status === "coming";
            const Icon = card.icon;
            return (
              <Card key={card.source}>
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`inline-flex size-10 items-center justify-center rounded-[var(--radius-admin-md)] ${
                        disabled
                          ? "bg-[var(--color-admin-sunken)] text-[var(--color-admin-faint)]"
                          : "bg-[var(--color-admin-accent-soft)] text-[var(--color-admin-accent)]"
                      }`}
                    >
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <Badge tone={disabled ? "muted" : "ok"} small>
                      {card.statusLabel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[var(--color-admin-text)]">
                      {card.label}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[var(--color-admin-muted)]">
                      {disabled
                        ? "L'hôtel n'a pas encore de spa — ce module est désactivé."
                        : `Source ${invoiceItemSourceLabels[card.source]} reliée à la facturation.`}
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-admin-divider)]">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
                        Notes du jour
                      </dt>
                      <dd className="mt-1 font-semibold tnum text-[18px] text-[var(--color-admin-text)]">
                        {stats.count}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
                        CA du jour
                      </dt>
                      <dd
                        className={`mt-1 font-semibold tnum text-[18px] ${
                          stats.revenue > 0
                            ? "text-[var(--color-admin-accent)]"
                            : "text-[var(--color-admin-text)]"
                        }`}
                      >
                        {fmtDA(stats.revenue)}
                      </dd>
                    </div>
                  </dl>
                  <Button
                    variant={disabled ? "ghost" : "secondary"}
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={() => setPosDialogSource(card.source)}
                    disabled={disabled}
                    className="w-full justify-center"
                  >
                    Ajouter une note de POS
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Notes du jour */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
              Notes du jour
            </h2>
            <p className="mt-1 text-[13px] text-[var(--color-admin-text)]">
              Toutes les imputations POS du{" "}
              <span className="tnum">{todayIso()}</span>.
            </p>
          </div>
          <span className="text-[12.5px] text-[var(--color-admin-muted)]">
            {dayItems.length} note{dayItems.length > 1 ? "s" : ""}
          </span>
        </div>
        {dayItems.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Receipt className="size-5" />}
              title="Aucune note POS aujourd'hui"
              body="Imputez la première note depuis l'une des cartes ci-dessus."
            />
          </Card>
        ) : (
          <DataTable
            columns={cols}
            rows={dayItems}
            rowKey={(it) => it.id}
            density="comfortable"
          />
        )}
      </section>

      <PosNoteDialog
        open={posDialogSource !== null}
        source={posDialogSource}
        invoices={invoices}
        reservations={reservations}
        guests={guests}
        onClose={() => setPosDialogSource(null)}
        onAdded={(label) => {
          toast.push({
            tone: "ok",
            title: "Note POS imputée",
            body: label,
          });
          setPosDialogSource(null);
        }}
      />
    </>
  );
}

// ─── Dialog : Ajouter une note POS ────────────────────────────────────

function PosNoteDialog({
  open,
  source,
  invoices,
  reservations,
  guests,
  onClose,
  onAdded,
}: {
  open: boolean;
  source: PosSource | null;
  invoices: Invoice[];
  reservations: Reservation[];
  guests: Guest[];
  onClose: () => void;
  onAdded: (label: string) => void;
}) {
  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  // Réservations en cours (check-in en cours) — celles qui ont une chambre
  // attribuée et un séjour actif. C'est sur leurs folios qu'on impute.
  const activeReservations = useMemo(
    () =>
      reservations
        .filter(
          (r) =>
            (r.status === "checked-in" ||
              r.status === "departure-expected" ||
              r.status === "arrival-expected") &&
            r.roomNumber,
        )
        .sort((a, b) => (a.roomNumber ?? "").localeCompare(b.roomNumber ?? "")),
    [reservations],
  );

  // Pour chaque réservation, l'invoice associée (la plus récente non annulée).
  const invoiceForReservation = useMemo(() => {
    const m = new Map<string, Invoice>();
    for (const r of activeReservations) {
      const invs = invoices
        .filter((i) => i.reservationId === r.id && i.status !== "void")
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
      if (invs[0]) m.set(r.id, invs[0]);
    }
    return m;
  }, [activeReservations, invoices]);

  const [reservationId, setReservationId] = useState<string>("");
  const [label, setLabel] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const first = activeReservations[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReservationId(first?.id ?? "");
    setLabel(defaultLabel(source));
    setQty("1");
    setPrice(defaultPrice(source));
    setSubmitting(false);
    setErr(null);
  }, [open, source, activeReservations]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source) return;
    const q = Number(qty);
    const p = Number(price);
    if (!reservationId) {
      setErr("Sélectionnez une chambre / réservation.");
      return;
    }
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

    let invoice = invoiceForReservation.get(reservationId);
    setSubmitting(true);
    setErr(null);
    try {
      const reservation = activeReservations.find((r) => r.id === reservationId);
      // S'il n'y a pas encore de folio, on en crée un à la volée pour cette note.
      if (!invoice && reservation) {
        invoice = await repo.invoices.create({
          reservationId: reservation.id,
          guestId: reservation.guestId,
          status: "open",
          items: [],
          payments: [],
        });
      }
      if (!invoice) {
        setErr("Aucun folio ne peut être identifié pour cette réservation.");
        setSubmitting(false);
        return;
      }
      await repo.invoices.addItem(invoice.id, {
        label: label.trim(),
        qty: q,
        unitPriceDA: p,
        totalDA: q * p,
        source,
      });
      onAdded(`${label.trim()} · ${fmtDA(q * p)}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur inconnue");
      setSubmitting(false);
    }
  };

  const sourceLabel = source ? invoiceItemSourceLabels[source] : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={source ? `Note de POS — ${sourceLabel}` : "Note de POS"}
      description="Impute la note sur le folio en cours de la chambre."
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
            form="pos-note-form"
            onClick={onSubmit}
            loading={submitting}
            loadingLabel="Imputation…"
          >
            Imputer sur la chambre
          </Button>
        </>
      }
    >
      <form id="pos-note-form" className="space-y-4" onSubmit={onSubmit}>
        {activeReservations.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-5" />}
            title="Aucune chambre occupée"
            body="Aucune réservation active à imputer. Effectuez d'abord un check-in."
          />
        ) : (
          <>
            <Field label="Chambre / Réservation" htmlFor="pos-reservation" required>
              <Select
                id="pos-reservation"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
              >
                {activeReservations.map((r) => {
                  const g = guestById.get(r.guestId);
                  const name = g ? `${g.firstName} ${g.lastName}` : "Client";
                  return (
                    <option key={r.id} value={r.id}>
                      Ch. {r.roomNumber} · {name} · {r.ref}
                    </option>
                  );
                })}
              </Select>
            </Field>

            <Field label="Source" helper="Pré-remplie depuis la carte sélectionnée.">
              <Input
                value={sourceLabel}
                disabled
                className="tnum"
                readOnly
                aria-readonly
              />
            </Field>

            <Field label="Libellé" htmlFor="pos-label" required>
              <Input
                id="pos-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex : Café crème — service au bar"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantité" htmlFor="pos-qty" required>
                <Input
                  id="pos-qty"
                  type="number"
                  min={1}
                  step={1}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="tnum"
                />
              </Field>
              <Field label="Prix unitaire (DA)" htmlFor="pos-price" required>
                <Input
                  id="pos-price"
                  type="number"
                  min={0}
                  step={50}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="tnum"
                />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] px-3 py-2.5">
              <span className="text-[12.5px] text-[var(--color-admin-muted)]">
                Total ligne
              </span>
              <span className="tnum font-semibold text-[15px] text-[var(--color-admin-text)]">
                {fmtDA(
                  Number.isFinite(Number(qty)) && Number.isFinite(Number(price))
                    ? Number(qty) * Number(price)
                    : 0,
                )}
              </span>
            </div>

            {err ? (
              <p className="text-[12px] text-[var(--color-admin-danger-fg)]" role="alert">
                {err}
              </p>
            ) : null}
          </>
        )}
      </form>
    </Dialog>
  );
}

function defaultLabel(source: PosSource | null): string {
  switch (source) {
    case "pos-restaurant":
      return "Restaurant — service en chambre";
    case "pos-bar":
      return "Bar / Café";
    case "pos-spa":
      return "Bien-être";
    case "extra":
      return "Extra — service en chambre";
    default:
      return "";
  }
}

function defaultPrice(source: PosSource | null): string {
  switch (source) {
    case "pos-restaurant":
      return "2500";
    case "pos-bar":
      return "600";
    case "pos-spa":
      return "0";
    case "extra":
      return "1200";
    default:
      return "";
  }
}
