import type { Metadata } from "next";

import { MessagesClient } from "../_components/MessagesClient";

export const metadata: Metadata = {
  title: "Messagerie clients",
};

export default async function MessagesPage(
  props: PageProps<"/admin/clients/messages">,
) {
  const sp = await props.searchParams;
  const guestParam = typeof sp.guest === "string" ? sp.guest : undefined;
  const threadParam = typeof sp.thread === "string" ? sp.thread : undefined;
  return (
    <MessagesClient initialGuestId={guestParam} initialThreadId={threadParam} />
  );
}
