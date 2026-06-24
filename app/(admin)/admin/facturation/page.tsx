import type { Metadata } from "next";

import { InvoicesListClient } from "./_components/InvoicesListClient";

export const metadata: Metadata = {
  title: "Facturation",
};

export default function FacturationPage() {
  return <InvoicesListClient />;
}
