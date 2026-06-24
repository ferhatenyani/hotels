"use client";

import {
  BookHeart,
  CreditCard,
  FilePlus2,
  Files,
  IdCard,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Button } from "@/components/admin/Button";
import { Card, CardBody } from "@/components/admin/Card";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { Field, Input, RadioGroup } from "@/components/admin/form";
import { useToast } from "@/components/admin/Toast";

import { currentSession } from "@/lib/admin/auth";
import { fmtDate } from "@/lib/admin/format";
import { newId } from "@/lib/admin/id";
import { repo } from "@/lib/admin/repo";
import type { Guest, GuestDocument, Staff } from "@/lib/admin/types";

type DocKind = GuestDocument["kind"];

const kindLabels: Record<DocKind, string> = {
  id: "Carte d'identité",
  passport: "Passeport",
  "marriage-booklet": "Livret de famille",
  other: "Autre justificatif",
};

const kindIcon: Record<DocKind, LucideIcon> = {
  id: IdCard,
  passport: CreditCard,
  "marriage-booklet": BookHeart,
  other: Files,
};

const kindHelper: Record<DocKind, string> = {
  id: "Carte nationale ou pièce locale.",
  passport: "Page d'identité du passeport.",
  "marriage-booklet": "Demandé pour les couples non mariés en Algérie.",
  other: "Document divers (visa, attestation, etc.).",
};

export function GuestDocumentsTab({
  guest,
  staff,
  onChange,
}: {
  guest: Guest;
  staff: Staff[];
  onChange: () => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<DocKind>("id");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const staffById = (id: string) => staff.find((s) => s.id === id);
  const sortedDocs = [...guest.documents].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );

  const reset = () => {
    setKind("id");
    setLabel("");
  };

  const close = () => {
    if (saving) return;
    reset();
    setOpen(false);
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const session = currentSession();
    if (!label.trim()) {
      toast.push({
        tone: "warn",
        title: "Libellé manquant",
        body: "Précisez un nom pour ce document (ex. : « Carte d'identité — recto-verso »).",
      });
      return;
    }
    if (!session) {
      toast.push({
        tone: "danger",
        title: "Session expirée",
        body: "Reconnectez-vous pour ajouter un document.",
      });
      return;
    }
    setSaving(true);
    try {
      const newDoc: GuestDocument = {
        id: newId("doc"),
        kind,
        label: label.trim(),
        uploadedAt: new Date().toISOString(),
        uploadedBy: session.staffId,
      };
      await repo.guests.update(guest.id, {
        documents: [...guest.documents, newDoc],
      });
      toast.push({ tone: "ok", title: "Document enregistré" });
      reset();
      setOpen(false);
      onChange();
    } catch {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: "Impossible d'enregistrer le document.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-[var(--color-admin-muted)]">
          {sortedDocs.length === 0
            ? "Aucun justificatif enregistré."
            : `${sortedDocs.length} document${sortedDocs.length > 1 ? "s" : ""} au dossier.`}
        </p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FilePlus2 className="size-4" />}
          onClick={() => setOpen(true)}
        >
          Ajouter un document
        </Button>
      </div>

      {sortedDocs.length === 0 ? (
        <EmptyState
          icon={<Files className="size-5" />}
          title="Aucun document"
          body={"Pour un séjour, l'équipe enregistre généralement une pièce d'identité ou un passeport."}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FilePlus2 className="size-4" />}
              onClick={() => setOpen(true)}
            >
              Ajouter un document
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {sortedDocs.map((doc) => {
            const Icon = kindIcon[doc.kind];
            const author = staffById(doc.uploadedBy);
            return (
              <li key={doc.id}>
                <Card className="ring-0 shadow-none border border-[var(--color-admin-border)]">
                  <CardBody className="flex items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] text-[var(--color-admin-muted)]">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-[var(--color-admin-text)] truncate">
                        {doc.label}
                      </p>
                      <p className="text-[12px] text-[var(--color-admin-muted)]">
                        {kindLabels[doc.kind]} · téléversé le{" "}
                        <span className="tnum">{fmtDate(doc.uploadedAt)}</span>
                      </p>
                    </div>
                    {author ? (
                      <AvatarChip
                        firstName={author.firstName}
                        lastName={author.lastName}
                        size="sm"
                        className="shrink-0"
                      />
                    ) : null}
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={open}
        onClose={close}
        title="Ajouter un document"
        description={"En démo, le fichier n'est pas réellement stocké : seul le justificatif est enregistré au dossier."}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={close} disabled={saving}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void onSubmit()}
              loading={saving}
              loadingLabel={"Enregistrement …"}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Type de document">
            <RadioGroup
              name="doc-kind"
              value={kind}
              onChange={(v) => setKind(v)}
              options={(Object.keys(kindLabels) as DocKind[]).map((k) => ({
                value: k,
                label: kindLabels[k],
                helper: kindHelper[k],
              }))}
            />
          </Field>
          <Field label="Libellé" required htmlFor="doc-label">
            <Input
              id="doc-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex. : Carte d'identité — recto-verso"
            />
          </Field>
        </form>
      </Dialog>
    </div>
  );
}
