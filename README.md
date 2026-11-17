# Ziko Boutique — catalogue Angular

Frontend Angular 22 de la démonstration Ziko. Cette étape ajoute le catalogue paginé et le formulaire de création de produit au socle Angular. La commande et le paiement arriveront dans les branches suivantes.

## Prérequis

- Node.js compatible avec Angular 22 et npm
- Le backend Ziko démarré, par exemple avec Docker dans son dépôt
- La valeur privée de `ADMIN_API_KEY` si la création de produit est protégée

## Démarrer en local

Dans le dépôt backend :

```powershell
docker compose up --build -d
```

Vérifier que `http://localhost:3000/health` répond avec `{"status":"ok"}`. Puis, dans ce dépôt frontend :

```powershell
npm ci
npm start
```

Ouvrir `http://localhost:4200`. La page charge les produits depuis `GET /api/products`. Utiliser **Espace gestion** pour ajouter un produit ; la clé de gestion est saisie dans le formulaire, envoyée dans l'en-tête `x-admin-key` et conservée uniquement en mémoire. Elle ne doit jamais être committée ni placée dans le code frontend.

Le proxy de développement transmet `/api` et `/health` au backend sur `http://127.0.0.1:3000`. Si son port diffère, définir `ZIKO_API_TARGET` avant de lancer Angular :

```powershell
$env:ZIKO_API_TARGET='http://127.0.0.1:3001'
npm start
```

## Architecture

```text
src/app/
  app.ts/html/scss           Shell et navigation
  app.config.ts              Providers HTTP, router et locale française
  app.routes.ts              Route du catalogue chargée à la demande
  core/
    models.ts                Types produit et page de résultats
    api-error.ts             Messages d'erreur API
    admin-access.ts          Clé administrateur en mémoire
    products.ts              Appels GET et POST produits
    products.spec.ts         Tests HTTP du service
  features/catalog/
    home.ts/html/scss        Page, pagination et états de chargement
    product-card.ts/html/scss  Carte, prix CDF, date et stock
    create-product.ts/html/scss  Formulaire de création
proxy.conf.cjs               Proxy de développement
```

Les composants sont standalone. Le catalogue est isolé dans `features/catalog` ; `core` contient les contrats et services HTTP partagés. Le prix et la date utilisent les pipes Angular. Le frontend appelle des chemins relatifs : aucune URL d'API n'est inscrite dans un composant.

## Vérifier

```powershell
npm run build
npm test
```

Vérifier ensuite dans le navigateur la liste, la pagination, l'état vide, les erreurs API et la création d'un produit. Le backend doit être disponible pour ce dernier parcours.

## Choix et suite

Cette étape limite le parcours aux produits pour garder un commit fonctionnel et facile à relire. La prochaine branche ajoutera la création et le détail d'une commande, puis une branche dédiée traitera le paiement sandbox. Avec plus de temps, la gestion des produits devrait utiliser une authentification et des autorisations côté serveur plutôt qu'une clé saisie dans une interface de démonstration.
