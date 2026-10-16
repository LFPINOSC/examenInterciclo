import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Carreras } from './pages/carreras/carreras';
import { Estudiantes } from './pages/estudiantes/estudiantes';
import { Asignaturas } from './pages/asignaturas/asignaturas';
import { Matriculas } from './pages/matriculas/matriculas';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [

  // Ruta inicial
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // LOGIN: ruta pública
  {
    path: 'login',
    component: Login
  },

  // Dashboard: necesita iniciar sesión
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [
      authGuard
    ]
  },

  // Carreras: ADMIN y ESTUDIANTE
  {
    path: 'carreras',
    component: Carreras,
    canActivate: [
      authGuard,
      roleGuard
    ],
    data: {
      roles: [
        'ADMIN',
        'ESTUDIANTE'
      ]
    }
  },

  // Estudiantes: SOLO ADMIN
  {
    path: 'estudiantes',
    component: Estudiantes,
    canActivate: [
      authGuard,
      roleGuard
    ],
    data: {
      roles: [
        'ADMIN'
      ]
    }
  },

  // Asignaturas: ADMIN y ESTUDIANTE
  {
    path: 'asignaturas',
    component: Asignaturas,
    canActivate: [
      authGuard,
      roleGuard
    ],
    data: {
      roles: [
        'ADMIN',
        'ESTUDIANTE'
      ]
    }
  },

  // Matrículas: ambos roles
  {
    path: 'matriculas',
    component: Matriculas,
    canActivate: [
      authGuard,
      roleGuard
    ],
    data: {
      roles: [
        'ADMIN',
        'ESTUDIANTE'
      ]
    }
  },

  // Ruta inexistente
  {
    path: '**',
    redirectTo: 'login'
  }
];