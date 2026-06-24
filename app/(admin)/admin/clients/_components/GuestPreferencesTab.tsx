"use client";

import { Pencil, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { Field, Textarea } from "@/components/admin/form";
import { Sheet } from "@/components/admin/Sheet";
import { useToast } from "@/components/admin/Toast";

import { repo } from "@/lib/admin/repo";
import type { Guest } from "@/lib/admin/types";

export function GuestPreferencesTab({
  guest,
  onChange,
}: {
  guest: Guest;
  onChange: () => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(guest.preferences.join("\n"));
  const [saving, setSaving] = useState(false);

  // Sync draft when guest changes / sheet opens
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(guest.preferences.join("\n"));
  }, [guest.preferences]);

  const close = () => {
    if (saving) return;
    setOpen(false);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const cleaned = draft
        .split(/\r?\n|,/)
        .map((p) => p.trim())
        .filter(Boolean);
      await repo.guests.update(guest.id, { preferences: cleaned });
      toast.push({ tone: "ok", title: "Préférences mises à jour" });
      setOpen(false);
      onChange();
    } catch {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: "Impossible d'enregistrer les préférences.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-[12.5px] text-[var(--color-admin-muted)]">
          {guest.preferences.length === 0
            ? "Aucune préférence enregistrée."
            : `${guest.preferences.length} préférence${guest.preferences.length > 1 ? "s" : ""} suivie${guest.preferences.length > 1 ? "s" : ""}.`}
        </p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Pencil className="size-4" />}
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto"
        >
          Modifier
        </Button>
      </div>

      {guest.preferences.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-5" />}
          title="Aucune préférence"
          body={"Notez ici tout ce que le client apprécie — chambre haute, oreiller ferme, petit-déjeuner tardif…"}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Pencil className="size-4" />}
              onClick={() => setOpen(true)}
            >
              Ajouter des préférences
            </Button>
          }
        />
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {guest.preferences.map((p) => (
            <Badge key={p} tone="muted" small>
              {p}
            </Badge>
          ))}
        </div>
      )}

      <Sheet
        open={open}
        onClose={close}
        title="Modifier les préférences"
        description="Une préférence par ligne. Elles s'afficheront sur le profil et seront prises en compte par la réception."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={close} disabled={saving}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              loading={saving}
              loadingLabel={"Enregistrement …"}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <Field
          label="Préférences du client"
          htmlFor="prefs-textarea"
          helper="Une par ligne. Les virgules sont également acceptées."
        >
          <Textarea
            id="prefs-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
            placeholder={"Chambre haute\nOreiller ferme\nPetit-déjeuner tardif"}
          />
        </Field>
      </Sheet>
    </div>
  );
}
