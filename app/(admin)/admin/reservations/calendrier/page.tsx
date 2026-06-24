import type { Metadata } from "next";

import { CalendrierClient } from "./CalendrierClient";

export const metadata: Metadata = {
  title: "Calendrier des réservations",
};

export default function CalendrierPage() {
  return <CalendrierClient />;
}
