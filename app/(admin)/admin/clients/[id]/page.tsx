import type { Metadata } from "next";

import { GuestProfileClient } from "../_components/GuestProfileClient";

export const metadata: Metadata = {
  title: "Profil client",
};

export default async function GuestProfilePage(props: PageProps<"/admin/clients/[id]">) {
  const { id } = await props.params;
  return <GuestProfileClient guestId={id} />;
}
