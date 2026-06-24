"use client";

import { Plus, StickyNote } from "lucide-react";
import { useState } from "react";

import { AvatarChip } from "@/components/admin/AvatarChip";
import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { Field, RadioGroup, Textarea } from "@/components/admin/form";
import { useToast } from "@/components/admin/Toast";

import type { Tone } from "@/components/admin/tone";
import { currentSession } from "@/lib/admin/auth";
import { fmtDateTime } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import type { Guest, GuestNote, Staff } from "@/lib/admin/types";

type NoteKind = GuestNote["kind"];

const kindLabels: Record<NoteKind, string> = {
  general: "Générale",
  preference: "Préférence",
  incident: "Incident",
  vip: "VIP",
};

const kindTone: Record<NoteKind, Tone> = {
  general: "muted",
  preference: "info",
  incident: "danger",
  vip: "ok",
};

const kindHelper: Record<NoteKind, string> = {
  general: "Note libre, pour mémoire de l'équipe.",
  preference: "Préférence du client à respecter.",
  incident: "Incident ou point sensible à signaler.",
  vip: "Information VIP — à traiter avec attention.",
};

export function GuestNotesTab({
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
  const [kind, setKind] = useState<NoteKind>("general");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const staffById = (id: string) => staff.find((s) => s.id === id);
  const sortedNotes = [...guest.notes].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const reset = () => {
    setBody("");
    setKind("general");
  };

  const close = () => {
    if (saving) return;
    reset();
    setOpen(false);
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const session = currentSession();
    if (!body.trim()) {
      toast.push({
        tone: "warn",
        title: "Note vide",
        body: "Saisissez le contenu de la note avant d'enregistrer.",
      });
      return;
    }
    if (!session) {
      toast.push({
        tone: "danger",
        title: "Session expirée",
        body: "Reconnectez-vous pour ajouter une note.",
      });
      return;
    }
    setSaving(true);
    try {
      await repo.guests.addNote(guest.id, {
        kind,
        body: body.trim(),
        author: session.staffId,
      });
      toast.push({ tone: "ok", title: "Note ajoutée" });
      reset();
      setOpen(false);
      onChange();
    } catch {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: "Impossible d'enregistrer la note.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-[var(--color-admin-muted)]">
          {sortedNotes.length === 0
            ? "Aucune note enregistrée."
            : `${sortedNotes.length} note${sortedNotes.length > 1 ? "s" : ""} · ordre chronologique inversé.`}
        </p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="size-4" />}
          onClick={() => setOpen(true)}
        >
          Ajouter une note
        </Button>
      </div>

      {sortedNotes.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="size-5" />}
          title="Pas encore de note"
          body={"Consignez ici tout ce qui mérite d'être partagé avec l'équipe — préférences, anecdotes, incidents."}
        />
      ) : (
        <ul className="space-y-3">
          {sortedNotes.map((note) => {
            const author = staffById(note.author);
            return (
              <li key={note.id}>
                <Card className="ring-0 shadow-none border border-[var(--color-admin-border)]">
                  <CardHeader
                    title={
                      <span className="inline-flex items-center gap-2">
                        <Badge tone={kindTone[note.kind]} small>
                          {kindLabels[note.kind]}
                        </Badge>
                        {author ? (
                          <AvatarChip
                            firstName={author.firstName}
                            lastName={author.lastName}
                            size="sm"
                          />
                        ) : (
                          <span className="text-[12px] text-[var(--color-admin-muted)]">
                            Auteur inconnu
                          </span>
                        )}
                      </span>
                    }
                    subtitle={
                      <span className="tnum">{fmtDateTime(note.createdAt)}</span>
                    }
                  />
                  <CardBody>
                    <p className="text-[13.5px] leading-5 text-[var(--color-admin-text)] whitespace-pre-wrap">
                      {note.body}
                    </p>
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
        title="Ajouter une note"
        description="Cette note sera visible par tous les membres de l'équipe ayant accès au client."
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
          <Field label="Type de note">
            <RadioGroup
              name="note-kind"
              value={kind}
              onChange={(v) => setKind(v)}
              options={(Object.keys(kindLabels) as NoteKind[]).map((k) => ({
                value: k,
                label: kindLabels[k],
                helper: kindHelper[k],
              }))}
            />
          </Field>
          <Field label="Contenu" required htmlFor="note-body">
            <Textarea
              id="note-body"
              value={body}
              rows={4}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Détaillez la situation ou la préférence…"
            />
          </Field>
        </form>
      </Dialog>
    </div>
  );
}
