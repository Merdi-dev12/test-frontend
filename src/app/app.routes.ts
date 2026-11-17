import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Boutique · Ziko',
    loadComponent: () => import('./features/catalog/home').then((page) => page.Home),
  },
  {
    path: 'orders/:id',
    title: 'Commande · Ziko',
    loadComponent: () => import('./features/order/order').then((page) => page.OrderPage),
  },
  { path: '**', redirectTo: '' },
];
