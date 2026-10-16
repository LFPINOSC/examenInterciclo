import { inject } from '@angular/core';

import {
  Routes,
  CanActivateFn,
  Router
} from '@angular/router';

// Servicio de autenticacion
import { Auth } from './services/auth';

// Componentes del sistema
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Dashboard } from './pages/dashboard/dashboard';
import { Pacientes } from './pages/pacientes/pacientes';
import { Odontologos } from './pages/odontologos/odontologos';
import { Tratamientos } from './pages/tratamientos/tratamientos';
import { Citas } from './pages/citas/citas';
import { Pagos } from './pages/pagos/pagos';
import { Usuarios } from './pages/usuarios/usuarios';

// ==========================================
// GUARD - VERIFICAR AUTENTICACION
// ==========================================

const protegerRuta: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  return auth.estaAutenticado()
    ? true
    : router.createUrlTree(['/login']);
};

// ==========================================
// GUARD - VERIFICAR ROL ADMIN
// ==========================================

const protegerAdmin: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  return auth.esAdmin()
    ? true
    : router.createUrlTree(['/dashboard']);
};

// ==========================================
// RUTAS DEL SISTEMA DENTALCARE
// ==========================================

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login,
    title: 'Iniciar sesión - DentalCare'
  },

  {
    path: 'registro',
    component: Registro,
    title: 'Registro - DentalCare'
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [protegerRuta],
    title: 'Panel principal - DentalCare'
  },

  {
    path: 'pacientes',
    component: Pacientes,
    canActivate: [protegerAdmin],
    title: 'Pacientes - DentalCare'
  },

  {
    path: 'odontologos',
    component: Odontologos,
    canActivate: [protegerRuta],
    title: 'Odontólogos - DentalCare'
  },

  {
    path: 'tratamientos',
    component: Tratamientos,
    canActivate: [protegerRuta],
    title: 'Tratamientos - DentalCare'
  },

  {
    path: 'citas',
    component: Citas,
    canActivate: [protegerAdmin],
    title: 'Citas - DentalCare'
  },

  {
    path: 'pagos',
    component: Pagos,
    canActivate: [protegerAdmin],
    title: 'Pagos - DentalCare'
  },

  {
    path: 'usuarios',
    component: Usuarios,
    canActivate: [protegerAdmin],
    title: 'Administración de Usuarios - DentalCare'
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];