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

      <Field
        label="Mot de passe"
        htmlFor="password"
        required
        error={error ?? undefined}
      >
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

      <div className="border-t border-[var(--color-admin-divider)] pt-5">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-admin-muted)]">
          Comptes de démonstration
        </p>
        <ul className="-mx-2 space-y-0.5">
          {demoStaff.map((s) => (
            <li key={s.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(s.email);
                  setPassword("demo");
                }}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[var(--radius-admin-md)] px-2 py-2 text-left transition-colors duration-150 ease-out hover:bg-[var(--color-admin-sunken)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-admin-accent)]"
              >
                <span className="text-[13px] text-[var(--color-admin-text)]">
                  {s.label}
                </span>
                <span className="truncate text-[11.5px] text-[var(--color-admin-muted)] tnum">
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
