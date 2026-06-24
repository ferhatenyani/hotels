"use client";

import {
  Archive,
  Banknote,
  BedDouble,
  Percent,
  Plus,
  Tag,
  TicketPercent,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { Column, DataTable } from "@/components/admin/DataTable";
import { Toolbar, FilterChip } from "@/components/admin/Toolbar";
import { useToast } from "@/components/admin/Toast";
import {
  Field,
  Input,
  Label,
  RadioGroup,
  Switch,
} from "@/components/admin/form";
import type { Tone } from "@/components/admin/tone";

import { fmtDA, fmtDate, fmtNumber, fmtPct } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  type Promo,
  type PromoKind,
  type RoomTypeCode,
  promoKindLabels,
  roomTypeLabels,
} from "@/lib/admin/types";

type Scope = "all" | "active" | "archived";

const allRoomTypes: RoomTypeCode[] = [
  "single",
  "double",
  "twin",
  "triple",
  "familiale",
  "suite",
  "appartement",
];

const kindTone: Record<PromoKind, Tone> = {
  percent: "info",
  fixed: "ok",
  "free-night": "violet",
};

function formatPromoValue(p: Promo): string {
  if (p.kind === "percent") return fmtPct(p.value, 0);
  if (p.kind === "fixed") return fmtDA(p.value);
  return `${fmtNumber(p.value)} ${p.value > 1 ? "nuits" : "nuit"}`;
}

