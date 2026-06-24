import type { Metadata } from "next";

import { ListeAttenteClient } from "./ListeAttenteClient";

export const metadata: Metadata = {
  title: "Liste d'attente",
};

export default function ListeAttentePage() {
  return <ListeAttenteClient />;
}
