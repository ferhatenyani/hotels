import type { Metadata } from "next";

import { ChambresClient } from "./_components/ChambresClient";

export const metadata: Metadata = {
  title: "Chambres",
};

export default function ChambresPage() {
  return <ChambresClient />;
}
