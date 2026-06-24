// Layout du groupe (admin) — la garde d'auth + le shell Aperture (sidebar
// + topbar) sont entièrement encapsulés dans `AdminGate`. La page de login
// (/admin/login) tombe aussi sous ce layout mais `AdminGate` détecte ce
// pathname et n'affiche pas le shell — la page se présente seule, en
// pleine surface.
//
// Ce layout n'a *aucune* dépendance avec le layout (site) ni (booking) —
// le site invité continue de tourner exactement comme avant.

import type { Metadata } from "next";

import { AdminGate } from "@/components/admin/AdminGate";

export const metadata: Metadata = {
  title: {
    template: "%s · Aperture — Admin",
    default: "Aperture — Admin",
  },
  description:
    "Tableau de bord du personnel de l'hôtel — réservations, chambres, clients, tarifs, facturation et pilotage.",
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGate>{children}</AdminGate>;
}
