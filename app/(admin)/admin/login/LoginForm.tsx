"use client";

import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/admin/Button";
import { Field, Input } from "@/components/admin/form";

import { signIn } from "@/lib/admin/auth";

const demoStaff: Array<{ email: string; label: string }> = [
  { email: "direction@notre-hotel.com", label: "Direction" },
  { email: "manager@notre-hotel.com", label: "Manager" },
  { email: "marie@notre-hotel.com", label: "Réception · matin" },
  { email: "aicha@notre-hotel.com", label: "Gouvernante" },
  { email: "nadia@notre-hotel.com", label: "Comptabilité" },
];

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("direction@notre-hotel.com");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn(email, password);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const next = sp?.get("next") ?? "/admin";
      router.replace(next);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Adresse e-mail" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@notre-hotel.com"
          invalid={!!error}
        />
      </Field>

      <Field label="Mot de passe" htmlFor="password" required error={error ?? undefined}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="•••••"
          invalid={!!error}
        />
      </Field>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isPending}
        loadingLabel="Connexion…"
        className="w-full"
        rightIcon={<ArrowRight className="size-4" />}
      >
        Se connecter
      </Button>

      <div className="pt-4 border-t border-[var(--color-admin-divider)]">
        <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--color-admin-faint)] mb-2.5">
          Comptes de démonstration
        </p>
        <ul className="space-y-1">
          {demoStaff.map((s) => (
            <li key={s.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(s.email);
                  setPassword("demo");
                }}
                className="w-full flex items-center justify-between gap-3 py-1.5 px-2 -mx-2 rounded text-left hover:bg-[var(--color-admin-sunken)] transition-colors"
              >
                <span className="text-[12.5px] text-[var(--color-admin-text)]">{s.label}</span>
                <span className="text-[11px] text-[var(--color-admin-muted)] truncate">
                  {s.email}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
