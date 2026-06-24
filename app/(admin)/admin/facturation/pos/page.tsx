import type { Metadata } from "next";

import { POSPageClient } from "../_components/POSPageClient";

export const metadata: Metadata = {
  title: "Points de vente (POS)",
};

export default function POSPage() {
  return <POSPageClient />;
}
