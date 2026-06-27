// /policies — narrow editorial column. Confidentialité · Conditions de séjour ·
// Annulation · Règlement intérieur. Server Component, all copy inlined for the
// demo (no CMS).
//
// Voice: human, plain, brand-aligned. Avoids legalese. References the
// hotel's real practices (direct-booking emphasis, the document policy at
// check-in, no spa/pool/gym, free private parking, 24 h reception).

import type { Metadata } from "next";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import { Button } from "@/components/site/Button";

import { hotel } from "@/lib/data/hotel";

// Last-updated stamp — hardcoded to today's date per the build brief
// (the orchestrator passed it through the system context).
const LAST_UPDATED = "24 juin 2026";

export const metadata: Metadata = {
  title: `Politiques — Ce que nous promettons, ce que nous demandons · ${hotel.name}, ${hotel.city}`,
  description: `Confidentialité, conditions de séjour, annulation et règlement intérieur à ${hotel.name}, ${hotel.city} — rédigés en français clair, sans jargon juridique.`,
};

type Policy = {
  id: string;
  eyebrow: string;
  /** Court intitulé utilisé dans le menu de navigation en haut de page. */
  navLabel: string;
  title: string;
  paragraphs: React.ReactNode[];
};

const policies: Policy[] = [
  {
    id: "privacy",
    eyebrow: "01 · Confidentialité",
    navLabel: "Confidentialité",
    title: "Comment nous protégeons vos données",
    paragraphs: [
      <>Nous collectons le strict minimum d&apos;informations nécessaires à la réservation : un nom, des coordonnées, les dates du séjour et une carte pour la pré-autorisation. C&apos;est tout.</>,
      <>Lorsque vous écrivez à la réception via le formulaire de contact, nous conservons le message jusqu&apos;à la clôture de la conversation, puis nous le supprimons. Nous ne transmettons pas vos coordonnées à des tiers et nous ne vendons ni ne louons de liste — il n&apos;y a aucune liste.</>,
      <>Les réservations effectuées par des canaux tiers (Booking.com, Expedia, agences) sont régies par la politique de confidentialité de ces plateformes en plus de la nôtre. Nous préférons fortement la réservation directe, pour votre confort comme pour le nôtre — moins de mains sur vos données, moins de risques d&apos;erreurs.</>,
      <>Si vous souhaitez connaître les informations que nous détenons sur vous, ou demander leur suppression, écrivez à <a href={`mailto:${hotel.contact.email}`} className="underline decoration-marine/40 underline-offset-2 hover:text-marine">{hotel.contact.email}</a> et nous reviendrons vers vous sous un jour ouvré.</>,
      <>Les caméras en circuit fermé de l&apos;hôtel couvrent les espaces publics — l&apos;entrée, le lobby, les couloirs — pour la sécurité des clients et du personnel. Les images sont conservées sur une courte période et ne sont consultées qu&apos;en cas de besoin.</>,
      <>Pour les paiements, nous faisons appel à un prestataire agréé ; la carte elle-même ne transite jamais par nos serveurs. Les cookies de ce site se limitent à ce qui fait fonctionner le site — session, langue, état d&apos;URL du tunnel de réservation. Nous n&apos;utilisons ni traqueurs publicitaires ni outils d&apos;analyse tiers.</>,
    ],
  },
  {
    id: "terms",
    eyebrow: "02 · Conditions de séjour",
    navLabel: "Conditions",
    title: "Ce qu'un séjour chez nous implique",
    paragraphs: [
      <>Une réservation confirmée est un petit contrat : vous nous indiquez quand vous attendre et quel type de chambre préparer ; nous gardons cette chambre et vous accueillons à l&apos;arrivée. Le prix affiché à la confirmation est celui que vous paierez — auxquels s&apos;ajoute la taxe de séjour de {hotel.tourismTaxDA} DA par personne et par nuit, que la ville perçoit par notre intermédiaire.</>,
      <>L&apos;arrivée s&apos;effectue à partir de 14h00 ; le départ à 12h00. Les arrivées anticipées sont les bienvenues — nous gardons vos bagages à la réception et vous appelons dès que la chambre est prête. Les départs tardifs sont généralement possibles sans frais si vous le demandez la veille ; sous réserve des arrivées du jour.</>,
      <>Chaque client présente une pièce d&apos;identité valide à l&apos;arrivée (passeport ou carte d&apos;identité nationale). Pour les couples, la loi peut exiger un justificatif de mariage — livret de famille, livret de mariage ou acte de mariage. Il s&apos;agit d&apos;une exigence légale et non d&apos;une règle de l&apos;hôtel ; nous le mentionnons partout pour que cela ne vous surprenne pas à la réception.</>,
      <>Les enfants sont les bienvenus à tout âge. Un lit bébé ou un lit d&apos;appoint peut être ajouté sur demande, selon la taille de la chambre — ajoutez une note à votre réservation pour nous le faire savoir.</>,
      <>L&apos;hôtel compte 124 chambres, un parking privé gratuit (jour et nuit), une réception 24h/24 et une équipe multilingue. Ce que nous n&apos;avons pas : piscine, spa ou salle de sport. Nous préférons vous le dire en amont plutôt que vous le laissiez découvrir à l&apos;arrivée.</>,
      <>Si quelque chose ne va pas avec votre chambre, signalez-le immédiatement à la réception — nous corrigerons ce qui peut l&apos;être sur-le-champ et organiserons un changement de chambre si nécessaire.</>,
    ],
  },
  {
    id: "cancellation",
    eyebrow: "03 · Annulation",
    navLabel: "Annulation",
    title: "Les plans changent — voici comment ça marche",
    paragraphs: [
      <>Les tarifs standards sont librement annulables jusqu&apos;à quarante-huit heures avant l&apos;arrivée. Tant que cette fenêtre n&apos;est pas fermée, vous pouvez déplacer ou annuler la réservation depuis votre e-mail de confirmation ou en écrivant à la réception — sans frais.</>,
      <>Les annulations effectuées dans la fenêtre des quarante-huit heures, ou les non-présentations le jour même, sont facturées la première nuit du séjour. Nous ne le faisons pas à la légère ; c&apos;est ainsi qu&apos;une petite structure parvient à rentabiliser les chambres annulées tardivement.</>,
      <>Les tarifs promotionnels et non remboursables sont clairement signalés à la réservation, avec leurs propres conditions. Quand un tarif est non remboursable, nous vous le précisons avant confirmation — et nous vous demandons de confirmer à nouveau.</>,
      <>Si l&apos;annulation est due à un événement grave — hospitalisation, deuil, interdiction de voyager pour cas de force majeure — écrivez à la réception avec ce que vous pouvez partager, et nous trouverons une solution ensemble. Nous préférons vous revoir l&apos;année prochaine plutôt que de vous facturer cette année.</>,
      <>Les réservations de groupe de dix chambres ou plus, les mariages et les conférences sont régis par le contrat que vous signez avec l&apos;équipe événements ; ce contrat porte son propre calendrier d&apos;annulation. Demandez-en une copie à l&apos;équipe événements si vous souhaitez le relire.</>,
      <>Les remboursements, lorsqu&apos;ils sont dus, sont reversés sur la même carte ou le même compte que celui qui a réglé — généralement sous cinq jours ouvrés, parfois un peu plus selon la banque.</>,
    ],
  },
  {
    id: "house-rules",
    eyebrow: "04 · Règlement intérieur",
    navLabel: "Règlement",
    title: "Les petites choses qui maintiennent la maison calme",
    paragraphs: [
      <>L&apos;ensemble de l&apos;hôtel est non-fumeur en intérieur. Il est possible de fumer sur la petite terrasse près du lobby ; fumer dans une chambre entraîne des frais de nettoyage en profondeur, car le prochain client peut le sentir pendant des jours.</>,
      <>Les horaires de calme s&apos;étendent de 22h00 à 7h00. Nous sommes un hôtel de sommeil au milieu d&apos;une ville animée ; le calme dans les chambres est ce pour quoi la plupart de nos clients reviennent, alors nous demandons la courtoisie de baisser la voix dans les couloirs après vingt-deux heures.</>,
      <>Les animaux ne sont pas acceptés dans les chambres, à l&apos;exception des animaux d&apos;assistance enregistrés — prévenez-nous à l&apos;avance pour que nous puissions préparer correctement la chambre.</>,
      <>La salle des événements est animée le week-end : mariages, baptêmes, fiançailles, conférences. Nous vous prévenons si votre séjour coïncide et nous vous placerons sur un étage éloigné de la musique lorsque cela est possible.</>,
      <>La salle du petit-déjeuner sert de 6h30 à 10h30. Nous pouvons préparer un petit-déjeuner à emporter si vous avez un vol matinal ou une longue route — laissez un mot à la réception la veille.</>,
      <>Les objets perdus et trouvés sont conservés pendant trente jours. Si vous pensez avoir oublié quelque chose, écrivez à la réception avec la date et le numéro de chambre et nous le chercherons.</>,
      <>Les dégradations de la chambre ou de son mobilier sont facturées au coût réel. Les accidents arrivent — dites-le nous, nous trouverons une solution sans drame.</>,
      <>Et : merci. Les hôtels reposent sur la gentillesse des clients entre eux et envers le personnel ; la chaleur de l&apos;accueil est quelque chose que nous essayons de mériter, séjour après séjour.</>,
    ],
  },
];

