"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  LogOut,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge, ReservationStatusPill } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { useToast } from "@/components/admin/Toast";

import { fmtDA, fmtDate } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  reservationSourceLabels,
  roomTypeLabels,
  type Guest,
  type Reservation,
} from "@/lib/admin/types";

import { balanceDA, isoDay, nightsBetween } from "../_components/helpers";

export function DepartsClient() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    Promise.all([repo.reservations.list(), repo.guests.list()])
      .then(([r, g]) => {
        if (!mounted) return;
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

  const today = isoDay(new Date());

  const departures = useMemo(
    () =>
      reservations
        .filter((r) => r.checkOut === today)
        .filter(
          (r) =>
            r.status === "departure-expected" ||
            r.status === "checked-in" ||
            r.status === "checked-out",
        )
        .sort((a, b) => a.ref.localeCompare(b.ref)),
    [reservations, today],
  );

  const done = departures.filter((r) => r.status === "checked-out").length;
  const balanceOpen = departures
    .filter((r) => r.status !== "checked-out")
    .reduce((s, r) => s + balanceDA(r), 0);

  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  // ─── Dialog check-out ──────────────────────────────────────────────────
  const [target, setTarget] = useState<Reservation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const closeDialog = () => {
    if (submitting) return;
    setTarget(null);
  };

  const handleCheckOut = async () => {
    if (!target) return;
    setSubmitting(true);
    try {
      await repo.reservations.checkOut(target.id);
      toast.push({
        tone: "ok",
        title: "Départ enregistré",
        body:
          balanceDA(target) > 0
            ? `${target.ref} · solde à régler : ${fmtDA(balanceDA(target))}.`
            : `${target.ref} · folio soldé.`,
      });
      setTarget(null);
    } catch (err) {
      toast.push({
        tone: "danger",
        title: "Check-out impossible",
        body: err instanceof Error ? err.message : "Erreur inconnue.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Colonnes ──────────────────────────────────────────────────────────
  const columns: Column<Reservation>[] = [
    {
      key: "ref",
      header: "Référence",
      cell: (r) => (
        <span className="tnum text-[12.5px] font-medium">{r.ref}</span>
      ),
      width: "w-[150px]",
    },
    {
      key: "guest",
      header: "Client",
      cell: (r) => {
        const g = guestById.get(r.guestId);
        return (
          <AvatarChip
            firstName={g?.firstName}
            lastName={g?.lastName}
            subtitle={`${roomTypeLabels[r.roomType]}${g?.vip ? " · VIP" : ""}`}
          />
        );
      },
    },
    {
      key: "room",
      header: "Chambre",
      cell: (r) =>
        r.roomNumber ? (
          <span className="tnum">{r.roomNumber}</span>
        ) : (
          <span className="text-[12px] text-[var(--color-admin-faint)]">—</span>
        ),
      width: "w-24",
    },
    {
      key: "nights",
      header: "Séjour",
      cell: (r) => (
        <span className="text-[12.5px] text-[var(--color-admin-muted)] tnum">
          {nightsBetween(r.checkIn, r.checkOut)} nuit
          {nightsBetween(r.checkIn, r.checkOut) > 1 ? "s" : ""}
        </span>
      ),
      width: "w-[120px]",
      hideBelow: "md",
    },
    {
      key: "balance",
      header: "Solde",
      cell: (r) => {
        const bal = balanceDA(r);
        return (
          <div className="text-right">
            <div
              className={`tnum text-[13px] font-medium ${bal > 0 ? "text-[var(--color-admin-warn-fg)]" : "text-[var(--color-admin-ok-fg)]"}`}
            >
              {bal > 0 ? fmtDA(bal) : "Soldé"}
            </div>
            <div className="text-[11px] text-[var(--color-admin-muted)] tnum">
              {fmtDA(r.paidDA)} / {fmtDA(r.totalDA)}
            </div>
          </div>
        );
      },
      align: "right",
      width: "w-[150px]",
    },
    {
      key: "source",
      header: "Source",
      cell: (r) => (
        <Badge tone="muted" small>
          {reservationSourceLabels[r.source]}
        </Badge>
      ),
      width: "w-[120px]",
      hideBelow: "lg",
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => <ReservationStatusPill status={r.status} />,
      width: "w-[140px]",
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (r) =>
        r.status === "checked-out" ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-[var(--color-admin-ok-fg)]">
            <CheckCircle2 className="size-3.5" />
            Parti
          </span>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setTarget(r)}
            leftIcon={<LogOut className="size-3.5" />}
          >
            Check-out
          </Button>
        ),
      align: "right",
      width: "w-[130px]",
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Réservations", href: "/admin/reservations" },
          { label: "Départs du jour" },
        ]}
        title="Départs du jour"
        subtitle={`Clôture des séjours du ${fmtDate(today)}. Vérifiez le solde avant de libérer la chambre.`}
        actions={
          <Button
            variant="ghost"
            size="sm"
            href="/admin/reservations"
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Toutes les réservations
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile
          label="Départs prévus"
          value={departures.length}
          helper="aujourd'hui"
          icon={<LogOut className="size-4" />}
        />
        <StatTile
          label="Clôturés"
          value={done}
          helper="chambres libérées"
          icon={<CheckCircle2 className="size-4" />}
          deltaTone="ok"
        />
        <StatTile
          label="Solde à percevoir"
          value={fmtDA(balanceOpen)}
          helper="sur départs en attente"
          icon={<Wallet className="size-4" />}
          deltaTone={balanceOpen > 0 ? "warn" : "ok"}
        />
      </div>

      {error ? (
        <Card>
          <ErrorState
            body={`Impossible de charger les départs. ${error}`}
            onRetry={() => setTick((t) => t + 1)}
          />
        </Card>
      ) : loading ? (
        <Card>
          <LoadingState variant="rows" rows={6} />
        </Card>
      ) : departures.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckCircle2 className="size-5" />}
            title="Aucun départ aujourd'hui"
            body={"Toute la maison reste. Profitez du calme pour vérifier les arrivées de demain."}
            action={
              <Button
                variant="secondary"
                size="sm"
                href="/admin/reservations/arrivees"
              >
                Voir les arrivées
              </Button>
            }
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={departures}
          rowKey={(r) => r.id}
          density="comfortable"
        />
      )}

      <Dialog
        open={!!target}
        onClose={closeDialog}
        title="Confirmer le départ"
        description={
          target
            ? `${target.ref} · chambre ${target.roomNumber ?? "—"}`
            : ""
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closeDialog} disabled={submitting}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCheckOut}
              loading={submitting}
              loadingLabel="Clôture…"
              leftIcon={<LogOut className="size-4" />}
            >
              Confirmer le check-out
            </Button>
          </>
        }
      >
        {target ? (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] p-3 space-y-1">
              <div className="text-[12.5px] font-medium text-[var(--color-admin-text)]">
                {(() => {
                  const g = guestById.get(target.guestId);
                  return g ? `${g.firstName} ${g.lastName}` : "Client inconnu";
                })()}
              </div>
              <div className="text-[11.5px] text-[var(--color-admin-muted)] tnum">
                {fmtDate(target.checkIn)} → {fmtDate(target.checkOut)} ·{" "}
                {nightsBetween(target.checkIn, target.checkOut)} nuit
                {nightsBetween(target.checkIn, target.checkOut) > 1 ? "s" : ""}
              </div>
            </div>

            <div className="rounded-[var(--radius-admin-md)] border border-[var(--color-admin-divider)] p-3 space-y-1.5">
              <div className="flex items-baseline justify-between text-[12.5px]">
                <span className="text-[var(--color-admin-muted)]">Total séjour</span>
                <span className="tnum text-[var(--color-admin-text)]">
                  {fmtDA(target.totalDA)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-[12.5px]">
                <span className="text-[var(--color-admin-muted)]">Déjà versé</span>
                <span className="tnum text-[var(--color-admin-text)]">
                  {fmtDA(target.paidDA)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-[13px] font-medium pt-1.5 border-t border-[var(--color-admin-divider)]">
                <span className="text-[var(--color-admin-text)]">Solde restant</span>
                <span
                  className={`tnum ${balanceDA(target) > 0 ? "text-[var(--color-admin-warn-fg)]" : "text-[var(--color-admin-ok-fg)]"}`}
                >
                  {balanceDA(target) > 0 ? fmtDA(balanceDA(target)) : "Soldé"}
                </span>
              </div>
            </div>

            {balanceDA(target) > 0 ? (
              <div className="flex items-start gap-2 rounded-[var(--radius-admin-md)] bg-[var(--color-admin-warn-bg)] p-3">
                <AlertTriangle className="size-4 mt-0.5 text-[var(--color-admin-warn-fg)] shrink-0" />
                <div className="text-[12.5px] text-[var(--color-admin-warn-fg)]">
                  <p className="font-medium">
                    Solde à percevoir : {fmtDA(balanceDA(target))}.
                  </p>
                  <p className="mt-0.5">
                    Pensez à régler la note avant la clôture. {" "}
                    <Link
                      href="/admin/facturation"
                      className="underline underline-offset-2 inline-flex items-center gap-1 hover:opacity-80"
                    >
                      <CreditCard className="size-3" />
                      Voir la facture
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[12.5px] text-[var(--color-admin-muted)]">
                <Clock className="inline size-3 mr-1 -translate-y-px" />
                La chambre passera en {"« libre à nettoyer »"} après confirmation.
              </p>
            )}
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
