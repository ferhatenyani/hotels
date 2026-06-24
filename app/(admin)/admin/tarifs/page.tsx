import type { Metadata } from "next";

import { RatesClient } from "./_components/RatesClient";

export const metadata: Metadata = {
  title: "Tarifs",
};

export default function TarifsPage() {
  return <RatesClient />;
}
