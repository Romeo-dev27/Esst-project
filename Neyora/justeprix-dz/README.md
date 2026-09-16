# JustePrix DZ — MVP V1

Prototype frontend de comparaison de prix de réparation en Algérie. La V1 est volontairement locale, sans backend, dépendance ni compilation.

## Lancer le projet

Ouvrez simplement `index.html` dans un navigateur moderne. Aucun serveur ni installation n'est nécessaire.

Pour une navigation plus confortable, un petit serveur statique peut aussi être utilisé, mais il n'est pas requis.

## Important : données fictives

Les 20 prestations, 10 réparateurs et 54 observations de prix présents au premier lancement sont des **données de démonstration fictives**. L'interface affiche cet avertissement sur les pages concernées. Les numéros de téléphone et adresses sont également fictifs.

## Fonctionnalités incluses

- Recherche tolérante aux majuscules, accents, espaces et tirets (`iphone13 écran`, `écran iPhone 13`, etc.).
- Calcul réel en JavaScript des minimums, maximums, moyenne, nombre de prix et dernière vérification.
- Filtres par wilaya, prix, fraîcheur et tri par prix/date.
- Vue détaillée par prestation : prix par zone, facteurs expliquant les écarts et mini-historique CSS/HTML.
- Badges de fraîcheur calculés automatiquement depuis `dateVerified`.
- Mode sombre mémorisé localement.
- Formulaire de suggestion de réparation, mémorisé localement.
- Administration locale : ajout, modification, suppression, recherche, filtre et réinitialisation des données.

## Architecture

```text
justeprix-dz/
├── index.html             Accueil
├── results.html           Recherche, liste et détail d'une prestation
├── how-it-works.html      Explication de la méthode
├── about.html             Présentation du projet
├── admin.html             Administration locale V1
├── css/style.css          Design system et responsive mobile-first
└── js/
    ├── data.js            Jeu de données initial fictif
    ├── utils.js           Stockage, recherche et logique métier
    ├── ui.js              Rendu de l'interface et modales
    ├── app.js             Initialisation, navigation, recherche et filtres
    └── admin.js           CRUD de l'administration locale
```

Le flux est séparé pour faciliter une future évolution : **données → logique métier → rendu UI**.

## Données locales

Au premier chargement, `utils.js` copie les données de `data.js` dans `localStorage` sous la clé `justeprix-dz-data-v1`. Les ajouts et modifications de `admin.html` sont enregistrés dans cette même clé et se reflètent immédiatement dans la recherche.

Le bouton « Réinitialiser les données de démonstration » dans l'administration restaure le jeu initial après confirmation. Les suggestions sont conservées séparément sous `justeprix-dz-suggestions-v1`.

## Passer à de vraies données / une API

1. Remplacez les données fictives dans `js/data.js` par des relevés réels validés, puis passez `isDemo` à `false` et masquez les bandeaux de démonstration.
2. Conservez les identifiants et les modèles `Service`, `Repairer` et `PriceObservation` actuels.
3. Dans `js/utils.js`, remplacez progressivement les méthodes de `Storage` (`getData`, `saveData`) par des appels `fetch` vers une API. Les fonctions utilisées par l'interface (`getServices`, `searchServices`, `calculatePriceStats`, `filterObservations`) peuvent rester identiques.
4. Ajoutez ensuite une authentification et une validation serveur avant d'exposer une vraie administration.

Ne publiez pas l'administration V1 telle quelle : elle est uniquement une simulation locale sans contrôle d'accès.
