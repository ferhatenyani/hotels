import type { Metadata } from "next";

import { ChannelsClient } from "../_components/ChannelsClient";

export const metadata: Metadata = {
  title: "Canaux de distribution",
};

export default function CanauxPage() {
  return <ChannelsClient />;
}
