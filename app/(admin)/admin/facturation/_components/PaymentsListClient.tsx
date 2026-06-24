"use client";

import {
  ArrowUpRight,
  BanknoteArrowDown,
  CreditCard,
  Receipt,
  TicketCheck,
  Trophy,
  UserStar,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge } from "@/components/admin/Badge";
import { Card } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { FilterChip, Toolbar } from "@/components/admin/Toolbar";

import { fmtDA, fmtDateTime } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  paymentMethodLabels,
  type Guest,
  type Invoice,
  type Payment,
  type PaymentMethod,
  type Staff,
} from "@/lib/admin/types";

import {
  byReceivedDesc,
  firstOfMonthIso,
  firstOfNextMonthIso,
  isToday,
  paymentMethodTone,
} from "./helpers";

type RowPayment = Payment & { invoice: Invoice };

type PeriodFilter = "all" | "today" | "month";

const PERIODS: Array<{ id: PeriodFilter; label: string }> = [
  { id: "all", label: "Toutes périodes" },
  { id: "today", label: "Aujourd'hui" },
  { id: "month", label: "Ce mois" },
];

export function PaymentsListClient() {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([repo.invoices.list(), repo.guests.list(), repo.staff.list()])
      .then(([i, g, s]) => {
        if (!mounted) return;
        setInvoices(i);
        setGuests(g);
        setStaff(s);
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

  const staffById = useMemo(() => {
    const m = new Map<string, Staff>();
    for (const s of staff) m.set(s.id, s);
    return m;
  }, [staff]);

  const allPayments = useMemo<RowPayment[]>(
    () =>
      invoices.flatMap((inv) =>
        inv.payments.map((p) => ({ ...p, invoice: inv })),
      ),
    [invoices],
  );

  const [search, setSearch] = useState("");
  const [activeMethods, setActiveMethods] = useState<Set<PaymentMethod>>(
    () => new Set(),
  );
  const [cashier, setCashier] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");

  const toggleMethod = (m: PaymentMethod) =>
    setActiveMethods((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const monthStart = firstOfMonthIso();
    const monthEnd = firstOfNextMonthIso();
    return allPayments
      .filter((p) => {
        if (activeMethods.size > 0 && !activeMethods.has(p.method)) return false;
        if (cashier !== "all" && p.takenBy !== cashier) return false;
        if (period === "today" && !isToday(p.receivedAt)) return false;
        if (period === "month") {
          const day = p.receivedAt.slice(0, 10);
          if (day < monthStart || day >= monthEnd) return false;
        }
        if (q) {
          const g = guestById.get(p.invoice.guestId);
          const haystack = [
            p.invoice.ref,
            g ? `${g.firstName} ${g.lastName}` : "",
            g?.email ?? "",
            p.note ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(byReceivedDesc);
  }, [allPayments, search, activeMethods, cashier, period, guestById]);

  // ─── KPIs ─────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const monthStart = firstOfMonthIso();
    const monthEnd = firstOfNextMonthIso();
    const todayPayments = allPayments.filter((p) => isToday(p.receivedAt));
    const monthPayments = allPayments.filter((p) => {
      const day = p.receivedAt.slice(0, 10);
      return day >= monthStart && day < monthEnd;
    });
    const cashedToday = todayPayments.reduce((s, p) => s + p.amountDA, 0);
    const cashedMonth = monthPayments.reduce((s, p) => s + p.amountDA, 0);

    const byMethod = new Map<PaymentMethod, number>();
    for (const p of monthPayments) {
      byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amountDA);
    }
    let topMethod: { method: PaymentMethod; total: number } | null = null;
    for (const [m, total] of byMethod) {
      if (!topMethod || total > topMethod.total) topMethod = { method: m, total };
    }

    const byCashier = new Map<string, number>();
    for (const p of todayPayments) {
      byCashier.set(p.takenBy, (byCashier.get(p.takenBy) ?? 0) + p.amountDA);
    }
    let topCashier: { staffId: string; total: number } | null = null;
    for (const [id, total] of byCashier) {
      if (!topCashier || total > topCashier.total) topCashier = { staffId: id, total };
    }

    return { cashedToday, cashedMonth, topMethod, topCashier };
  }, [allPayments]);

  const columns: Column<RowPayment>[] = [
    {
      key: "date",
      header: "Date",
      cell: (p) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtDateTime(p.receivedAt)}
        </span>
      ),
      width: "w-[170px]",
      sortable: true,
      sortFn: (a, b) => a.receivedAt.localeCompare(b.receivedAt),
    },
    {
      key: "invoice",
      header: "Facture",
      cell: (p) => (
        <Link
          href={`/admin/facturation/${p.invoice.id}`}
          className="tnum text-[12.5px] font-medium text-[var(--color-admin-text)] hover:text-marine underline-offset-2 hover:underline"
        >
          {p.invoice.ref}
        </Link>
      ),
      width: "w-[140px]",
    },
    {
      key: "client",
      header: "Client",
      cell: (p) => {
        const g = guestById.get(p.invoice.guestId);
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
      sortable: true,
      sortFn: (a, b) => a.amountDA - b.amountDA,
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
      hideBelow: "md",
    },
  ];

  const cashiers = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPayments) set.add(p.takenBy);
    return Array.from(set)
      .map((id) => staffById.get(id))
      .filter((s): s is Staff => Boolean(s))
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      );
  }, [allPayments, staffById]);

  const topMethodLabel = kpis.topMethod ? paymentMethodLabels[kpis.topMethod.method] : "—";
  const topCashierStaff = kpis.topCashier
    ? staffById.get(kpis.topCashier.staffId)
    : null;
  const topCashierLabel = topCashierStaff
    ? `${topCashierStaff.firstName} ${topCashierStaff.lastName}`
    : "—";

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Facturation", href: "/admin/facturation" }, { label: "Paiements" }]}
        title="Paiements"
        subtitle="Vue globale des encaissements — toutes méthodes, tous folios."
      />

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Encaissé aujourd'hui"
          value={fmtDA(kpis.cashedToday)}
          helper="Tous folios confondus"
          icon={<Wallet className="size-4" />}
        />
        <StatTile
          label="Encaissé ce mois"
          value={fmtDA(kpis.cashedMonth)}
          helper="Cumul du mois en cours"
          icon={<BanknoteArrowDown className="size-4" />}
        />
        <StatTile
          label="Méthode dominante"
          value={topMethodLabel}
          helper={kpis.topMethod ? fmtDA(kpis.topMethod.total) : "Aucun paiement ce mois"}
          icon={<Trophy className="size-4" />}
        />
        <StatTile
          label="Caissier du jour"
          value={topCashierLabel}
          helper={kpis.topCashier ? fmtDA(kpis.topCashier.total) : "Aucun encaissement ce jour"}
          icon={<UserStar className="size-4" />}
        />
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher par référence, client, note…"
        filters={
          <>
            {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((m) => (
              <FilterChip
                key={m}
                label={paymentMethodLabels[m]}
                active={activeMethods.has(m)}
                onClick={() => toggleMethod(m)}
                onClear={() => toggleMethod(m)}
              />
            ))}
          </>
        }
        trailing={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={cashier}
              onChange={(e) => setCashier(e.target.value)}
              className="h-9 cursor-pointer appearance-none rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] pl-3 pr-8 text-[16px] md:text-[12.5px] text-[var(--color-admin-text)] outline-none transition-shadow duration-150 focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)]"
              aria-label="Filtrer par caissier"
            >
              <option value="all">Tous les caissiers</option>
              {cashiers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              className="h-9 cursor-pointer appearance-none rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] pl-3 pr-8 text-[16px] md:text-[12.5px] text-[var(--color-admin-text)] outline-none transition-shadow duration-150 focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)]"
              aria-label="Filtrer par période"
            >
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {error ? (
        <Card>
          <ErrorState
            body={`Impossible de charger les paiements. ${error}`}
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
            title="Aucun paiement ne correspond"
            body={"Ajustez la recherche ou les filtres pour élargir la sélection."}
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          density="comfortable"
        />
      )}

      <p className="text-center text-[11px] text-[var(--color-admin-faint)] pt-2">
        <Link
          href="/admin/facturation"
          className="hover:text-[var(--color-admin-text)] transition-colors inline-flex items-center gap-1"
        >
          <ArrowUpRight className="size-3" />
          Retour aux factures
        </Link>
      </p>
    </>
  );
}

function methodIcon(m: PaymentMethod) {
  if (m === "cash") return <BanknoteArrowDown className="size-3" />;
  if (m === "card") return <CreditCard className="size-3" />;
  if (m === "transfer") return <ArrowUpRight className="size-3" />;
  return <TicketCheck className="size-3" />;
}
