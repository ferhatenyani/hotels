import type { Metadata } from "next";

import { GouvernanteClient } from "./GouvernanteClient";

export const metadata: Metadata = {
  title: "Gouvernante",
};

export default function GouvernantePage() {
  return <GouvernanteClient />;
}
