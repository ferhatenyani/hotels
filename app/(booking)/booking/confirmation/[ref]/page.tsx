// /booking/confirmation/[ref] — étape 6. Reçu de réservation.
//
// Le Server Component attend les params et transmet la ref à l'enfant
// client qui :
//   - Cherche la réservation dans localStorage `hdl:bookings` par ref.
//   - Si trouvée, affiche l'état de succès « envoyée et scellée » avec la
//     référence de réservation, le récap chambre/dates, le nom du
//     voyageur, le total, un téléchargement « Ajouter au calendrier »
//     (.ics) et un lien vers /booking/lookup.
//   - Sinon, propose un « impossible de retrouver cette réservation dans
//     votre navigateur — appelez la réception » avec le numéro.

import type { Metadata } from "next";

import ConfirmationClient from "./ConfirmationClient";
import { hotel } from "@/lib/data/hotel";

export const metadata: Metadata = {
  title: `Réservation confirmée — ${hotel.name}`,
  description:
    "Votre réservation est prise en compte. Nous confirmons chaque réservation nous-mêmes — réservation directe, sans intermédiaire.",
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