export function PromotionsClient() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const [promos, setPromos] = useState<Promo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadError(null);
    repo.promos
      .list()
      .then((p) => {
        if (cancelled) return;
        setPromos(p);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("Impossible de charger les promotions.");
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [creating, setCreating] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<Promo | null>(null);

  const filtered = useMemo(() => {
    if (!promos) return [];
    return promos.filter((p) => {
      if (scope === "active" && !p.active) return false;
      if (scope === "archived" && p.active) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !p.code.toLowerCase().includes(q) &&
          !p.label.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [promos, search, scope]);

  // ─── KPIs ────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const all = promos ?? [];
    const actives = all.filter((p) => p.active);
    const usageTotal = all.reduce((s, p) => s + p.usageCount, 0);
    // Économies estimées : pour pct → on prend 10 % d'une nuit moyenne (8000 DA)
    // × usageCount. Pour fixe → value × usageCount. Pour free-night → 8000 DA × value × usageCount.
    const avgNight = 8000;
    const savings = all.reduce((s, p) => {
      if (p.kind === "percent") return s + (p.value / 100) * avgNight * p.usageCount;
      if (p.kind === "fixed") return s + p.value * p.usageCount;
      return s + avgNight * p.value * p.usageCount;
    }, 0);
    return {
      actives: actives.length,
      usageTotal,
      savings: Math.round(savings),
      total: all.length,
    };
  }, [promos]);

  const onToggleActive = async (p: Promo, next: boolean) => {
    await repo.promos.update(p.id, { active: next });
    toast.push({
      tone: next ? "ok" : "muted",
      title: next ? "Promotion activée" : "Promotion mise en pause",
      body: p.code,
    });
  };

  const onArchive = async (p: Promo) => {
    await repo.promos.archive(p.id);
    toast.push({ tone: "muted", title: "Promotion archivée", body: p.code });
    setConfirmArchive(null);
  };

  // ─── Colonnes ────────────────────────────────────────────────────────
  const columns: Column<Promo>[] = [
    {
      key: "code",
      header: "Code",
      cell: (p) => (
        <span className="font-display tnum uppercase font-medium text-[var(--color-admin-text)]">
          {p.code}
        </span>
      ),
      sortable: true,
      sortFn: (a, b) => a.code.localeCompare(b.code, "fr"),
      width: "w-40",
    },
    {
      key: "label",
      header: "Libellé",
      cell: (p) => (
        <span className="text-[13.5px] text-[var(--color-admin-text)]">{p.label}</span>
      ),
    },
    {
      key: "kind",
      header: "Type",
      cell: (p) => (
        <span className="inline-flex items-center gap-2">
          <Badge tone={kindTone[p.kind]} small>
            {promoKindLabels[p.kind]}
          </Badge>
          <span className="tnum text-[12.5px] text-[var(--color-admin-text)]">
            {formatPromoValue(p)}
          </span>
        </span>
      ),
      width: "w-56",
      hideBelow: "md",
    },
    {
      key: "validity",
      header: "Validité",
      cell: (p) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-muted)]">
          {fmtDate(p.startsOn)} {"–"} {fmtDate(p.endsOn)}
        </span>
      ),
      width: "w-48",
      hideBelow: "lg",
    },
    {
      key: "usage",
      header: "Usage",
      cell: (p) => (
        <span className="tnum text-[12.5px] text-[var(--color-admin-text)]">
          {p.usageLimit
            ? `${fmtNumber(p.usageCount)} / ${fmtNumber(p.usageLimit)}`
            : fmtNumber(p.usageCount)}
        </span>
      ),
      align: "right",
      width: "w-24",
    },
    {
      key: "status",
      header: "Statut",
      cell: (p) => (
        <Badge tone={p.active ? "ok" : "muted"} small>
          {p.active ? "Active" : "Inactive"}
        </Badge>
      ),
      align: "right",
      width: "w-24",
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Switch
            checked={p.active}
            onChange={(next) => void onToggleActive(p, next)}
            label={p.active ? "Désactiver" : "Activer"}
          />
          {p.active ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Archive className="size-3.5" />}
              onClick={() => setConfirmArchive(p)}
            >
              Archiver
            </Button>
          ) : null}
        </div>
      ),
      align: "right",
      width: "w-56",
    },
  ];

  // ─── Rendu ───────────────────────────────────────────────────────────
  const renderBody = () => {
    if (loadError) {
      return <ErrorState body={loadError} onRetry={() => setTick((t) => t + 1)} />;
    }
    if (promos === null) {
      return (
        <>
          <LoadingState variant="kpis" />
          <LoadingState variant="rows" rows={5} />
        </>
      );
    }
    return (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Promotions actives"
            value={kpis.actives}
            helper={`sur ${kpis.total} au total`}
            icon={<TicketPercent className="size-4" />}
          />
          <StatTile
            label="Utilisations cumulées"
            value={fmtNumber(kpis.usageTotal)}
            helper="depuis le lancement"
            icon={<TrendingUp className="size-4" />}
          />
          <StatTile
            label="Économies clients (est.)"
            value={fmtDA(kpis.savings)}
            helper="basé sur 8 000 DA / nuit"
            icon={<Banknote className="size-4" />}
          />
          <StatTile
            label="Codes archivés"
            value={kpis.total - kpis.actives}
            helper="campagnes terminées"
            icon={<Archive className="size-4" />}
          />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          density="comfortable"
          emptyTitle={
            search ? "Aucun résultat" : "Aucune promotion"
          }
          emptyBody={
            search
              ? "Aucun code ne correspond à cette recherche."
              : "Créez votre première promotion pour récompenser vos clients."
          }
          emptyAction={
            !search ? (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => setCreating(true)}
              >
                Nouvelle promotion
              </Button>
            ) : undefined
          }
        />
      </>
    );
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Tarifs", href: "/admin/tarifs" },
          { label: "Promotions" },
        ]}
        title="Promotions"
        subtitle="Codes promotionnels, remises et nuits offertes."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={() => setCreating(true)}
          >
            Nouvelle promotion
          </Button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher par code…"
        filters={
          <>
            <FilterChip
              label="Toutes"
              active={scope === "all"}
              onClick={() => setScope("all")}
            />
            <FilterChip
              label="Actives"
              active={scope === "active"}
              onClick={() => setScope("active")}
            />
            <FilterChip
              label="Archivées"
              active={scope === "archived"}
              onClick={() => setScope("archived")}
            />
          </>
        }
      />

      {renderBody()}

      <PromoDialog
        open={creating}
        existingCodes={promos?.map((p) => p.code.toLowerCase()) ?? []}
        onClose={() => setCreating(false)}
        onCreated={(code) => {
          toast.push({ tone: "ok", title: "Promotion créée", body: code });
          setCreating(false);
        }}
      />

      <Dialog
        open={confirmArchive !== null}
        onClose={() => setConfirmArchive(null)}
        title="Archiver cette promotion ?"
        description={
          confirmArchive
            ? `Le code « ${confirmArchive.code} » ne sera plus utilisable mais restera consultable.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmArchive(null)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Archive className="size-4" />}
              onClick={() => confirmArchive && void onArchive(confirmArchive)}
            >
              Archiver
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-5 text-[var(--color-admin-muted)]">
          {"Les réservations existantes qui utilisent ce code restent valides. L'archivage empêche simplement de nouvelles utilisations."}
        </p>
      </Dialog>
    </>
  );
}

// ─── Dialog de création de promo ─────────────────────────────────────

function PromoDialog({
  open,
  existingCodes,
  onClose,
  onCreated,
}: {
  open: boolean;
  existingCodes: string[];
  onClose: () => void;
  onCreated: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<PromoKind>("percent");
  const [value, setValue] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [scope, setScope] = useState<"all" | "selected">("all");
  const [selectedTypes, setSelectedTypes] = useState<Set<RoomTypeCode>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode("");
    setLabel("");
    setKind("percent");
    setValue("");
    setStartsOn("");
    setEndsOn("");
    setUsageLimit("");
    setScope("all");
    setSelectedTypes(new Set());
    setError(null);
  }, [open]);

  const toggleType = (t: RoomTypeCode) => {
    setSelectedTypes((curr) => {
      const next = new Set(curr);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const onSubmit = async () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Le code est requis.");
      return;
    }
    if (!/^[A-Z0-9-]{2,}$/.test(cleanCode)) {
      setError("Le code doit contenir au moins 2 caractères (lettres, chiffres ou tirets).");
      return;
    }
    if (existingCodes.includes(cleanCode.toLowerCase())) {
      setError("Ce code existe déjà. Choisissez-en un autre.");
      return;
    }
    if (!label.trim()) {
      setError("Le libellé est requis.");
      return;
    }
    const numValue = Number(value);
    if (!Number.isFinite(numValue) || numValue <= 0) {
      setError("La valeur doit être positive.");
      return;
    }
    if (kind === "percent" && numValue > 100) {
      setError("Le pourcentage ne peut pas dépasser 100.");
      return;
    }
    if (!startsOn || !endsOn) {
      setError("Les dates de validité sont requises.");
      return;
    }
    if (endsOn < startsOn) {
      setError("La date de fin doit suivre la date de début.");
      return;
    }
    const limit = usageLimit.trim() ? Number(usageLimit) : undefined;
    if (limit !== undefined && (!Number.isFinite(limit) || limit < 1)) {
      setError("La limite doit être un entier positif.");
      return;
    }
    if (scope === "selected" && selectedTypes.size === 0) {
      setError("Sélectionnez au moins un type de chambre.");
      return;
    }

    setSaving(true);
    try {
      await repo.promos.create({
        code: cleanCode,
        label: label.trim(),
        kind,
        value: numValue,
        startsOn,
        endsOn,
        usageLimit: limit,
        active: true,
        appliesTo: scope === "selected" ? Array.from(selectedTypes) : undefined,
      });
      onCreated(cleanCode);
    } catch {
      setError("La création a échoué. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const valueSuffix = kind === "percent" ? "%" : kind === "fixed" ? "DA" : "nuit(s)";
  const ValueIcon = kind === "percent" ? Percent : kind === "fixed" ? Banknote : Tag;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nouvelle promotion"
      description="Créez un code promo. Toutes les promotions sont actives à la création."
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" onClick={onSubmit} loading={saving}>
            Créer la promotion
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-md bg-[var(--color-admin-danger-bg)] px-3 py-2 text-[12.5px] text-[var(--color-admin-danger-fg)]"
          >
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
          <Field label="Code" required helper="2 caractères min · majuscules">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="WEEK3"
              maxLength={20}
              className="uppercase tnum font-medium"
            />
          </Field>
          <Field label="Libellé" required>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="3e nuit offerte (longs séjours)"
            />
          </Field>
        </div>

        <Field label="Type de remise" required>
          <RadioGroup
            name="promo-kind"
            value={kind}
            onChange={(v) => setKind(v)}
            options={[
              {
                value: "percent",
                label: "Pourcentage",
                helper: "Une remise relative au total du séjour (ex. 10 %).",
              },
              {
                value: "fixed",
                label: "Montant fixe",
                helper: "Une remise en dinars retirée du total (ex. 1 500 DA).",
              },
              {
                value: "free-night",
                label: "Nuit offerte",
                helper: "Une ou plusieurs nuits remises à 0 dans le séjour.",
              },
            ]}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Valeur" required>
            <div className="relative">
              <ValueIcon
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-admin-faint)]"
                aria-hidden
              />
              <Input
                type="number"
                min={0}
                step={kind === "percent" ? 1 : kind === "free-night" ? 1 : 100}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={kind === "percent" ? "10" : kind === "fixed" ? "1500" : "1"}
                className="pl-8 pr-14 tnum"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--color-admin-muted)]">
                {valueSuffix}
              </span>
            </div>
          </Field>
          <Field label="Limite d'usage (optionnel)" helper="Laisser vide pour illimitée">
            <Input
              type="number"
              min={1}
              step={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="200"
              className="tnum"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Début de validité" required>
            <Input
              type="date"
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
            />
          </Field>
          <Field label="Fin de validité" required>
            <Input
              type="date"
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
            />
          </Field>
        </div>

        <Field label="S'applique à" required>
          <RadioGroup
            name="promo-scope"
            value={scope}
            onChange={(v) => setScope(v)}
            options={[
              {
                value: "all",
                label: "Tous les types de chambre",
                helper: "Le code est utilisable quel que soit le produit choisi.",
              },
              {
                value: "selected",
                label: "Certains types seulement",
                helper: "Sélectionnez les chambres éligibles ci-dessous.",
              },
            ]}
          />
        </Field>

        {scope === "selected" ? (
          <div className="rounded-md border border-[var(--color-admin-border)] p-3 space-y-2">
            <Label>Chambres éligibles</Label>
            <div className="flex flex-wrap gap-1.5">
              {allRoomTypes.map((t) => {
                const active = selectedTypes.has(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11.5px] font-medium transition-colors ${
                      active
                        ? "bg-marine text-white"
                        : "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)] hover:bg-[var(--color-admin-border)]"
                    }`}
                  >
                    <BedDouble className="size-3" />
                    {roomTypeLabels[t]}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

      </div>
    </Dialog>
  );
}
