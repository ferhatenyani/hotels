import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function AdminLoginPage() {
  // La page de connexion vit hors AdminShell (AdminGate ne pose pas
  // `.admin-shell` sur sa branche login). On porte donc la classe sur la
  // racine de cette page pour activer la police système et les tokens admin.
  return (
    <main className="admin-shell min-h-dvh bg-[var(--color-admin-bg)] text-[var(--color-admin-text)] flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-7 flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-[var(--radius-admin-md)] bg-[var(--color-admin-accent)] text-white shadow-[var(--shadow-admin-sm)]">
            <Logo />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-5 tracking-tight">
              Notre Hôtel
            </p>
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-admin-muted)]">
              Aperture · Back-office
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-admin-lg)] bg-[var(--color-admin-panel)] p-6 shadow-[var(--shadow-admin-sm)] ring-1 ring-[var(--color-admin-border)] sm:p-7">
          <h1 className="text-[21px] font-semibold leading-7 tracking-tight text-[var(--color-admin-text)]">
            Bienvenue.
          </h1>
          <p className="mt-1.5 text-[14px] leading-5 text-[var(--color-admin-muted)]">
            {
              "Connectez-vous avec votre adresse professionnelle. La démo accepte le mot de passe "
            }
            <code className="rounded-[var(--radius-admin-sm)] bg-[var(--color-admin-sunken)] px-1 py-0.5 text-[12px] tnum">
              demo
            </code>
            .
          </p>

          <div className="mt-6">
            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.12em] text-[var(--color-admin-faint)]">
          Accès réservé au personnel · v0.1
        </p>
      </div>
    </main>
  );
}

function LoginFormSkeleton() {
  return (
    <div
      className="animate-pulse space-y-4"
      aria-hidden
      role="status"
      aria-label="Chargement…"
    >
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-[var(--radius-admin-sm)] bg-[var(--color-admin-sunken)]" />
        <div className="h-11 rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] md:h-9" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-[var(--radius-admin-sm)] bg-[var(--color-admin-sunken)]" />
        <div className="h-11 rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)] md:h-9" />
      </div>
      <div className="h-11 rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)]" />
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <rect x="2" y="2" width="5.2" height="5.2" rx="1" fill="currentColor" />
      <rect
        x="8.8"
        y="2"
        width="5.2"
        height="5.2"
        rx="1"
        fill="currentColor"
        opacity="0.55"
      />
      <rect
        x="2"
        y="8.8"
        width="5.2"
        height="5.2"
        rx="1"
        fill="currentColor"
        opacity="0.55"
      />
      <rect
        x="8.8"
        y="8.8"
        width="5.2"
        height="5.2"
        rx="1"
        fill="currentColor"
      />
    </svg>
  );
}
