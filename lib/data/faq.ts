// Contenu FAQ. Sujets organisés par les vraies questions des hôtes — d'abord
// la politique des documents au check-in, puis les questions pratiques
// (parking, petit-déjeuner, etc.).

export type FAQItem = {
  q: string;
  a: string;
};

export type FAQGroup = {
  title: string;
  blurb: string;
  items: FAQItem[];
};

export const faqGroups: FAQGroup[] = [
  {
    title: "Arrivée & check-in",
    blurb:
      "Ce qu'il faut apporter, quand arriver et comment la réception gère les petits détails.",
    items: [
      {
        q: "À quelle heure puis-je faire le check-in ?",
        a: "Le check-in ouvre à 14:00. Les arrivées plus tôt sont les bienvenues — nous gardons vos bagages à la réception et vous appelons dès que la chambre est prête. La réception est ouverte vingt-quatre heures sur vingt-quatre.",
      },
      {
        q: "Quels documents dois-je présenter ?",
        a: "Tous les hôtes doivent présenter une pièce d'identité valide au check-in (passeport ou carte d'identité nationale). Pour les couples, la loi exige un justificatif de mariage (livret de famille ou certificat). Nous le mentionnons ici pour éviter toute surprise — c'est une exigence nationale, pas une règle de l'hôtel.",
      },
      {
        q: "Puis-je arriver tard dans la nuit ?",
        a: "Oui. La réception est ouverte vingt-quatre heures sur vingt-quatre. Si vous arrivez après minuit, un petit mot sur votre réservation nous aide à être prêts pour vous.",
      },
      {
        q: "À quelle heure est le check-out ?",
        a: "Le check-out est à 12:00. Nous pouvons généralement garder votre chambre jusqu'à 13:00 ou 14:00 sans frais — demandez la veille au soir et nous arrangeons cela selon les disponibilités.",
      },
    ],
  },
  {
    title: "Y venir & parking",
    blurb: "Depuis l'aéroport, la gare et dans la ville.",
    items: [
      {
        q: "À quelle distance se trouve l'aéroport ?",
        a: "L'aéroport est à environ trois à six kilomètres — environ quinze minutes en voiture en circulation normale. Des taxis sont disponibles à la sortie des arrivées.",
      },
      {
        q: "Y a-t-il un parking sur place ?",
        a: "Oui, parking privé gratuit, accessible vingt-quatre heures sur vingt-quatre. Aucune réservation n'est nécessaire pour le parking des hôtes.",
      },
      {
        q: "Pouvez-vous organiser une navette depuis l'aéroport ?",
        a: "Nous pouvons vous aider à organiser un transfert avec un prestataire local, mais il n'est pas inclus dans le tarif. Envoyez un mot avec les détails de votre arrivée et nous reviendrons vers vous avec des options et des tarifs.",
      },
    ],
  },
  {
    title: "Chambres, petit-déjeuner & restaurant",
    blurb: "Ce qui est inclus, quand les repas sont servis et ce que nous pouvons faire pour vous dans la chambre.",
    items: [
      {
        q: "Le petit-déjeuner est-il inclus ?",
        a: "Oui. Le petit-déjeuner est inclus pour tous nos hôtes, servi de 06:30 à 10:30 dans le restaurant. C'est le repas que nos hôtes citent le plus souvent — fruits frais, viennoiseries chaudes et œufs à la commande.",
      },
      {
        q: "Avez-vous des chambres avec vue ?",
        a: "Toutes nos chambres privilégiées s'ouvrent sur le paysage — c'est la chambre que vous réservez, presque sans exception. Quelques chambres donnent côté ville ; demandez à la réception si vous préférez l'une d'entre elles.",
      },
      {
        q: "Puis-je prendre un repas dans ma chambre ?",
        a: "Oui, le service en chambre est disponible pendant les heures du restaurant. Toute la carte est accessible depuis le téléphone de votre chambre.",
      },
      {
        q: "Êtes-vous adaptés aux familles ?",
        a: "Très. Nous avons des chambres familiales et triples, le petit-déjeuner convient bien aux enfants et l'équipe vous aidera avec tout ce dont vous avez besoin pour la nuit.",
      },
    ],
  },
  {
    title: "L'hôtel & les équipements",
    blurb: "Ce que nous avons, ce que nous n'avons pas et à quoi vous attendre.",
    items: [
      {
        q: "Avez-vous une piscine ou un spa ?",
        a: "Non — notre établissement est un hôtel de ville moderne et calme, pas un resort. Nous n'avons pas de piscine, ni de spa, ni de salle de sport sur place. Nous préférons vous le dire d'avance plutôt que vous le découvriez à l'arrivée.",
      },
      {
        q: "Avez-vous le Wi-Fi ?",
        a: "Oui, Wi-Fi gratuit dans tout l'hôtel — assez performant pour des appels vidéo dans toutes les chambres que nous avons testées.",
      },
      {
        q: "Les chambres sont-elles climatisées ?",
        a: "Chaque chambre est climatisée, avec une commande dans la chambre.",
      },
      {
        q: "Y a-t-il un ascenseur ?",
        a: "Veuillez le demander à la réception lors de votre réservation — nous confirmerons en fonction de votre étage et de vos besoins éventuels en accessibilité.",
      },
    ],
  },
  {
    title: "Réservation, paiement & annulation",
    blurb: "Comment réserver, comment nous bloquons la chambre et comment fonctionnent les annulations.",
    items: [
      {
        q: "Comment dois-je réserver ?",
        a: "La réservation directe est la voie la plus simple — par ce site, par e-mail ou par téléphone. Les réservations directes sont confirmées par nos soins, donc il n'y a pas de surprise à la réception.",
      },
      {
        q: "Acceptez-vous les cartes de crédit ?",
        a: "Oui, toutes les cartes principales. Nous acceptons également le règlement en espèces à la réception si vous le préférez.",
      },
      {
        q: "Quelle est votre politique d'annulation ?",
        a: "Annulation gratuite jusqu'à quarante-huit heures avant l'arrivée sur les tarifs standard. Les tarifs promotionnels et non remboursables sont clairement indiqués lors de la réservation, avec leurs propres conditions.",
      },
      {
        q: "Serai-je débité au moment de la réservation ?",
        a: "Les tarifs standard sont garantis par carte mais facturés uniquement à l'hôtel. Les tarifs non remboursables sont facturés à la réservation — c'est clairement indiqué avant la confirmation.",
      },
    ],
  },
  {
    title: "Événements & réunions",
    blurb: "Mariages, conférences et tout ce qu'il y a entre les deux.",
    items: [
      {
        q: "Puis-je organiser un mariage chez vous ?",
        a: "Oui — la salle peut accueillir jusqu'à cent soixante-dix invités et c'est l'un des lieux les plus prisés pour les mariages, baptêmes et fiançailles. Visitez la page Événements ou écrivez à la réception pour entamer la conversation.",
      },
      {
        q: "Avez-vous des salles de réunion pour les affaires ?",
        a: "Oui, des salles modulables avec vidéoprojecteur, microphone, Wi-Fi et un service pause-café. La restauration va du café du matin au dîner complet — dites-nous la journée et nous adaptons la salle.",
      },
      {
        q: "Pouvez-vous bloquer des chambres pour nos invités de mariage ?",
        a: "Oui. Nous pouvons bloquer dix chambres ou plus ensemble à un tarif groupe réduit, avec un check-in privé pour les invités du mariage — voir le Pack Mariage sur la page Offres.",
      },
    ],
  },
];
