"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { Field, Input, Select, Textarea } from "@/components/admin/form";
import { useToast } from "@/components/admin/Toast";

import { repo } from "@/lib/admin/repo";
import {
  guestLanguageLabels,
  type GuestLanguage,
} from "@/lib/admin/types";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: GuestLanguage;
  nationality: string;
  preferences: string;
};

const initial: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  language: "fr",
  nationality: "",
  preferences: "",
};

export function NewGuestDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(initial);
    setErrors({});
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = "Prénom requis.";
    if (!form.lastName.trim()) next.lastName = "Nom requis.";
    if (!form.email.trim()) {
      next.email = "E-mail requis.";
    } else if (!form.email.includes("@")) {
      next.email = "E-mail invalide.";
    }
    if (!form.phone.trim()) next.phone = "Téléphone requis.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const created = await repo.guests.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        language: form.language,
        nationality: form.nationality.trim() || undefined,
        preferences: form.preferences
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      });
      toast.push({
        tone: "ok",
        title: "Client créé",
        body: `${created.firstName} ${created.lastName} ajouté au fichier.`,
      });
      reset();
      onClose();
      router.push(`/admin/clients/${created.id}`);
    } catch {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: "Impossible d'enregistrer le client.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Nouveau client"
      description="Renseignez les coordonnées principales — les préférences et documents pourront être complétés depuis le profil."
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={close} disabled={saving}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSubmit}
            loading={saving}
            loadingLabel={"Création …"}
          >
            Créer le client
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Prénom" required htmlFor="g-first" error={errors.firstName}>
            <Input
              id="g-first"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              autoComplete="given-name"
              invalid={!!errors.firstName}
            />
          </Field>
          <Field label="Nom" required htmlFor="g-last" error={errors.lastName}>
            <Input
              id="g-last"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              autoComplete="family-name"
              invalid={!!errors.lastName}
            />
          </Field>
        </div>
        <Field label="E-mail" required htmlFor="g-email" error={errors.email}>
          <Input
            id="g-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            invalid={!!errors.email}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Téléphone" required htmlFor="g-phone" error={errors.phone}>
            <Input
              id="g-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="tel"
              invalid={!!errors.phone}
            />
          </Field>
          <Field label="Langue préférée" htmlFor="g-language">
            <Select
              id="g-language"
              value={form.language}
              onChange={(e) => set("language", e.target.value as GuestLanguage)}
            >
              {(Object.keys(guestLanguageLabels) as GuestLanguage[]).map((lang) => (
                <option key={lang} value={lang}>
                  {guestLanguageLabels[lang]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Nationalité" htmlFor="g-nationality" helper="Optionnel.">
          <Input
            id="g-nationality"
            value={form.nationality}
            onChange={(e) => set("nationality", e.target.value)}
          />
        </Field>
        <Field
          label="Préférences"
          htmlFor="g-prefs"
          helper="Une par ligne ou séparées par des virgules — ex. : chambre haute, oreiller ferme."
        >
          <Textarea
            id="g-prefs"
            rows={3}
            value={form.preferences}
            onChange={(e) => set("preferences", e.target.value)}
            placeholder="Chambre haute, oreiller ferme, petit-déjeuner tardif"
          />
        </Field>
      </form>
    </Dialog>
  );
}
