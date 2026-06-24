import type { Metadata } from "next";

import { ReservationsListClient } from "./_components/ReservationsListClient";

export const metadata: Metadata = {
  title: "Réservations",
};

export default function ReservationsPage() {
  return <ReservationsListClient />;
}
