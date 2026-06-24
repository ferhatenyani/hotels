import type { Metadata } from "next";

import { PromotionsClient } from "../_components/PromotionsClient";

export const metadata: Metadata = {
  title: "Promotions",
};

export default function PromotionsPage() {
  return <PromotionsClient />;
}
