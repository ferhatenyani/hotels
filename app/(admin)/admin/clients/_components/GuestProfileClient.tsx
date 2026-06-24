"use client";

import {
  ArrowLeft,
  CalendarPlus,
  Cake,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Star,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { Tabs } from "@/components/admin/Tabs";

import {
  fmtDA,
  fmtDate,
  fmtName,
  fmtNumber,
} from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  guestLanguageLabels,
  loyaltyTierLabels,
  type Guest,
  type Reservation,
  type Staff,
} from "@/lib/admin/types";

import { GuestDocumentsTab } from "./GuestDocumentsTab";
import { GuestHistoryTab } from "./GuestHistoryTab";
import { GuestMessagesTab } from "./GuestMessagesTab";
import { GuestNotesTab } from "./GuestNotesTab";
import { GuestPreferencesTab } from "./GuestPreferencesTab";
import { QuickMessageCard } from "./QuickMessageCard";

type TabId = "apercu" | "historique" | "notes" | "preferences" | "documents" | "messages";

const tabsConfig: Array<{ id: TabId; label: string }> = [
  { id: "apercu", label: "Aperçu" },
  { id: "historique", label: "Historique" },
  { id: "notes", label: "Notes" },
  { id: "preferences", label: "Préférences" },
  { id: "documents", label: "Documents" },
  { id: "messages", label: "Messages" },
];

