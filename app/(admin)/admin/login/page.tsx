import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-dvh bg-[var(--color-admin-bg)] text-[var(--color-admin-text)] flex">
      <section className="hidden lg:flex flex-1 bg-marine text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5">
            <div className="inline-flex size-9 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
              <Logo />
            </div>
            <div>
              <p className="font-display text-[15px] tracking-tight">Notre Hôtel</p>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-white/60">
                Aperture · Back-office
              </p>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/55 mb-5">
            {"Le calme au cœur de l'opération"}
          </p>
          <h1 className="font-display text-[34px] leading-[1.1] tracking-tight text-balance">
            {"La main courante d'un hôtel qui prend son temps."}
          </h1>
          <p className="mt-6 text-[14px] leading-[1.65] text-white/75 max-w-[42ch]">
            {"Aperture rassemble les réservations, les chambres, la facturation et l'équipe sur une seule surface — pensée pour la réception comme pour la direction."}
          </p>
        </div>
        <p className="relative z-10 text-[11px] uppercase tracking-[0.18em] text-white/45">
          Accès réservé au personnel · v0.1
        </p>
        <div className="pointer-events-none absolute -right-32 -bottom-32 size-[560px] rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute -left-12 top-1/2 size-64 rounded-full bg-white/[0.03]" />
      </section>

      <section className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 inline-flex items-center gap-2.5">
            <div className="inline-flex size-8 items-center justify-center rounded-md bg-marine text-white">
              <Logo />
            </div>
            <div>
              <p className="font-display text-[14px] tracking-tight">Notre Hôtel</p>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-admin-muted)]">
                Aperture · Admin
              </p>
            </div>
          </div>

          <h2 className="font-display text-[22px] leading-7 tracking-tight">
            Bienvenue.
          </h2>
          <p className="mt-1.5 text-[13px] text-[var(--color-admin-muted)]">
            Connectez-vous avec votre adresse professionnelle. La démo accepte le mot de passe&nbsp;
            <code className="px-1 py-0.5 rounded bg-[var(--color-admin-sunken)] text-[12px]">demo</code>.
          </p>

          <div className="mt-8">
            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden>
      <div className="space-y-1.5">
        <div className="h-3 w-24 rounded bg-[var(--color-admin-sunken)]" />
        <div className="h-9 rounded-md bg-[var(--color-admin-sunken)]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-24 rounded bg-[var(--color-admin-sunken)]" />
        <div className="h-9 rounded-md bg-[var(--color-admin-sunken)]" />
      </div>
      <div className="h-11 rounded-md bg-[var(--color-admin-sunken)]" />
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <rect x="2" y="2" width="5.2" height="5.2" rx="1" fill="currentColor" />
      <rect x="8.8" y="2" width="5.2" height="5.2" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="2" y="8.8" width="5.2" height="5.2" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="8.8" y="8.8" width="5.2" height="5.2" rx="1" fill="currentColor" />
    </svg>
  );
}
