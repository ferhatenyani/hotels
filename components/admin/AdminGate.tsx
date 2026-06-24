"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { currentSession } from "@/lib/admin/auth";

import { Sidebar } from "./Sidebar";
import { ToastProvider } from "./Toast";
import { Topbar } from "./Topbar";

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

  if (isLogin) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  // Avant hydratation OU avant qu'on sache si l'utilisateur est connecté,
  // on rend un squelette neutre. Le contenu apparaît dès que la session est
  // confirmée. Cela évite tout flash du chrome admin sur une page protégée.
  if (!hydrated || !signedIn) {
    return (
      <ToastProvider>
        <div className="min-h-dvh bg-[var(--color-admin-bg)]" data-lenis-prevent />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div
        className="min-h-dvh bg-[var(--color-admin-bg)] text-[var(--color-admin-text)] font-sans"
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
    </ToastProvider>
  );
}
