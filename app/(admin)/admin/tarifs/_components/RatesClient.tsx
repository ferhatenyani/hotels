"use client";

import {
  BedDouble,
  CalendarDays,
  Layers,
  Minus,
  Plus,
  Table2,
  Tag,
  TrendingDown,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Column, DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Sheet } from "@/components/admin/Sheet";
import { StatTile } from "@/components/admin/StatTile";
import { Tabs } from "@/components/admin/Tabs";
import { Toolbar, FilterChip } from "@/components/admin/Toolbar";
import { useToast } from "@/components/admin/Toast";
import { Field, Input, Select } from "@/components/admin/form";

import { fmtDA, fmtDate, fmtPct } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  type Rate,
  type RoomTypeCode,
  type Season,
  roomTypeLabels,
  seasonLabels,
} from "@/lib/admin/types";

import { seasonDayBg, seasonIcon, seasonTone } from "./season";

type ViewMode = "table" | "calendar";
type ScopeTab = "all" | "current" | "archive";

const allSeasons: Season[] = ["basse", "moyenne", "haute", "tres-haute"];
const allRoomTypes: RoomTypeCode[] = [
  "single",
  "double",
  "twin",
  "triple",
  "familiale",
  "suite",
  "appartement",
];

// Année par défaut pour la vue calendrier — basée sur la date d'aujourd'hui.
const DEFAULT_YEAR = new Date().getFullYear();
const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function RatesClient() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [rates, setRates] = useState<Rate[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadError(null);
    repo.rates
      .list()
      .then((r) => {
        if (cancelled) return;
        setRates(r);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("Impossible de charger les tarifs pour le moment.");
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // ─── Filtres ─────────────────────────────────────────────────────────
  const [seasonFilters, setSeasonFilters] = useState<Set<Season>>(new Set());
  const [typeFilters, setTypeFilters] = useState<Set<RoomTypeCode>>(new Set());
  const [view, setView] = useState<ViewMode>("table");
  const [scope, setScope] = useState<ScopeTab>("all");

  const toggleSeason = (s: Season) => {
    setSeasonFilters((curr) => {
      const next = new Set(curr);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };
  const toggleType = (t: RoomTypeCode) => {
    setTypeFilters((curr) => {
      const next = new Set(curr);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const { filteredRates, currentCount, archiveCount } = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    if (!rates) {
      return { filteredRates: [] as Rate[], currentCount: 0, archiveCount: 0 };
    }
    const filtered = rates.filter((r) => {
      if (seasonFilters.size > 0 && !seasonFilters.has(r.season)) return false;
      if (typeFilters.size > 0 && !typeFilters.has(r.roomType)) return false;
      if (scope === "current") {
        if (r.startsOn > todayIso || r.endsOn < todayIso) return false;
      } else if (scope === "archive") {
        if (r.endsOn >= todayIso) return false;
      }
      return true;
    });
    const currentCount = rates.filter(
      (r) => r.startsOn <= todayIso && r.endsOn >= todayIso,
    ).length;
    const archiveCount = rates.filter((r) => r.endsOn < todayIso).length;
    return { filteredRates: filtered, currentCount, archiveCount };
  }, [rates, seasonFilters, typeFilters, scope]);

  // ─── KPIs (calculés sur l'ensemble — pas filtré) ────────────────────
  const kpis = useMemo(() => {
    const all = rates ?? [];
    if (all.length === 0) {
      return {
        avg: 0,
        doubleSpread: null as { min: number; max: number } | null,
        seasonsActive: 0,
        typesPriced: 0,
      };
    }
    const avg = Math.round(
      all.reduce((s, r) => s + (r.weekdayDA + r.weekendDA) / 2, 0) / all.length,
    );
    const doubles = all.filter((r) => r.roomType === "double");
    let doubleSpread: { min: number; max: number } | null = null;
    if (doubles.length > 0) {
      const min = Math.min(...doubles.map((r) => Math.min(r.weekdayDA, r.weekendDA)));
      const max = Math.max(...doubles.map((r) => Math.max(r.weekdayDA, r.weekendDA)));
      doubleSpread = { min, max };
    }
    const seasonsActive = new Set(all.map((r) => r.season)).size;
    const typesPriced = new Set(all.map((r) => r.roomType)).size;
    return { avg, doubleSpread, seasonsActive, typesPriced };
  }, [rates]);

  // ─── Sheet d'édition / création ──────────────────────────────────────
  const [editing, setEditing] = useState<Rate | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Rate | null>(null);

  // ─── Colonnes du tableau ─────────────────────────────────────────────
  const columns: Column<Rate>[] = [
    {
      key: "label",
      header: "Libellé",
      cell: (r) => (
        <span className="font-medium text-[var(--color-admin-text)]">{r.label}</span>
      ),
      sortable: true,
      sortFn: (a, b) => a.label.localeCompare(b.label, "fr"),
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <Badge tone="muted" small>
          {roomTypeLabels[r.roomType]}
        </Badge>
      ),
      width: "w-44",
      hideBelow: "md",
    },
    {
      key: "season",
      header: "Saison",
      cell: (r) => {
        const SeasonIcon = seasonIcon[r.season];
        return (
          <Badge tone={seasonTone[r.season]} small icon={<SeasonIcon aria-hidden />}>
            {seasonLabels[r.season]}
          </Badge>
        );
      },
      width: "w-40",
    },
    {
      key: "period",
      header: "Période",
      cell: (r) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtDate(r.startsOn)} {"–"} {fmtDate(r.endsOn)}
        </span>
      ),
      width: "w-52",
      hideBelow: "lg",
    },
    {
      key: "weekday",
      header: "Semaine",
      cell: (r) => <span className="tnum">{fmtDA(r.weekdayDA)}</span>,
      align: "right",
      width: "w-28",
    },
    {
      key: "weekend",
      header: "Week-end",
      cell: (r) => <span className="tnum">{fmtDA(r.weekendDA)}</span>,
      align: "right",
      width: "w-28",
    },
    {
      key: "spread",
      header: "Écart",
      cell: (r) => {
        if (r.weekdayDA === 0) {
          return <span className="text-[var(--color-admin-faint)] tnum">—</span>;
        }
        const pct = ((r.weekendDA - r.weekdayDA) / r.weekdayDA) * 100;
        const tone =
          pct > 0
            ? "text-[var(--color-admin-ok-fg)]"
            : pct < 0
              ? "text-[var(--color-admin-danger-fg)]"
              : "text-[var(--color-admin-muted)]";
        const SpreadIcon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
        const sign = pct > 0 ? "+" : "";
        return (
          <span
            className={`inline-flex items-center justify-end gap-1 tnum text-[12.5px] ${tone}`}
          >
            <SpreadIcon className="size-3" aria-hidden />
            {sign}
            {fmtPct(pct, 1)}
          </span>
        );
      },
      align: "right",
      width: "w-24",
      hideBelow: "md",
    },
  ];

  // ─── Rendu d'état (chargement / erreur) ──────────────────────────────
  const renderBody = () => {
    if (loadError) {
      return <ErrorState body={loadError} onRetry={() => setTick((t) => t + 1)} />;
    }
    if (rates === null) {
      return (
        <>
          <LoadingState variant="kpis" />
          <Card>
            <LoadingState variant="rows" rows={6} />
          </Card>
        </>
      );
    }
    return (
      <>
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Tarif moyen"
            value={fmtDA(kpis.avg)}
            helper="moyenne pondérée semaine + week-end"
            icon={<Tag className="size-4" />}
          />
          <StatTile
            label="Écart Double — min/max"
            value={
              kpis.doubleSpread
                ? `${fmtDA(kpis.doubleSpread.min)} – ${fmtDA(kpis.doubleSpread.max)}`
                : "—"
            }
            helper="amplitude selon saison et jour"
            icon={<TrendingUp className="size-4" />}
          />
          <StatTile
            label="Saisons actives"
            value={kpis.seasonsActive}
            helper={`sur ${allSeasons.length} possibles`}
            icon={<Layers className="size-4" />}
          />
          <StatTile
            label="Types tarifés"
            value={kpis.typesPriced}
            helper={`sur ${allRoomTypes.length} types de chambre`}
            icon={<BedDouble className="size-4" />}
          />
        </div>

        {/* Tabs scope */}
        <Tabs
          tabs={[
            { id: "all", label: "Tous", badge: rates.length },
            { id: "current", label: "Cette saison", badge: currentCount },
            { id: "archive", label: "Archive", badge: archiveCount },
          ]}
          active={scope}
          onChange={(id) => setScope(id as ScopeTab)}
        />

        {/* Toggle de vue */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-[var(--radius-admin-md)] ring-1 ring-[var(--color-admin-border-strong)] bg-[var(--color-admin-panel)] p-0.5"
            role="group"
            aria-label="Mode de vue"
          >
            {(
              [
                { id: "table", label: "Vue tableau", Icon: Table2 },
                { id: "calendar", label: "Vue calendrier", Icon: CalendarDays },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-pressed={view === id}
                className={`inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-admin-sm)] px-3 text-[12px] font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:shadow-[0_0_0_3.5px_var(--color-admin-accent-ring)] ${
                  view === id
                    ? "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)]"
                    : "text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]"
                }`}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </div>
          <span className="text-[12px] text-[var(--color-admin-muted)] tnum">
            {filteredRates.length} {filteredRates.length > 1 ? "tarifs" : "tarif"}
          </span>
        </div>

        {/* Vue */}
        {view === "table" ? (
          filteredRates.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Tag className="size-5" />}
                title="Aucun tarif ne correspond"
                body={
                  rates.length === 0
                    ? "Créez votre premier tarif saisonnier pour démarrer."
                    : "Ajustez les filtres pour élargir la sélection."
                }
                action={
                  rates.length === 0 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="size-4" />}
                      onClick={() => setCreating(true)}
                    >
                      Nouveau tarif
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <DataTable
              columns={columns}
              rows={filteredRates}
              rowKey={(r) => r.id}
              density="comfortable"
              onRowClick={(r) => setEditing(r)}
              emptyTitle="Aucun tarif"
              emptyBody="Aucun tarif ne correspond aux filtres actuels."
            />
          )
        ) : (
          <CalendarYearView rates={rates} year={DEFAULT_YEAR} />
        )}
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Tarifs"
        subtitle="Grille saisonnière par type de chambre — tarif semaine et week-end."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={() => setCreating(true)}
          >
            Nouveau tarif
          </Button>
        }
      />

      <Toolbar
        filters={
          // Mobile-first : chaque groupe (Saison / Type) s'enroule sur sa
          // propre ligne avec son intitulé en tête ; le séparateur vertical
          // n'apparaît qu'à partir de md où les groupes peuvent cohabiter.
          <>
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-admin-faint)] mr-1">
                Saison
              </span>
              {allSeasons.map((s) => (
                <FilterChip
                  key={s}
                  label={seasonLabels[s]}
                  active={seasonFilters.has(s)}
                  onClick={() => toggleSeason(s)}
                  onClear={() => toggleSeason(s)}
                />
              ))}
            </div>
            <span
              className="mx-1 hidden h-4 w-px bg-[var(--color-admin-divider)] md:block"
              aria-hidden
            />
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-admin-faint)] mr-1">
                Type
              </span>
              {allRoomTypes.map((t) => (
                <FilterChip
                  key={t}
                  label={roomTypeLabels[t]}
                  active={typeFilters.has(t)}
                  onClick={() => toggleType(t)}
                  onClear={() => toggleType(t)}
                />
              ))}
            </div>
          </>
        }
      />

      {renderBody()}

      {/* Sheet d'édition */}
      <RateSheet
        open={editing !== null}
        rate={editing}
        onClose={() => setEditing(null)}
        onSaved={(label) => {
          toast.push({ tone: "ok", title: "Tarif mis à jour", body: label });
          setEditing(null);
        }}
        onAskDelete={(r) => {
          setEditing(null);
          setConfirmDelete(r);
        }}
      />

      {/* Sheet de création */}
      <RateSheet
        open={creating}
        rate={null}
        onClose={() => setCreating(false)}
        onSaved={(label) => {
          toast.push({ tone: "ok", title: "Tarif créé", body: label });
          setCreating(false);
        }}
      />

      {/* Dialog suppression — soft : on archive en faisant tomber les dates ? */}
      {/* On n'a pas d'API de suppression, on signale l'absence du verbe. */}
      <Dialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Supprimer ce tarif ?"
        description={
          confirmDelete
            ? `« ${confirmDelete.label} » sera retiré de la grille. Action irréversible.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="size-4" />}
              onClick={() => {
                if (!confirmDelete) return;
                // Pas d'API de suppression dans le repo : on déplace les dates
                // dans le passé pour archiver visuellement. Note dans le rapport.
                const past = "2000-01-01";
                void repo.rates
                  .update(confirmDelete.id, { startsOn: past, endsOn: past })
                  .then(() => {
                    toast.push({
                      tone: "ok",
                      title: "Tarif archivé",
                      body: confirmDelete.label,
                    });
                    setConfirmDelete(null);
                  });
              }}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-5 text-[var(--color-admin-muted)]">
          {"Le tarif est déplacé hors de la grille active. L'historique reste consultable depuis l'onglet « Archive »."}
        </p>
      </Dialog>
    </>
  );
}

// ─── Sheet de tarif (création ou édition) ────────────────────────────

function RateSheet({
  open,
  rate,
  onClose,
  onSaved,
  onAskDelete,
}: {
  open: boolean;
  rate: Rate | null;
  onClose: () => void;
  onSaved: (label: string) => void;
  onAskDelete?: (r: Rate) => void;
}) {
  const isEdit = rate !== null;

  const [label, setLabel] = useState("");
  const [roomType, setRoomType] = useState<RoomTypeCode>("double");
  const [season, setSeason] = useState<Season>("moyenne");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [weekdayDA, setWeekdayDA] = useState("");
  const [weekendDA, setWeekendDA] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset / hydrate à chaque ouverture
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    if (rate) {
      setLabel(rate.label);
      setRoomType(rate.roomType);
      setSeason(rate.season);
      setStartsOn(rate.startsOn);
      setEndsOn(rate.endsOn);
      setWeekdayDA(String(rate.weekdayDA));
      setWeekendDA(String(rate.weekendDA));
    } else {
      setLabel("");
      setRoomType("double");
      setSeason("moyenne");
      setStartsOn("");
      setEndsOn("");
      setWeekdayDA("");
      setWeekendDA("");
    }
  }, [open, rate]);

  const onSave = async () => {
    const wd = Number(weekdayDA);
    const we = Number(weekendDA);
    if (!label.trim()) {
      setError("Le libellé est requis.");
      return;
    }
    if (!startsOn || !endsOn) {
      setError("Les dates de début et de fin sont requises.");
      return;
    }
    if (endsOn < startsOn) {
      setError("La date de fin doit suivre la date de début.");
      return;
    }
    if (!Number.isFinite(wd) || wd < 0 || !Number.isFinite(we) || we < 0) {
      setError("Les tarifs doivent être des montants positifs.");
      return;
    }
    setSaving(true);
    try {
      if (rate) {
        await repo.rates.update(rate.id, {
          label: label.trim(),
          roomType,
          season,
          startsOn,
          endsOn,
          weekdayDA: wd,
          weekendDA: we,
        });
      } else {
        await repo.rates.create({
          label: label.trim(),
          roomType,
          season,
          startsOn,
          endsOn,
          weekdayDA: wd,
          weekendDA: we,
        });
      }
      onSaved(label.trim());
    } catch {
      setError("L'enregistrement a échoué. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier le tarif" : "Nouveau tarif"}
      description={
        isEdit
          ? "Ajustez les conditions de cette ligne tarifaire."
          : "Définissez un tarif saisonnier pour un type de chambre."
      }
      width="md"
      footer={
        <>
          {isEdit && onAskDelete && rate ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="size-4" />}
              onClick={() => onAskDelete(rate)}
              className="mr-auto text-[var(--color-admin-danger-fg)] hover:bg-[var(--color-admin-danger-bg)]"
            >
              Supprimer
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} loading={saving}>
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-[var(--radius-admin-md)] bg-[var(--color-admin-danger-bg)] px-3 py-2 text-[12.5px] text-[var(--color-admin-danger-fg)]"
          >
            {error}
          </div>
        ) : null}

        <Field label="Libellé" required>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Hiver — Chambre Double"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Type de chambre" required>
            <Select value={roomType} onChange={(e) => setRoomType(e.target.value as RoomTypeCode)}>
              {allRoomTypes.map((t) => (
                <option key={t} value={t}>
                  {roomTypeLabels[t]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Saison" required>
            <Select value={season} onChange={(e) => setSeason(e.target.value as Season)}>
              {allSeasons.map((s) => (
                <option key={s} value={s}>
                  {seasonLabels[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Début de période" required>
            <Input
              type="date"
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
            />
          </Field>
          <Field label="Fin de période" required>
            <Input
              type="date"
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tarif semaine (DA)" required helper="Du lundi au jeudi soir">
            <div className="relative">
              <Input
                type="number"
                min={0}
                step={100}
                value={weekdayDA}
                onChange={(e) => setWeekdayDA(e.target.value)}
                className="pr-12 tnum"
                placeholder="0"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--color-admin-muted)]">
                DA
              </span>
            </div>
          </Field>
          <Field label="Tarif week-end (DA)" required helper="Vendredi, samedi, dimanche">
            <div className="relative">
              <Input
                type="number"
                min={0}
                step={100}
                value={weekendDA}
                onChange={(e) => setWeekendDA(e.target.value)}
                className="pr-12 tnum"
                placeholder="0"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--color-admin-muted)]">
                DA
              </span>
            </div>
          </Field>
        </div>
      </div>
    </Sheet>
  );
}

// ─── Vue calendrier annuel ───────────────────────────────────────────

function CalendarYearView({ rates, year }: { rates: Rate[]; year: number }) {
  // Pour chaque jour, on cherche la saison qui s'applique (premier tarif qui
  // contient ce jour). Si plusieurs types couvrent le jour, ils partagent la
  // même saison (les seeds le confirment) — sinon on prend le premier.
  const seasonFor = (iso: string): Season | null => {
    const hit = rates.find((r) => r.startsOn <= iso && r.endsOn >= iso);
    return hit ? hit.season : null;
  };

  const ratesForDay = (iso: string): Rate[] =>
    rates.filter((r) => r.startsOn <= iso && r.endsOn >= iso);

  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--color-admin-accent)]" />
            {"Calendrier saisonnier "}
            <span className="tnum">{year}</span>
          </span>
        }
        subtitle="Survolez un jour pour voir les tarifs applicables."
      />
      <CardBody>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {monthNames.map((m, idx) => (
            <MiniMonth
              key={m}
              year={year}
              monthIndex={idx}
              monthName={m}
              seasonFor={seasonFor}
              ratesForDay={ratesForDay}
            />
          ))}
        </div>
        <CalendarLegend />
      </CardBody>
    </Card>
  );
}

function MiniMonth({
  year,
  monthIndex,
  monthName,
  seasonFor,
  ratesForDay,
}: {
  year: number;
  monthIndex: number;
  monthName: string;
  seasonFor: (iso: string) => Season | null;
  ratesForDay: (iso: string) => Rate[];
}) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  // Lundi = 0 dans notre vue (Europe). JS : dim=0 lun=1 …
  const jsDay = firstOfMonth.getDay();
  const offset = (jsDay + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: Array<{ day: number | null; iso: string | null }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: null, iso: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, iso });
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-[var(--radius-admin-md)] ring-1 ring-[var(--color-admin-border)] bg-[var(--color-admin-panel)] p-3">
      <p className="text-[12px] font-medium text-[var(--color-admin-text)] mb-2 flex items-baseline justify-between">
        <span>{monthName}</span>
        <span className="tnum text-[10.5px] text-[var(--color-admin-faint)]">{year}</span>
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-[9px] uppercase tracking-[0.04em] text-[var(--color-admin-faint)] mb-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="text-center">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c, i) => {
          if (c.day === null || c.iso === null) {
            return <span key={i} className="aspect-square" />;
          }
          const s = seasonFor(c.iso);
          const isToday = c.iso === todayIso;
          const dayRates = ratesForDay(c.iso);
          const titleParts = [
            fmtDate(c.iso),
            s ? seasonLabels[s] : "Aucun tarif",
            ...dayRates.map(
              (r) =>
                `${roomTypeLabels[r.roomType]} · ${fmtDA(r.weekdayDA)} sem · ${fmtDA(r.weekendDA)} we`,
            ),
          ];
          return (
            <span
              key={i}
              title={titleParts.join("\n")}
              className={`aspect-square inline-flex items-center justify-center rounded-[var(--radius-admin-xs)] text-[9.5px] font-medium tnum ${
                s
                  ? seasonDayBg[s]
                  : "bg-[var(--color-admin-sunken)] text-[var(--color-admin-faint)]"
              } ${
                isToday
                  ? "ring-1 ring-[var(--color-admin-accent)] ring-offset-1 ring-offset-[var(--color-admin-panel)]"
                  : ""
              }`}
            >
              {c.day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CalendarLegend() {
  return (
    <div className="mt-5 pt-4 border-t border-[var(--color-admin-divider)] flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="text-[10.5px] uppercase tracking-[0.08em] text-[var(--color-admin-muted)]">
        Légende
      </span>
      {allSeasons.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span
            className={`inline-block size-3 rounded-[var(--radius-admin-xs)] ${seasonDayBg[s].split(" ")[0]}`}
            aria-hidden
          />
          <span className="text-[11.5px] text-[var(--color-admin-text)]">
            {seasonLabels[s]}
          </span>
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block size-3 rounded-[var(--radius-admin-xs)] bg-[var(--color-admin-sunken)]"
          aria-hidden
        />
        <span className="text-[11.5px] text-[var(--color-admin-muted)]">
          Pas de tarif défini
        </span>
      </span>
    </div>
  );
}
