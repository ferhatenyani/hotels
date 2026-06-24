import type { Metadata } from "next";

import { PaymentsListClient } from "../_components/PaymentsListClient";

export const metadata: Metadata = {
  title: "Paiements",
};

export default function PaiementsPage() {
  return <PaymentsListClient />;
}
