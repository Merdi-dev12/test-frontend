# Instructions du frontend Ziko

## Source de vérité
- Lire le README, les contrats du backend et les fichiers existants avant de modifier l'interface.
- Le backend réel expose produits, commandes et paiements pawaPay sandbox. Ne pas inventer de panier, de connexion client ou de route produit par identifiant.
- Vérifier les entrées et réponses dans le Swagger du backend quand un contrat change.

## Architecture Angular
- Utiliser Angular 22, TypeScript strict, composants standalone et routes définies dans `app.routes.ts`.
- Charger les pages par `loadComponent`. Garder les composants de présentation proches de leur page ; réserver `core/` aux modèles et services API partagés.
- Nommer les fichiers selon leur responsabilité : `home.ts`, `product-card.ts`, `products.ts`. Éviter les suffixes `.component.ts` et `.service.ts`.
- Utiliser `@Service()` pour les services singleton et `inject()` dans les initialiseurs de champs. N'appeler `inject()` ni dans une méthode ni après la création de l'instance.
- Garder les templates, styles et logique dans des fichiers distincts. Aucun fichier source ou document écrit à la main ne doit dépasser 300 lignes ; scinder un composant avant cette limite. Les fichiers générés, comme package-lock.json, sont exclus.
- Utiliser les pipes Angular intégrés pour les dates et les montants CDF. Créer un pipe personnalisé seulement si plusieurs vues partagent une transformation absente d'Angular.
- Utiliser les signaux pour l'état local de l'interface, les formulaires réactifs pour la saisie et les observables HTTP pour les appels. Arrêter toute interrogation périodique à la destruction du composant.

## Données et paiement
- Appeler le backend avec des chemins relatifs `/api`. Le proxy de développement se règle dans `proxy.conf.cjs` ; aucune URL de service en dur dans les composants.
- Ne jamais placer de jeton pawaPay dans le frontend. La création de produits ne demande aucune clé dans ce parcours de démonstration.
- Une réponse d'initiation `202` ne signifie pas que la commande est payée. Afficher l'attente, consulter le statut et ne montrer la réussite qu'après confirmation finale.
- Conserver le même identifiant de commande et les mêmes paramètres lors d'un renvoi de paiement. Ne pas créer de nouvelle commande automatiquement après une réponse réseau incertaine.
- Présenter les erreurs du backend clairement, sans exposer de secrets ni de détails internes.

## Livraison
- Mettre à jour le README et les tests lorsque le parcours public change.
- Tester le build, les interactions importantes et le parcours manuel avec le backend avant de terminer.
- Travailler sur des branches `feat/...`, `fix/...` ou `docs/...` selon le changement. Fournir les commandes de commit ciblées ; ne pas pousser à la place de l'utilisateur sans demande explicite.
