"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { currentSession } from "@/lib/admin/auth";

import { Sidebar } from "./Sidebar";
import { ToastProvider } from "./Toast";
import { Topbar } from "./Topbar";

/**
 * Contexte du tiroir de navigation mobile. La Sidebar se rend en tiroir
 * hors-canevas sous `lg` ; le bouton hamburger de la Topbar pilote son
 * ouverture. On partage l'état ici pour que les deux primitives restent
 * synchrones sans prop-drilling.
 */
type NavDrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const NavDrawerContext = createContext<NavDrawerContextValue | null>(null);

export function useNavDrawer(): NavDrawerContextValue {
  const ctx = useContext(NavDrawerContext);
  if (!ctx) {
    // Hors AdminShell (ex. login) : no-op sûr pour ne jamais planter.
    return { open: false, setOpen: () => {}, toggle: () => {} };
  }
  return ctx;
}

/**
 * Garde + shell admin. Côté serveur, on rend immédiatement (sans session
 * connue) puis le client redirige si nécessaire. C'est exactement le motif
 * d'auth optimiste recommandé par Next.js 16 quand la session vit côté
 * client (localStorage).
 *
 * - Si le chemin courant est `/admin/login` → on ne rend PAS l'AdminShell.
 *   La page de login se présente toute seule.
 * - Sinon, on attend l'hydratation, on lit la session, et :
 *     - pas de session → router.replace('/admin/login?next=…')
 *     - sinon → AdminShell avec Sidebar + Topbar + outlet
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    // Hydratation depuis localStorage côté client — l'effet est l'endroit
    // correct pour le faire (window n'existe pas en SSR). La règle React 19
    // « set-state-in-effect » est un faux positif ici : on synchronise un
    // état React avec une source externe (le sessionStorage du navigateur).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    const s = currentSession();
    setSignedIn(!!s);
    if (!s && !isLogin) {
      const next = pathname && pathname !== "/admin/login" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/admin/login${next}`);
    }
  }, [isLogin, pathname, router]);

  // Le tiroir se ferme à chaque navigation — on suit le pathname.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  if (isLogin) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  // Avant hydratation OU avant qu'on sache si l'utilisateur est connecté,
  // on rend un squelette neutre, calme et structuré (sidebar + topbar fantômes)
  // pour éviter tout saut de mise en page quand le chrome admin apparaît.
  if (!hydrated || !signedIn) {
    return (
      <ToastProvider>
        <div
          className="admin-shell min-h-dvh bg-[var(--color-admin-bg)] text-[var(--color-admin-text)]"
          data-lenis-prevent
          aria-busy="true"
        >
          <div className="flex">
            <div
              className="hidden lg:flex shrink-0 w-[260px] h-dvh sticky top-0 flex-col border-r border-[var(--color-admin-border)] bg-[var(--color-admin-panel)]"
              aria-hidden
            >
              <div className="h-16 border-b border-[var(--color-admin-divider)]" />
              <div className="flex-1 px-3 py-4 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 rounded-[var(--radius-admin-md)] bg-[var(--color-admin-sunken)]"
                    style={{ opacity: 1 - i * 0.1 }}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div
                className="h-16 border-b border-[var(--color-admin-border)] bg-[var(--color-admin-panel)]"
                aria-hidden
              />
              <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-[1440px] space-y-4">
                  <div className="h-7 w-56 rounded-[var(--radius-admin-sm)] bg-[var(--color-admin-sunken)]" />
                  <div className="h-4 w-80 rounded-[var(--radius-admin-sm)] bg-[var(--color-admin-sunken)]" />
                  <div className="h-40 rounded-[var(--radius-admin-lg)] bg-[var(--color-admin-panel)] ring-1 ring-[var(--color-admin-border)]" />
                </div>
              </main>
            </div>
          </div>
          <span className="sr-only">Chargement de l&apos;espace d&apos;administration…</span>
        </div>
      </ToastProvider>
    );
  }

  const drawer: NavDrawerContextValue = {
    open: drawerOpen,
    setOpen: setDrawerOpen,
    toggle: () => setDrawerOpen((o) => !o),
  };

  return (
    <ToastProvider>
      <NavDrawerContext.Provider value={drawer}>
        <div
          className="admin-shell min-h-dvh bg-[var(--color-admin-bg)] text-[var(--color-admin-text)]"
          data-lenis-prevent
        >
          <div className="flex">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col">
              <Topbar />
              <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-[1440px] space-y-6">{children}</div>
              </main>
            </div>
          </div>
        </div>
      </NavDrawerContext.Provider>
    </ToastProvider>
  );
}
