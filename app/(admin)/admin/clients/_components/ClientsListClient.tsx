"use client";

import { Crown, Languages, Sparkles, Star, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Column, DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { FilterChip, Toolbar } from "@/components/admin/Toolbar";

import { fmtDA, fmtNumber, fmtRelative } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  guestLanguageLabels,
  loyaltyTierLabels,
  type Guest,
  type GuestLanguage,
  type LoyaltyTier,
  type Reservation,
} from "@/lib/admin/types";

import {
  isCreatedThisMonth,
  lastVisitDate,
  loyaltyTone,
} from "./helpers";
import { NewGuestDialog } from "./NewGuestDialog";

type LangFilter = GuestLanguage | "all";
type TierFilter = LoyaltyTier | "vip" | "all";

export function ClientsListClient() {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<LangFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    void Promise.all([repo.guests.list(), repo.reservations.list()]).then(
      ([g, r]) => {
        setGuests(g);
        setReservations(r);
        setLoading(false);
      },
    );
  }, [tick]);

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (q) {
        const haystack = `${g.firstName} ${g.lastName} ${g.email} ${g.phone}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (langFilter !== "all" && g.language !== langFilter) return false;
      if (tierFilter === "vip") {
        if (!g.vip) return false;
      } else if (tierFilter !== "all" && g.loyaltyTier !== tierFilter) {
        return false;
      }
      return true;
    });
  }, [guests, search, langFilter, tierFilter]);

  const kpis = useMemo(() => {
    const total = guests.length;
    const vip = guests.filter((g) => g.vip).length;
    const orPlatine = guests.filter(
      (g) => g.loyaltyTier === "or" || g.loyaltyTier === "platine",
    ).length;
    const newThisMonth = guests.filter(isCreatedThisMonth).length;
    return { total, vip, orPlatine, newThisMonth };
  }, [guests]);

  const columns: Column<Guest>[] = [
    {
      key: "client",
      header: "Client",
      cell: (g) => (
        <AvatarChip
          firstName={g.firstName}
          lastName={g.lastName}
          subtitle={g.email}
        />
      ),
    },
    {
      key: "language",
      header: "Langue",
      cell: (g) => (
        <Badge tone="muted" small>
          {guestLanguageLabels[g.language]}
        </Badge>
      ),
      width: "w-24",
      hideBelow: "md",
    },
    {
      key: "loyalty",
      header: "Fidélité",
      cell: (g) => {
        const tone = loyaltyTone(g.loyaltyTier);
        return (
          <span className="inline-flex items-center gap-1.5">
            {g.loyaltyTier && tone ? (
              <Badge tone={tone} small>
                {loyaltyTierLabels[g.loyaltyTier]}
              </Badge>
            ) : (
              <span className="text-[12px] text-[var(--color-admin-faint)]">—</span>
            )}
            {g.vip ? (
              <span
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--color-admin-warn-fg)]"
                title="Client VIP"
              >
                <Star className="size-3 fill-current" aria-hidden />
                VIP
              </span>
            ) : null}
          </span>
        );
      },
      width: "w-44",
      hideBelow: "md",
    },
    {
      key: "phone",
      header: "Téléphone",
      cell: (g) => (
        <span className="tnum text-[var(--color-admin-muted)]">{g.phone}</span>
      ),
      width: "w-40",
      hideBelow: "lg",
    },
    {
      key: "stays",
      header: "Séjours",
      cell: (g) => <span className="tnum">{fmtNumber(g.totalStays)}</span>,
      width: "w-20",
      align: "right",
      hideBelow: "md",
    },
    {
      key: "spent",
      header: "Dépenses totales",
      cell: (g) => <span className="tnum">{fmtDA(g.totalSpentDA)}</span>,
      width: "w-36",
      align: "right",
    },
    {
      key: "lastVisit",
      header: "Dernière visite",
      cell: (g) => {
        const last = lastVisitDate(g.id, reservations);
        return (
          <span className="tnum text-[12px] text-[var(--color-admin-muted)]">
            {last ? fmtRelative(last) : "—"}
          </span>
        );
      },
      width: "w-32",
      align: "right",
      hideBelow: "lg",
    },
    {
      key: "action",
      header: "",
      cell: (g) => (
        <Button
          variant="ghost"
          size="sm"
          href={`/admin/clients/${g.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          Voir
        </Button>
      ),
      width: "w-20",
      align: "right",
    },
  ];

  const langOptions: Array<{ value: LangFilter; label: string }> = [
    { value: "fr", label: "Français" },
    { value: "ar", label: "Arabe" },
    { value: "en", label: "Anglais" },
  ];
  const tierOptions: Array<{ value: TierFilter; label: string }> = [
    { value: "bronze", label: "Bronze" },
    { value: "argent", label: "Argent" },
    { value: "or", label: "Or" },
    { value: "platine", label: "Platine" },
    { value: "vip", label: "VIP" },
  ];

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={"Fichier CRM — historique, préférences et fidélité de chaque client de l'hôtel."}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="size-4" />}
            onClick={() => setDialogOpen(true)}
          >
            Nouveau client
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Total clients"
          value={fmtNumber(kpis.total)}
          helper="fiches actives"
          icon={<Users className="size-4" />}
        />
        <StatTile
          label="VIP"
          value={fmtNumber(kpis.vip)}
          helper="à choyer particulièrement"
          icon={<Star className="size-4" />}
        />
        <StatTile
          label="Or & Platine"
          value={fmtNumber(kpis.orPlatine)}
          helper="hauts paliers de fidélité"
          icon={<Crown className="size-4" />}
        />
        <StatTile
          label="Nouveaux ce mois"
          value={fmtNumber(kpis.newThisMonth)}
          helper="fiches créées ce mois-ci"
          icon={<Sparkles className="size-4" />}
        />
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher par nom, e-mail ou téléphone…"
        filters={
          <>
            <span className="inline-flex items-center gap-1.5 pr-1 text-[11.5px] text-[var(--color-admin-muted)]">
              <Languages className="size-3.5" aria-hidden />
              Langue
            </span>
            {langOptions.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={langFilter === opt.value}
                onClick={() =>
                  setLangFilter((curr) => (curr === opt.value ? "all" : opt.value))
                }
                onClear={() => setLangFilter("all")}
              />
            ))}
            <span className="mx-1 inline-block h-4 w-px bg-[var(--color-admin-divider)]" />
            <span className="inline-flex items-center gap-1.5 pr-1 text-[11.5px] text-[var(--color-admin-muted)]">
              <Crown className="size-3.5" aria-hidden />
              Niveau
            </span>
            {tierOptions.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={tierFilter === opt.value}
                onClick={() =>
                  setTierFilter((curr) => (curr === opt.value ? "all" : opt.value))
                }
                onClear={() => setTierFilter("all")}
              />
            ))}
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={filteredGuests}
        rowKey={(g) => g.id}
        loading={loading}
        emptyTitle={
          search || langFilter !== "all" || tierFilter !== "all"
            ? "Aucun client ne correspond"
            : "Aucun client encore"
        }
        emptyBody={
          search || langFilter !== "all" || tierFilter !== "all"
            ? "Ajustez votre recherche ou retirez un filtre pour voir d'autres fiches."
            : "Créez votre premier client pour commencer à constituer le fichier CRM."
        }
        emptyAction={
          search || langFilter !== "all" || tierFilter !== "all" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setLangFilter("all");
                setTierFilter("all");
              }}
            >
              Tout afficher
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="size-4" />}
              onClick={() => setDialogOpen(true)}
            >
              Nouveau client
            </Button>
          )
        }
        onRowClick={(g) => router.push(`/admin/clients/${g.id}`)}
      />

      <NewGuestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
