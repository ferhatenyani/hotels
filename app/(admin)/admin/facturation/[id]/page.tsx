import type { Metadata } from "next";

import { InvoiceDetailClient } from "../_components/InvoiceDetailClient";

export const metadata: Metadata = {
  title: "Folio",
};

export default async function InvoiceDetailPage(
  props: PageProps<"/admin/facturation/[id]">,
) {
  const { id } = await props.params;
  return <InvoiceDetailClient invoiceId={id} />;
}
