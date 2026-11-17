import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Bienvenue · Ziko',
    loadComponent: () => import('./features/welcome/welcome').then((page) => page.Welcome),
  },
  { path: '**', redirectTo: '' },
];
