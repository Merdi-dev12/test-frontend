# Ziko Boutique — catalogue et commandes

Frontend Angular 22 de la démonstration Ziko. Il permet de consulter les produits, d'en créer, de choisir une quantité et de créer une commande. Le paiement Mobile Money sera ajouté dans une branche dédiée.

## Prérequis

- Node.js compatible avec Angular 22 et npm
- Le backend Ziko démarré avec PostgreSQL
- La valeur privée de `ADMIN_API_KEY` pour créer des produits si cette route est protégée

## Démarrer en local

Dans le dépôt backend, démarrer les services :

```powershell
docker compose up --build -d
```

Vérifier que `http://localhost:3000/health` répond `{"status":"ok"}`. Dans ce dépôt frontend :

```powershell
npm ci
npm start
```

Ouvrir `http://localhost:4200`. Dans **Espace gestion**, saisir la clé de gestion pour créer un produit. Cette clé est envoyée dans `x-admin-key` et conservée uniquement en mémoire. Choisir ensuite la quantité sur une carte produit et cliquer **Commander**. La page `/orders/:id` lit le récapitulatif depuis le backend et permet d'actualiser son statut.

Le proxy de développement transmet `/api` et `/health` à `http://127.0.0.1:3000`. Pour un autre port backend, définir `ZIKO_API_TARGET` avant `npm start` :

```powershell
$env:ZIKO_API_TARGET='http://127.0.0.1:3001'
npm start
```

## Routes et architecture

| Route | Fonction |
| --- | --- |
| `/` | Catalogue paginé, création de produit et création de commande |
| `/orders/:id` | Lecture du détail et du statut d'une commande |

```text
src/app/
  app.ts/html/scss             Shell et navigation
  app.config.ts                Providers HTTP, router et locale française
  app.routes.ts                Routes chargées à la demande
  core/
    models.ts                  Contrats produit et commande
    api-error.ts               Messages d'erreur API
    admin-access.ts            Clé de gestion en mémoire
    products.ts, orders.ts     Services HTTP @Service() avec inject()
  features/catalog/
    home.*                     Catalogue, pagination et création de commande
    product-card.*             Prix, stock et choix de quantité
    create-product.*           Formulaire de gestion
  features/order/
    order.*                    Récapitulatif et lecture du statut
proxy.conf.cjs                 Proxy de développement
```

Les composants sont standalone. Les pages sont chargées par `loadComponent`, les services API sont dans `core`, et les montants CDF et dates utilisent les pipes Angular. Le frontend utilise des chemins `/api` relatifs.

## Vérifier

```powershell
npm run build
npm test
```

Dans le navigateur, vérifier la pagination, la création d'un produit, la sélection de quantité, puis la création et la lecture d'une commande. La création de commande ne signifie pas qu'elle est payée : seul le statut fourni par le backend fait foi.

## Choix et améliorations possibles

Le parcours commande est séparé du paiement pour que chaque évolution puisse être testée et relue. Le backend gère le prix final et le stock ; le frontend affiche la réponse, sans recalcul métier. Avec plus de temps, l'espace gestion devrait utiliser une authentification et des autorisations côté serveur. Le paiement sandbox et le suivi de sa tentative seront ajoutés dans la prochaine branche.
