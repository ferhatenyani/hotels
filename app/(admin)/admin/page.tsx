import type { Metadata } from "next";

import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default function AdminHomePage() {
  return <DashboardClient />;
}
