import { Routes } from '@angular/router';
import { adminGuard, authGuard, invitadoGuard } from './core/guards';

export const routes: Routes = [
  { path: 'login', title: 'Iniciar sesión | Órdenes de trabajo', canActivate: [invitadoGuard], loadComponent: () => import('./paginas/login').then((m) => m.Login) },

  // ---- ADMIN o TECNICO ----
  { path: '', title: 'Inicio | Órdenes de trabajo', canActivate: [authGuard], loadComponent: () => import('./paginas/panel').then((m) => m.Panel) },
  { path: 'ordenes', title: 'Órdenes | Órdenes de trabajo', canActivate: [authGuard], loadComponent: () => import('./paginas/ordenes').then((m) => m.Ordenes) },

  // ---- Solo ADMIN (las rutas fijas van antes que ordenes/:id) ----
  { path: 'ordenes/nueva', title: 'Nueva orden | Órdenes de trabajo', canActivate: [adminGuard], loadComponent: () => import('./paginas/orden-form').then((m) => m.OrdenForm) },
  { path: 'ordenes/:id/editar', title: 'Editar orden | Órdenes de trabajo', canActivate: [adminGuard], loadComponent: () => import('./paginas/orden-form').then((m) => m.OrdenForm) },
  { path: 'ordenes/:id', title: 'Detalle de orden | Órdenes de trabajo', canActivate: [authGuard], loadComponent: () => import('./paginas/orden-detalle').then((m) => m.OrdenDetalle) },
  { path: 'clientes', title: 'Clientes | Órdenes de trabajo', canActivate: [adminGuard], loadComponent: () => import('./paginas/clientes').then((m) => m.Clientes) },
  { path: 'equipos', title: 'Equipos | Órdenes de trabajo', canActivate: [adminGuard], loadComponent: () => import('./paginas/equipos').then((m) => m.Equipos) },
  { path: 'usuarios', title: 'Usuarios | Órdenes de trabajo', canActivate: [adminGuard], loadComponent: () => import('./paginas/usuarios').then((m) => m.Usuarios) },

  { path: '**', redirectTo: '' },
];
