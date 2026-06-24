import type { Metadata } from "next";

import { MaintenanceClient } from "./MaintenanceClient";

export const metadata: Metadata = {
  title: "Maintenance",
};

export default function MaintenancePage() {
  return <MaintenanceClient />;
}