export function GuestProfileClient({ guestId }: { guestId: string }) {
  const [tick, setTick] = useState(0);
  const [guest, setGuest] = useState<Guest | null | undefined>(undefined);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [active, setActive] = useState<TabId>("apercu");

  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      repo.guests.byId(guestId),
      repo.reservations.list({ guestId }),
      repo.staff.list(),
    ]).then(([g, r, s]) => {
      if (cancelled) return;
      setGuest(g ?? null);
      setReservations(r);
      setStaff(s);
    });
    return () => {
      cancelled = true;
    };
  }, [guestId, tick]);

  if (guest === undefined) {
    return <LoadingState variant="block" />;
  }

  if (guest === null) {
    return (
      <ErrorState
        title="Client introuvable"
        body={"Cette fiche n'existe pas ou a été supprimée. Retournez à la liste pour en sélectionner une autre."}
      />
    );
  }

  const reload = () => setTick((t) => t + 1);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: fmtName(guest.firstName, guest.lastName) },
        ]}
        title={
          <span className="inline-flex items-center gap-2.5">
            {fmtName(guest.firstName, guest.lastName)}
            {guest.vip ? (
              <Badge tone="warn" small icon={<Star className="size-3 fill-current" aria-hidden />}>
                VIP
              </Badge>
            ) : null}
            {guest.loyaltyTier ? (
              <Badge
                tone={guest.loyaltyTier === "or" || guest.loyaltyTier === "platine" ? "ok" : "muted"}
                small
              >
                {loyaltyTierLabels[guest.loyaltyTier]}
              </Badge>
            ) : null}
          </span>
        }
        subtitle={
          <span className="tnum">
            Inscrit le {fmtDate(guest.createdAt)} · {fmtNumber(guest.totalStays)} séjour
            {guest.totalStays > 1 ? "s" : ""}
          </span>
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            href="/admin/clients"
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Retour à la liste
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <Card>
            <Tabs
              tabs={tabsConfig.map((t) => ({
                id: t.id,
                label: t.label,
                badge:
                  t.id === "notes" && guest.notes.length > 0
                    ? guest.notes.length
                    : t.id === "documents" && guest.documents.length > 0
                      ? guest.documents.length
                      : t.id === "preferences" && guest.preferences.length > 0
                        ? guest.preferences.length
                        : t.id === "historique"
                          ? reservations.length || undefined
                          : undefined,
              }))}
              active={active}
              onChange={(id) => setActive(id as TabId)}
              className="px-4 pt-1"
            />
            <CardBody>
              {active === "apercu" ? (
                <OverviewTab guest={guest} />
              ) : active === "historique" ? (
                <GuestHistoryTab reservations={reservations} />
              ) : active === "notes" ? (
                <GuestNotesTab guest={guest} staff={staff} onChange={reload} />
              ) : active === "preferences" ? (
                <GuestPreferencesTab guest={guest} onChange={reload} />
              ) : active === "documents" ? (
                <GuestDocumentsTab guest={guest} staff={staff} onChange={reload} />
              ) : (
                <GuestMessagesTab guest={guest} />
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4 min-w-0">
          <Card>
            <CardHeader title="Action rapide" subtitle="Démarrer un nouveau séjour" />
            <CardBody>
              <Button
                variant="primary"
                size="md"
                href={`/admin/reservations/nouvelle?guest=${guest.id}`}
                leftIcon={<CalendarPlus className="size-4" />}
                className="w-full"
              >
                Créer une réservation
              </Button>
              <p className="mt-3 text-[12px] text-[var(--color-admin-muted)]">
                {"Le client sera pré-sélectionné dans le formulaire de réservation."}
              </p>
            </CardBody>
          </Card>

          <QuickMessageCard guest={guest} />

          <Card>
            <CardHeader title="Coordonnées" />
            <CardBody>
              <dl className="space-y-3 text-[13px]">
                <FieldRow
                  icon={<Phone className="size-3.5" />}
                  label="Téléphone"
                  value={
                    <a
                      href={`tel:${guest.phone.replace(/\s+/g, "")}`}
                      className="tnum text-[var(--color-admin-text)] hover:text-[var(--color-admin-accent)] transition-colors"
                    >
                      {guest.phone}
                    </a>
                  }
                />
                <FieldRow
                  icon={<Mail className="size-3.5" />}
                  label="E-mail"
                  value={
                    <a
                      href={`mailto:${guest.email}`}
                      className="text-[var(--color-admin-text)] hover:text-[var(--color-admin-accent)] transition-colors break-all"
                    >
                      {guest.email}
                    </a>
                  }
                />
                {guest.address ? (
                  <FieldRow
                    icon={<MapPin className="size-3.5" />}
                    label="Adresse"
                    value={guest.address}
                  />
                ) : null}
                <FieldRow
                  icon={<Globe2 className="size-3.5" />}
                  label="Langue"
                  value={guestLanguageLabels[guest.language]}
                />
                {guest.nationality ? (
                  <FieldRow
                    icon={<UserCircle className="size-3.5" />}
                    label="Nationalité"
                    value={guest.nationality}
                  />
                ) : null}
                {guest.dob ? (
                  <FieldRow
                    icon={<Cake className="size-3.5" />}
                    label="Né(e) le"
                    value={<span className="tnum">{fmtDate(guest.dob)}</span>}
                  />
                ) : null}
              </dl>
            </CardBody>
          </Card>
        </aside>
      </div>
    </>
  );
}

// ─── Aperçu ────────────────────────────────────────────────────────────

function OverviewTab({ guest }: { guest: Guest }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Total séjours"
          value={fmtNumber(guest.totalStays)}
          helper="depuis l'inscription"
        />
        <StatTile
          label="Total dépensé"
          value={fmtDA(guest.totalSpentDA)}
          helper="cumul des séjours"
        />
        <StatTile
          label="Points fidélité"
          value={fmtNumber(guest.loyaltyPoints)}
          helper="solde courant"
        />
        <StatTile
          label="Niveau"
          value={guest.loyaltyTier ? loyaltyTierLabels[guest.loyaltyTier] : "—"}
          helper={guest.vip ? "Client VIP" : "Programme fidélité"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Préférences clés">
          {guest.preferences.length === 0 ? (
            <p className="text-[13px] text-[var(--color-admin-muted)]">
              {"Aucune préférence enregistrée pour l'instant."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {guest.preferences.slice(0, 6).map((p) => (
                <Badge key={p} tone="muted" small>
                  {p}
                </Badge>
              ))}
              {guest.preferences.length > 6 ? (
                <span className="text-[11.5px] text-[var(--color-admin-muted)]">
                  +{guest.preferences.length - 6}
                </span>
              ) : null}
            </div>
          )}
        </Section>
        <Section title="Dernière note">
          {guest.notes.length === 0 ? (
            <p className="text-[13px] text-[var(--color-admin-muted)]">
              {"L'équipe n'a encore rien consigné sur ce client."}
            </p>
          ) : (
            (() => {
              const last = [...guest.notes].sort((a, b) =>
                b.createdAt.localeCompare(a.createdAt),
              )[0];
              return (
                <div>
                  <p className="text-[13px] leading-5 text-[var(--color-admin-text)]">
                    {last.body}
                  </p>
                  <p className="mt-2 text-[11.5px] text-[var(--color-admin-muted)] tnum">
                    {fmtDate(last.createdAt)}
                  </p>
                </div>
              );
            })()
          )}
        </Section>
      </div>
    </div>
  );
}

// Panneau plat interne (pas une carte empilée) : filet + rayon token, sans
// ombre. Évite l'empilement de cartes proscrit par la charte.
function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-admin-lg)] border border-[var(--color-admin-border)]">
      <h3 className="border-b border-[var(--color-admin-divider)] px-4 pt-3.5 pb-3 text-[14px] font-semibold leading-5 text-[var(--color-admin-text)]">
        {title}
      </h3>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

function FieldRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] text-[var(--color-admin-muted)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-admin-muted)]">
          {label}
        </dt>
        <dd className="mt-0.5 text-[13.5px] text-[var(--color-admin-text)]">{value}</dd>
      </div>
    </div>
  );
}

