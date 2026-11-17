# Ziko Boutique — frontend Angular

Une interface TypeScript pour parcourir les produits, créer une commande d'un produit et suivre un paiement Mobile Money **dans la sandbox pawaPay**. Ce dépôt est séparé de l'API Express/PostgreSQL.

## Prérequis

- Node.js compatible avec Angular 22 et npm
- Le backend Ziko démarré, par exemple avec `docker compose up --build -d` dans le dépôt backend
- Pour tester un paiement sandbox, le backend configuré avec `PAWAPAY_BASE_URL` et `PAWAPAY_API_TOKEN` dans son `.env` privé

## Démarrer sur Windows

1. Démarrer le backend et vérifier `http://localhost:3000/health` : il doit répondre `{"status":"ok"}`.
2. Dans PowerShell, ouvrir ce dossier et lancer :

   ```powershell
   npm ci
   npm start
   ```

3. Ouvrir `http://localhost:4200`. Le serveur Angular relaie les appels `/api` vers le backend par `proxy.conf.cjs`. Garder les deux terminaux ouverts.
4. Sur la page, renseigner le nom, le prix en CDF et le stock, puis cliquer sur **Ajouter au catalogue**. Aucune clé ne vous est demandée.
5. Choisir une quantité et cliquer **Commander**. La page commande affiche le total CDF.
6. Choisir un opérateur, saisir un numéro local de 10 chiffres commençant par 0, puis lancer le paiement sur la page de commande. Le formulaire vérifie les préfixes Vodacom 081/082/083/086, Airtel 097/098/099 et Orange 080/084/085/089, puis transmet automatiquement le numéro au format 243 suivi de 9 chiffres. L'interface attend le résultat final avant d'afficher « payée ». Le bouton de renvoi d'une tentative active réutilise la même commande et les mêmes paramètres. Après une réponse réseau incertaine, vérifier d'abord le statut ; l'interface bloque un nouveau paiement avec des paramètres différents.

Les numéros et opérateurs acceptés par la sandbox dépendent de sa configuration. Aucun jeton fournisseur ne doit être ajouté à ce projet. Une réponse d'initiation ne confirme pas le débit : seule la commande PAID après vérification finale déclenche l'écran de réussite.

## Configuration du backend

Le frontend appelle les chemins relatifs `/api`. Par défaut, le proxy local vise l'API sur `http://127.0.0.1:3000`. Si elle écoute sur un autre port, définir `ZIKO_API_TARGET` **dans le terminal qui lance Angular** :

```powershell
$env:ZIKO_API_TARGET='http://127.0.0.1:3001'
npm start
```

Le proxy ne sert qu'avec `ng serve`. Pour déployer le build, servir le frontend et relayer `/api` vers le backend depuis le même domaine.

## Parcours et routes

| Route | Rôle |
| --- | --- |
| `/` | Catalogue paginé, création de produit et création de commande |
| `/orders/:id` | Récapitulatif, initiation et suivi du paiement |

Le backend ne fournit pas de connexion client ni de panier : le parcours du test concerne une commande pour un seul produit. Le bouton « Commander » crée la commande ; le paiement est lancé séparément sur /orders/:id. La liste des produits expose le stock physique ; une réservation simultanée peut encore faire refuser une commande, avec un message d'erreur visible.

## Structure

```text
src/app/
  app.ts, app.html, app.scss       Cadre commun et navigation
  app.config.ts, app.routes.ts     Providers Angular et routes chargées à la demande
  core/
    models.ts                     Contrats de l'API
    api-error.ts                  Traduction des erreurs HTTP
    products.ts, orders.ts,
    payments.ts                   Services @Service() avec inject(HttpClient)
  features/catalog/
    home.*                        Catalogue, pagination et parcours de commande
    product-card.*                Présentation d'un produit et choix de quantité
    create-product.*              Formulaire de création de produit
  features/order/
    order.*                       État de la commande et suivi de la tentative
    payment-form.*                Saisie de l'opérateur et du numéro
proxy.conf.cjs                    Proxy de développement
```

Les dates et prix sont formatés avec les pipes Angular. Les pages utilisent des signaux pour l'état d'affichage et les services utilisent HttpClient pour les appels au backend.

## Vérifier

```powershell
npm run build
npm test
```

Tester aussi dans le navigateur : création d'un produit, commande, paiement en attente, statut final, et renvoi de la même demande. Le backend doit être disponible pour ce dernier parcours.

## Limite du prototype

La création de produits est volontairement ouverte pour le test. Une boutique publique aurait besoin d’une authentification et d’autorisations côté serveur avant d’exposer ce formulaire durablement.
