/*
 * Données de démonstration. Dans la version production, ce module sera
 * remplacé par des appels à une API REST (PostgreSQL côté serveur).
 * Elles sont gardées dans localStorage afin que les opérations admin soient
 * visibles immédiatement, même en ouvrant les fichiers directement.
 */
(function () {
  "use strict";
  const STORAGE_KEY = "tenderdz_tenders_v1";
  const dayMs = 86400000;
  const pad = (n) => String(n).padStart(2, "0");
  const dateAtOffset = (offset) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const catalogue = [
    ["Acquisition de matériel informatique et périphériques", "Direction de l'Éducation", "Informatique", "Alger", "El Biar", "ordinateurs, serveurs, imprimantes et équipements réseau", "Fourniture et installation du matériel avec garantie constructeur."],
    ["Fourniture de produits pharmaceutiques", "CHU d'Oran", "Santé", "Oran", "Hai Sabah", "médicaments, consommables et produits de laboratoire", "Produits homologués, livraison échelonnée et traçabilité requise."],
    ["Travaux d'aménagement de voiries urbaines", "APC de Tlemcen", "BTP et Travaux publics", "Tlemcen", "Centre-ville", "revêtement, trottoirs, signalisation et assainissement", "Entreprise qualifiée avec références comparables sur les cinq dernières années."],
    ["Maintenance préventive des ascenseurs", "Office de Promotion et de Gestion Immobilière", "Maintenance", "Constantine", "Nouvelle Ville Ali Mendjeli", "maintenance, réparation, pièces de rechange et contrôles", "Personnel habilité et disponibilité d'un service d'astreinte."],
    ["Étude de faisabilité pour une zone d'activités", "Wilaya de Sétif", "Études et ingénierie", "Sétif", "Sétif", "étude urbaine, topographie, plans et étude d'impact", "Bureau d'études agréé avec ingénieurs pluridisciplinaires."],
    ["Fourniture de denrées alimentaires", "Direction des Œuvres Universitaires", "Alimentation", "Blida", "Ouled Yaïch", "produits alimentaires, fruits, légumes et produits laitiers", "Respect des normes d'hygiène et livraisons quotidiennes."],
    ["Acquisition de véhicules utilitaires", "Entreprise Publique de Transport Urbain", "Transport et logistique", "Annaba", "Annaba", "véhicules utilitaires, maintenance et pièces détachées", "Garantie minimale de 24 mois et réseau après-vente national."],
    ["Installation d'un réseau de vidéosurveillance", "APC de Béjaïa", "Sécurité", "Béjaïa", "Béjaïa", "caméras IP, enregistreurs, fibres et logiciels de supervision", "Solution évolutive, formation des opérateurs et maintenance d'un an."],
    ["Fourniture de mobilier scolaire", "Direction de l'Éducation", "Mobilier et équipements", "Batna", "Batna", "tables, chaises, tableaux et armoires", "Conformité aux normes de sécurité et fiches techniques obligatoires."],
    ["Réalisation d'un forage d'eau potable", "Algérienne des Eaux", "Hydraulique", "M'Sila", "M'Sila", "forage, pompage, conduites et équipement électromécanique", "Qualification hydraulique, assurance chantier et études géotechniques."],
    ["Nettoyage et entretien des bâtiments administratifs", "Direction des Impôts", "Services", "Alger", "Hydra", "nettoyage, désinfection et fourniture de consommables", "Agents déclarés, planning d'intervention et produits certifiés."],
    ["Fourniture de mobilier de bureau", "Université Mentouri", "Mobilier et équipements", "Constantine", "Constantine", "bureaux, fauteuils, rangements et salles de réunion", "Échantillons et catalogue détaillé à joindre à l'offre."],
    ["Développement d'une plateforme de gestion documentaire", "Caisse Nationale des Assurances Sociales", "Informatique", "Oran", "Oran", "application web, archivage, sécurité et formation", "Équipe technique spécialisée et maintenance corrective de 12 mois."],
    ["Travaux de réhabilitation d'une école primaire", "APC de Ghardaïa", "BTP et Travaux publics", "Ghardaïa", "Beni Isguen", "maçonnerie, peinture, électricité et plomberie", "Visite de site recommandée avant dépôt de l'offre."],
    ["Fourniture et pose de climatiseurs", "Centre Hospitalo-Universitaire", "Énergie et environnement", "Sidi Bel Abbès", "Sidi Djillali", "climatiseurs, installation, mise en service et maintenance", "Équipements à faible consommation énergétique avec garantie."],
    ["Audit énergétique des bâtiments publics", "Direction de l'Énergie", "Études et ingénierie", "Ouargla", "Ouargla", "audit, mesures, recommandations et plan d'actions", "Experts certifiés et références dans le secteur public."],
    ["Collecte et traitement des déchets non dangereux", "EPIC Netcom", "Énergie et environnement", "Alger", "Bab Ezzouar", "collecte, tri, transport et valorisation des déchets", "Moyens roulants adaptés, autorisations réglementaires et traçabilité."],
    ["Acquisition d'équipements de laboratoire", "Institut Pasteur d'Algérie", "Santé", "Alger", "Dely Brahim", "analyseurs, microscopes, réactifs et équipements de protection", "Installation, calibration et formation des utilisateurs incluses."],
    ["Entretien des espaces verts", "APC de Mostaganem", "Services", "Mostaganem", "Salamandre", "arrosage, taille, plantations et évacuation des déchets verts", "Équipe paysagiste et matériel d'entretien professionnel."],
    ["Fourniture de câbles électriques et accessoires", "Sonelgaz Distribution", "Énergie et environnement", "Chlef", "Chlef", "câbles basse tension, coffrets et accessoires de raccordement", "Produits conformes aux normes nationales et internationales."],
    ["Impression de supports pédagogiques", "Université de Boumerdès", "Communication et impression", "Boumerdès", "Boumerdès", "impression, reliure, brochures et supports de communication", "Épreuves de contrôle et respect strict des délais de livraison."],
    ["Réhabilitation du réseau d'assainissement", "APC de Biskra", "Hydraulique", "Biskra", "Biskra", "canalisations, regards, terrassement et raccordements", "Certificat de qualification catégorie travaux hydrauliques exigé."],
    ["Gardiennage et surveillance des sites", "Société de Gestion des Services Aéroportuaires", "Sécurité", "Tamanrasset", "Aéroport Aguenar", "agents de sécurité, contrôle d'accès et rondes", "Agrément en cours de validité et formation des agents."],
    ["Fourniture de pièces de rechange automobiles", "Direction des Transports", "Transport et logistique", "Djelfa", "Djelfa", "filtres, pneumatiques, pièces moteur et consommables", "Pièces d'origine ou équivalentes certifiées, délai de livraison court."],
    ["Acquisition de fournitures de bureau", "Trésorerie de Wilaya", "Fournitures de bureau", "Skikda", "Skikda", "papier, cartouches, classeurs et fournitures diverses", "Livraison sur bons de commande durant l'exercice."],
    ["Étude et suivi d'un projet de logement", "Office de Promotion et de Gestion Immobilière", "Études et ingénierie", "Médéa", "Médéa", "architecture, génie civil, suivi et coordination", "Bureau d'études inscrit au tableau national des architectes."],
    ["Réalisation d'une station de pompage", "Algérienne des Eaux", "Hydraulique", "Jijel", "El Aouana", "station de pompage, équipements électriques et automatisme", "Expérience prouvée dans les installations hydrauliques."],
    ["Fourniture de tenues et équipements de protection", "Entreprise Portuaire", "Fournitures de bureau", "Béjaïa", "Port de Béjaïa", "tenues de travail, chaussures de sécurité et EPI", "Tailles variées, marquage et conformité aux normes de sécurité."],
    ["Mise à niveau de l'infrastructure réseau", "Direction de la Santé", "Informatique", "Tizi Ouzou", "Tizi Ouzou", "switches, pare-feu, wifi, câblage et sécurisation réseau", "Certification des ingénieurs et transfert de compétences requis."],
    ["Travaux de rénovation de l'éclairage public", "APC de Laghouat", "BTP et Travaux publics", "Laghouat", "Laghouat", "candélabres, luminaires LED et tableaux électriques", "Matériel conforme avec garantie de cinq ans."],
    ["Assurance multirisque des biens et véhicules", "Caisse Régionale de Mutualité Agricole", "Assurances", "Sétif", "Sétif", "assurance véhicules, locaux et responsabilité civile", "Compagnie agréée avec réseau d'experts local."],
    ["Formation en cybersécurité pour les agents", "Université d'Alger 1", "Formation", "Alger", "Ben Aknoun", "formation, sécurité informatique, sensibilisation et ateliers", "Formateurs certifiés et programme pédagogique détaillé."],
    ["Fourniture de semences et engrais", "Direction des Services Agricoles", "Agriculture", "El Oued", "El Oued", "semences, engrais, produits phytosanitaires et livraison", "Produits autorisés et fiches de conformité à fournir."],
    ["Location de matériel de chantier", "Direction des Travaux Publics", "BTP et Travaux publics", "Tipaza", "Tipaza", "engins, camions, compacteurs et opérateurs", "Matériel assuré et disponibilité pendant toute la durée du marché."],
    ["Création d'une campagne de communication institutionnelle", "Chambre de Commerce et d'Industrie", "Communication et impression", "Oran", "Oran", "conception graphique, impression, vidéo et diffusion digitale", "Portfolio des réalisations et équipe créative exigés."],
    ["Acquisition d'un groupe électrogène", "Établissement Public de Santé de Proximité", "Énergie et environnement", "Adrar", "Adrar", "groupe électrogène, installation, raccordement et maintenance", "Puissance adaptée, garantie et disponibilité des pièces de rechange."]
  ];
  const newspapers = ["El Moudjahid", "El Watan", "Horizons", "Le Quotidien d'Oran", "Liberté"];
  const states = ["published", "published", "published", "draft", "published", "published"];

  function buildSeeds() {
    return catalogue.map((row, index) => {
      const [title, organization, category, wilaya, location, requirements, conditions] = row;
      const publicationOffset = -((index % 12) + 1);
      const deadlineOffset = [-3, 0, 1, 2, 3, 5, 7, 10, 14, 18, 22, 27][index % 12];
      const newspaper = newspapers[index % newspapers.length];
      return {
        id: `AO-${String(index + 1).padStart(3, "0")}`,
        title,
        organization,
        category,
        wilaya,
        location,
        description: `Le présent appel d'offre porte sur ${title.toLowerCase()} au profit de ${organization}. Les soumissionnaires sont invités à consulter le cahier des charges et à présenter une offre technique et financière conforme.`,
        requirements,
        conditions,
        publicationDate: dateAtOffset(publicationOffset),
        deadline: dateAtOffset(deadlineOffset),
        reference: `TDZ/${new Date().getFullYear()}/${String(1000 + index)}`,
        status: states[index % states.length],
        source: "Publication presse vérifiée",
        newspaper,
        newspaperEdition: "Édition nationale",
        newspaperDate: dateAtOffset(publicationOffset),
        newspaperPage: String((index % 18) + 4),
        createdAt: `${dateAtOffset(publicationOffset)}T08:00:00.000Z`,
        updatedAt: `${dateAtOffset(publicationOffset)}T10:00:00.000Z`
      };
    });
  }

  function read() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return Array.isArray(stored) && stored.length ? stored : buildSeeds();
    } catch (error) { return buildSeeds(); }
  }
  function write(tenders) { localStorage.setItem(STORAGE_KEY, JSON.stringify(tenders)); }

  window.TDZData = {
    categories: [...new Set(catalogue.map((item) => item[2]))].sort(),
    wilayas: [...new Set(catalogue.map((item) => item[3]))].sort(),
    getTenders: read,
    saveTenders: write,
    resetTenders: () => { const seeds = buildSeeds(); write(seeds); return seeds; },
    createSeed: buildSeeds,
    now: () => new Date(),
    dayMs
  };
})();
