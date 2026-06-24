import type { Metadata } from "next";

import { ArriveesClient } from "./ArriveesClient";

export const metadata: Metadata = {
  title: "Arrivées du jour",
};

export default function ArriveesPage() {
  return <ArriveesClient />;
}
