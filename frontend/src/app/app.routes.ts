import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Carreras } from './pages/carreras/carreras';
import { Estudiantes } from './pages/estudiantes/estudiantes';
import { Asignaturas } from './pages/asignaturas/asignaturas';
import { Matriculas } from './pages/matriculas/matriculas';

export const routes: Routes = [

  // Al ingresar al sistema se dirige al login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Página de inicio de sesión
  {
    path: 'login',
    component: Login
  },

  // Panel principal
  {
    path: 'dashboard',
    component: Dashboard
  },

  // Gestión de carreras
  {
    path: 'carreras',
    component: Carreras
  },

  // Gestión de estudiantes
  {
    path: 'estudiantes',
    component: Estudiantes
  },

  // Gestión de asignaturas
  {
    path: 'asignaturas',
    component: Asignaturas
  },

  // Gestión de matrículas
  {
    path: 'matriculas',
    component: Matriculas
  },

  // Si escribe una ruta que no existe vuelve al login
  {
    path: '**',
    redirectTo: 'login'
  }

];