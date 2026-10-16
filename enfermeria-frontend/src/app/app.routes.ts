
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';

import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { Enfermero } from './pages/enfermero/enfermero';

import { UsuariosPage } from './pages/usuarios/usuarios';
import { EnfermerosPage } from './pages/enfermeros/enfermeros';
import { PacientesPage } from './pages/pacientes/pacientes';
import { TurnosPage } from './pages/turnos/turnos';
import { ActividadesPage } from './pages/actividades/actividades';

import { MisTurnosPage } from './pages/mis-turnos/mis-turnos';
import { MisActividadesPage } from './pages/mis-actividades/mis-actividades';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },

  // ADMINISTRADOR
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard],
    data: { rol: 'ADMIN' }
  },
  {
    path: 'admin/usuarios',
    component: UsuariosPage,
    canActivate: [authGuard],
    data: { rol: 'ADMIN' }
  },
  {
    path: 'admin/enfermeros',
    component: EnfermerosPage,
    canActivate: [authGuard],
    data: { rol: 'ADMIN' }
  },
  {
    path: 'admin/pacientes',
    component: PacientesPage,
    canActivate: [authGuard],
    data: { rol: 'ADMIN' }
  },
  {
    path: 'admin/turnos',
    component: TurnosPage,
    canActivate: [authGuard],
    data: { rol: 'ADMIN' }
  },
  {
    path: 'admin/actividades',
    component: ActividadesPage,
    canActivate: [authGuard],
    data: { rol: 'ADMIN' }
  },

  // ENFERMERO
  {
    path: 'enfermero',
    component: Enfermero,
    canActivate: [authGuard],
    data: { rol: 'ENFERMERO' }
  },
  {
    path: 'enfermero/mis-turnos',
    component: MisTurnosPage,
    canActivate: [authGuard],
    data: { rol: 'ENFERMERO' }
  },
  {
    path: 'enfermero/mis-actividades',
    component: MisActividadesPage,
    canActivate: [authGuard],
    data: { rol: 'ENFERMERO' }
  },
  {
    path: 'enfermero/registrar-atencion',
    redirectTo: 'enfermero/mis-actividades',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
