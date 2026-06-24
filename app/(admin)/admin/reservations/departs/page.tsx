import type { Metadata } from "next";

import { DepartsClient } from "./DepartsClient";

export const metadata: Metadata = {
  title: "Départs du jour",
};

export default function DepartsPage() {
  return <DepartsClient />;
}
