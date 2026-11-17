# Ziko Boutique — socle Angular

Ce dépôt contient le frontend Angular 22 de la démonstration Ziko. Cette première étape configure le projet, le shell visuel, le routage, les tests et le proxy de développement. Les parcours catalogue, commande et paiement seront ajoutés dans les branches suivantes.

## Prérequis

- Node.js compatible avec Angular 22 et npm
- Le backend Ziko pour tester les futurs appels API

## Lancer en local

Dans PowerShell, ouvrir le dossier du frontend puis exécuter :

```powershell
npm ci
npm start
```

Ouvrir `http://localhost:4200`. La page d'accueil confirme que le frontend démarre.

Le proxy de développement transmettra les requêtes `/api` et `/health` au backend sur `http://127.0.0.1:3000`. Pour un autre port, définir `ZIKO_API_TARGET` dans le terminal avant `npm start` :

```powershell
$env:ZIKO_API_TARGET='http://127.0.0.1:3001'
npm start
```

## Structure

```text
src/
  main.ts                    Démarrage de l'application
  index.html                 Document HTML et métadonnées
  styles.scss                Styles communs
  app/
    app.ts/html/scss         Shell visuel et navigation
    app.config.ts            Providers Angular, HTTP et locale française
    app.routes.ts            Routes chargées à la demande
    features/welcome/        Page d'accueil provisoire
proxy.conf.cjs               Proxy local vers le backend
public/favicon.svg           Icône de la boutique
```

Les composants sont standalone, les routes utilisent `loadComponent` et les fichiers gardent des noms courts. Les futurs services API seront placés dans `src/app/core`.

## Vérifier

```powershell
npm run build
npm test
```

## Choix et suite

Le frontend est séparé du backend pour rendre le parcours de démonstration lisible. Le proxy évite d'intégrer une URL d'API dans les composants. Les prochaines étapes ajouteront le catalogue, puis les commandes et le paiement sandbox. Avec plus de temps, l'interface de gestion des produits serait protégée par une authentification et des autorisations côté serveur.
