// /booking/confirmation/[ref] — step 6. Reservation receipt.
//
// Server Component awaits params and hands the ref to the client child,
// which:
//   - Looks up the booking in localStorage `hdl:bookings` by ref.
//   - If found, shows the "sealed and sent" success state with the booking
//     reference, room/dates summary, guest name, total, an "Add to
//     calendar" .ics download, and a hint to /booking/lookup.
//   - If not found, surfaces a calm "we couldn't find this reservation in
//     your browser — please call the desk" with the phone number.

import type { Metadata } from "next";

import ConfirmationClient from "./ConfirmationClient";

export const metadata: Metadata = {
  title: "Reservation confirmed — Hôtel du Lac",
  description:
    "Your reservation is in. We confirm every booking ourselves — direct booking, no third parties.",
};

export default async function ConfirmationPage(
  props: PageProps<"/booking/confirmation/[ref]">,
) {
  const { ref } = await props.params;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-10 md:py-14 lg:py-20">
      <div className="max-w-[920px] mx-auto">
        <ConfirmationClient ref={ref} />
      </div>
    </div>
  );
}
