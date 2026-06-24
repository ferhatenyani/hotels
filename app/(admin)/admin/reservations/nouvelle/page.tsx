import type { Metadata } from "next";

import { NouvelleReservationClient } from "./NouvelleReservationClient";

export const metadata: Metadata = {
  title: "Nouvelle réservation",
};

export default function NouvelleReservationPage() {
  return <NouvelleReservationClient />;
}
