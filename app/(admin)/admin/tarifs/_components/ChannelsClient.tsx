"use client";

import {
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  Globe2,
  Loader2,
  Percent,
  RefreshCw,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { useToast } from "@/components/admin/Toast";
import { Switch } from "@/components/admin/form";
import type { Tone } from "@/components/admin/tone";

import { fmtNumber, fmtPct, fmtRelative } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  type Channel,
  type ChannelStatus,
  type Reservation,
  type ReservationSource,
  channelStatusLabels,
} from "@/lib/admin/types";

const channelStatusTone: Record<ChannelStatus, Tone> = {
  synced: "ok",
  syncing: "info",
  warn: "warn",
  error: "danger",
  off: "muted",
};

/** Mapping channel.id → ReservationSource pour l'agrégation. */
const channelIdToSource: Record<string, ReservationSource> = {
  ch_booking: "booking-com",
  ch_expedia: "expedia",
  ch_airbnb: "partner", // pas de seed Airbnb dans les réservations
  ch_direct: "direct",
};

export function ChannelsClient() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Fenêtre temporelle stable pour les agrégations « 30 derniers jours ». On
  // capture le timestamp au moment du fetch — pas dans le rendu — pour
  // satisfaire `react-hooks/purity`.
  const [windowStart, setWindowStart] = useState<number>(() => 0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadError(null);
    setWindowStart(Date.now() - 30 * 86_400_000);
    Promise.all([repo.channels.list(), repo.reservations.list()])
      .then(([c, r]) => {
        if (cancelled) return;
        setChannels(c);
        setReservations(r);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("Impossible de charger les canaux de distribution.");
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // ─── Suivi local des canaux en cours de synchronisation ─────────────
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

  const onToggle = async (c: Channel, next: boolean) => {
    await repo.channels.setEnabled(c.id, next);
    toast.push({
      tone: next ? "ok" : "muted",
      title: next ? "Canal activé" : "Canal désactivé",
      body: c.name,
    });
  };

  const onSync = async (c: Channel) => {
    setSyncing((curr) => new Set(curr).add(c.id));
    try {
      await repo.channels.sync(c.id);
      toast.push({
        tone: "ok",
        title: "Synchronisation terminée",
        body: c.name,
      });
    } finally {
      setSyncing((curr) => {
        const next = new Set(curr);
        next.delete(c.id);
        return next;
      });
    }
  };

  // ─── KPIs ────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const all = channels ?? [];
    const active = all.filter((c) => c.enabled);
    const totalSynced = active.reduce((s, c) => s + c.inventorySynced, 0);
    const totalCapacity = active.reduce((s, c) => s + c.totalInventory, 0);
    const coverage =
      totalCapacity === 0 ? 0 : Math.round((totalSynced / totalCapacity) * 100);
    // Commission moyenne pondérée par inventaire synchronisé.
    let weightedSum = 0;
    let weight = 0;
    for (const c of active) {
      if (c.inventorySynced > 0) {
        weightedSum += c.commissionPct * c.inventorySynced;
        weight += c.inventorySynced;
      }
    }
    const avgCommission = weight === 0 ? 0 : weightedSum / weight;
    return {
      activeCount: active.length,
      totalSynced,
      coverage,
      avgCommission,
    };
  }, [channels]);

  // ─── Réservations par canal (30 derniers jours) ─────────────────────
  const perChannel = useMemo(() => {
    const all = channels ?? [];
    const recent =
      windowStart === 0
        ? reservations
        : reservations.filter(
            (r) => new Date(r.createdAt).getTime() >= windowStart,
          );
    const counts: Array<{ channel: Channel; count: number; pct: number }> = [];
    let max = 0;
    for (const c of all) {
      const src = channelIdToSource[c.id];
      const count = src ? recent.filter((r) => r.source === src).length : 0;
      counts.push({ channel: c, count, pct: 0 });
      if (count > max) max = count;
    }
    for (const item of counts) {
      item.pct = max === 0 ? 0 : (item.count / max) * 100;
    }
    return counts.sort((a, b) => b.count - a.count);
  }, [channels, reservations, windowStart]);

  // ─── Risques de double-booking ───────────────────────────────────────
  const risks = useMemo(() => {
    const all = channels ?? [];
    return all.filter(
      (c) =>
        c.enabled &&
        c.status === "warn" &&
        c.inventorySynced < c.totalInventory,
    );
  }, [channels]);

  // ─── Rendu ───────────────────────────────────────────────────────────
  const renderBody = () => {
    if (loadError) {
      return <ErrorState body={loadError} onRetry={() => setTick((t) => t + 1)} />;
    }
    if (channels === null) {
      return (
        <>
          <LoadingState variant="kpis" />
          <LoadingState variant="cards" />
        </>
      );
    }
    if (channels.length === 0) {
      return (
        <Card>
          <EmptyState
            icon={<Globe2 className="size-5" />}
            title="Aucun canal configuré"
            body="Connectez votre premier canal de distribution pour ouvrir l'inventaire à la vente."
          />
        </Card>
      );
    }
    return (
      <>
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Canaux actifs"
            value={kpis.activeCount}
            helper={`sur ${channels.length} configurés`}
            icon={<Wifi className="size-4" />}
          />
          <StatTile
            label="Chambres synchronisées"
            value={fmtNumber(kpis.totalSynced)}
            helper="cumul des canaux actifs"
            icon={<Globe2 className="size-4" />}
          />
          <StatTile
            label="Taux de couverture"
            value={`${kpis.coverage} %`}
            helper="part de l'inventaire diffusé"
            deltaTone={kpis.coverage < 80 ? "warn" : "ok"}
            delta={kpis.coverage < 80 ? `${kpis.coverage} %` : "—"}
            deltaLabel={kpis.coverage < 80 ? "à améliorer" : undefined}
            icon={<BarChart3 className="size-4" />}
          />
          <StatTile
            label="Commission moyenne"
            value={fmtPct(kpis.avgCommission, 1)}
            helper="pondérée par inventaire"
            icon={<Percent className="size-4" />}
          />
        </div>

        {/* Cartes canaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((c) => (
            <ChannelCard
              key={c.id}
              channel={c}
              syncing={syncing.has(c.id)}
              onToggle={onToggle}
              onSync={onSync}
            />
          ))}
        </div>

        {/* Réservations par canal */}
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <BarChart3 className="size-4 text-marine" />
                {"Réservations par canal — 30 derniers jours"}
              </span>
            }
            subtitle="Volume relatif depuis chaque source de distribution."
          />
          <CardBody>
            {perChannel.every((p) => p.count === 0) ? (
              <EmptyState
                title="Aucune réservation récente"
                body="Aucun canal n'a généré de réservation sur les 30 derniers jours."
              />
            ) : (
              <ul className="space-y-3">
                {perChannel.map(({ channel, count, pct }) => (
                  <li key={channel.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <ChannelBadge name={channel.name} />
                        <span className="truncate text-[13px] font-medium text-[var(--color-admin-text)]">
                          {channel.name}
                        </span>
                        {!channel.enabled ? (
                          <Badge tone="muted" small>
                            {channelStatusLabels.off}
                          </Badge>
                        ) : null}
                      </span>
                      <span className="tnum text-[12.5px] font-medium text-[var(--color-admin-text)]">
                        {fmtNumber(count)} {count > 1 ? "réservations" : "réservation"}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--color-admin-sunken)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-marine transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Risques double-booking */}
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <ShieldAlert className="size-4 text-marine" />
                Risques double-booking
              </span>
            }
            subtitle="Conflits d'inventaire entre canaux actifs."
          />
          {risks.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-5" />}
              tone="ok"
              title="Aucun conflit détecté"
              body="Tous les canaux actifs partagent un inventaire cohérent."
            />
          ) : (
            <CardBody padded={false}>
              <ul className="divide-y divide-[var(--color-admin-divider)]">
                {risks.map((c) => {
                  const gap = c.totalInventory - c.inventorySynced;
                  return (
                    <li
                      key={c.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-admin-warn-bg)] text-[var(--color-admin-warn-fg)]">
                          <AlertOctagon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-medium text-[var(--color-admin-text)]">
                            {c.name}
                            <span className="ml-2 tnum text-[12px] text-[var(--color-admin-muted)]">
                              {fmtNumber(gap)} {gap > 1 ? "chambres" : "chambre"} en écart
                            </span>
                          </p>
                          <p className="mt-0.5 text-[12.5px] text-[var(--color-admin-muted)]">
                            {c.statusMessage ??
                              "L'inventaire diffère de la grille interne — forcez une synchronisation."}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<RefreshCw className="size-3.5" />}
                        loading={syncing.has(c.id)}
                        loadingLabel="Synchronisation…"
                        onClick={() => void onSync(c)}
                      >
                        Forcer la sync
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          )}
        </Card>
      </>
    );
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Tarifs", href: "/admin/tarifs" },
          { label: "Canaux de distribution" },
        ]}
        title="Canaux de distribution"
        subtitle="Diffusion de l'inventaire vers les OTA et le site direct."
      />
      {renderBody()}
    </>
  );
}

// ─── Carte canal ─────────────────────────────────────────────────────

function ChannelCard({
  channel,
  syncing,
  onToggle,
  onSync,
}: {
  channel: Channel;
  syncing: boolean;
  onToggle: (c: Channel, next: boolean) => void;
  onSync: (c: Channel) => void;
}) {
  const coverage =
    channel.totalInventory === 0
      ? 0
      : Math.round((channel.inventorySynced / channel.totalInventory) * 100);
  const showWarning = channel.status === "warn" || channel.status === "error";

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-3 min-w-0">
          <ChannelBadge name={channel.name} large />
          <div className="min-w-0">
            <p className="font-display text-[16px] leading-5 tracking-tight text-[var(--color-admin-text)] truncate">
              {channel.name}
            </p>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-admin-muted)]">
              {channel.lastSyncedAt
                ? `Dernière sync ${fmtRelative(channel.lastSyncedAt)}`
                : "Jamais synchronisé"}
            </p>
          </div>
        </div>
        <Badge tone={channelStatusTone[channel.status]} small>
          {channel.status === "syncing" ? (
            <Loader2 className="size-3 animate-spin" aria-hidden />
          ) : null}
          {channelStatusLabels[channel.status]}
        </Badge>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <InlineStat
          label="Inventaire"
          value={
            <span className="tnum">
              {fmtNumber(channel.inventorySynced)}{" "}
              <span className="text-[var(--color-admin-faint)]">/ {fmtNumber(channel.totalInventory)}</span>
            </span>
          }
          helper={`${coverage} % de couverture`}
        />
        <InlineStat
          label="Commission"
          value={<span className="tnum">{fmtPct(channel.commissionPct, 0)}</span>}
          helper={channel.commissionPct === 0 ? "sans intermédiaire" : "par réservation"}
        />
      </div>

      {showWarning && channel.statusMessage ? (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-md bg-[var(--color-admin-warn-bg)]/60 px-3 py-2 text-[12.5px] text-[var(--color-admin-warn-fg)]">
          <AlertOctagon className="size-3.5 mt-0.5 shrink-0" aria-hidden />
          <span>{channel.statusMessage}</span>
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--color-admin-divider)] bg-[var(--color-admin-sunken)]/40 rounded-b-xl">
        <span className="inline-flex items-center gap-2">
          <Switch
            checked={channel.enabled}
            onChange={(next) => onToggle(channel, next)}
            label={channel.enabled ? "Désactiver" : "Activer"}
          />
          <span className="text-[12.5px] text-[var(--color-admin-text)]">
            {channel.enabled ? "Activé" : "Désactivé"}
          </span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="size-3.5" />}
          onClick={() => onSync(channel)}
          loading={syncing}
          loadingLabel="Synchronisation…"
          disabled={!channel.enabled}
        >
          Synchroniser maintenant
        </Button>
      </div>
    </Card>
  );
}