export default function PoliciesPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Politiques"
        heading="Ce que nous promettons, ce que nous demandons"
        description="Quatre courtes sections — confidentialité, conditions, annulation et règlement intérieur. Rédigées en français clair, à hauteur d'humain."
        image="/images/exhibit-corner-suite.jpg"
        imageAlt={`Le coin salon de la Suite Senior à ${hotel.name}`}
        height="short"
      />

      <Section tone="white" size="default" maxWidth="narrow">
        {/* Last-updated + index nav at the top of the editorial column. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10 pb-10 md:pb-14 border-b border-ink/10">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
              Dernière mise à jour · <span className="text-ink">{LAST_UPDATED}</span>
            </p>
            <h2 className="font-display font-medium text-[24px] md:text-[28px] leading-tight tracking-tight text-ink max-w-[36ch] text-balance">
              Un sommaire bref et clair de ce que nous attendons de vous et de ce que nous vous devons en retour.
            </h2>
          </div>
          <nav aria-label="Aller à une politique" className="flex flex-wrap gap-2">
            {policies.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="inline-flex items-center justify-center btn-text-sm text-ink/70 border border-ink/15 rounded-full px-4 py-2.5 min-h-[44px] transition-colors hover:bg-ink hover:border-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
              >
                {p.navLabel}
              </a>
            ))}
          </nav>
        </div>

        {/* Policy sections — long-form, paragraphs only, marine ruled. */}
        <div className="flex flex-col gap-16 md:gap-20 pt-10 md:pt-14">
          {policies.map((p) => (
            <article
              key={p.id}
              id={p.id}
              className="scroll-mt-24"
            >
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
                {p.eyebrow}
              </p>
              <h2 className="font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-[44px] leading-[1.08] tracking-tight text-ink text-balance">
                {p.title}
              </h2>
              <span
                aria-hidden
                className="mt-5 md:mt-7 block h-px w-14 bg-marine"
              />
              <div className="mt-7 md:mt-10 flex flex-col gap-5 md:gap-6">
                {p.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="font-sans text-[15px] md:text-[16px] leading-[1.75] text-graybase"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Closing — back-to-top + contact link. */}
        <div className="mt-16 md:mt-20 pt-10 border-t border-ink/10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[14px] md:text-[15px] leading-[1.7] text-graybase max-w-[44ch]">
            Une question sur tout cela ? Écrivez à la réception et nous reviendrons vers vous en français clair.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/contact" variant="primary" size="default" arrow>
              Écrire à la réception
            </Button>
            <Button href="/faq" variant="ghost" size="default">
              Voir la FAQ
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
