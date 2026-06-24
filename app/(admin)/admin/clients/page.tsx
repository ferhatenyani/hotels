import type { Metadata } from "next";

import { ClientsListClient } from "./_components/ClientsListClient";

export const metadata: Metadata = {
  title: "Clients",
};

export default function ClientsListPage() {
  return <ClientsListClient />;
}