// ─── Stat inline (variante compacte du StatTile pour CanalCard) ──────

function InlineStat({
  label,
  value,
  helper,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  helper?: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-[var(--color-admin-sunken)]/50 px-3 py-2">
      <p className="text-[10.5px] uppercase tracking-[0.08em] font-medium text-[var(--color-admin-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[14px] font-medium text-[var(--color-admin-text)]">
        {value}
      </p>
      {helper ? (
        <p className="mt-0.5 text-[11px] text-[var(--color-admin-muted)]">{helper}</p>
      ) : null}
    </div>
  );
}

// ─── Badge canal (avatar à initiales) ────────────────────────────────

function ChannelBadge({ name, large }: { name: string; large?: boolean }) {
  // Initiales : 1re lettre du 1er mot, 1re lettre du dernier mot si différent.
  const words = name.split(/\s|\./).filter(Boolean);
  let init = words[0]?.[0] ?? "?";
  if (words.length > 1) init += words[words.length - 1][0];
  init = init.toUpperCase();
  // Couleur déterministe basée sur le nom — palette interne (marine + complémentaires).
  const palette = [
    "bg-[var(--color-admin-info-bg)] text-[var(--color-admin-info-fg)]",
    "bg-[var(--color-admin-violet-bg)] text-[var(--color-admin-violet-fg)]",
    "bg-[var(--color-admin-amber-bg)] text-[var(--color-admin-amber-fg)]",
    "bg-[var(--color-admin-ok-bg)] text-[var(--color-admin-ok-fg)]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const cls = palette[Math.abs(hash) % palette.length];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-display font-medium tracking-tight ${cls} ${
        large ? "size-10 text-[14px]" : "size-7 text-[10.5px]"
      }`}
      aria-label={`Logo ${name}`}
    >
      {init}
    </span>
  );
}

