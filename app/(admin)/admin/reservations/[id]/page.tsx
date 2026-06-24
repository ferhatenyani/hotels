import type { Metadata } from "next";

import { ReservationDetailClient } from "./ReservationDetailClient";

export const metadata: Metadata = {
  title: "Détail réservation",
};

export default async function ReservationDetailPage(
  props: PageProps<"/admin/reservations/[id]">,
) {
  const { id } = await props.params;
  return <ReservationDetailClient id={id} />;
}
