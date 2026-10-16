// ==========================================
// RUTAS DEL SISTEMA DE CONTROL DE CITAS MEDICAS
// ==========================================

// Permite definir las rutas de Angular.
import { Routes } from '@angular/router';

// Guards para proteger las pantallas.
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

/**
 * Define las rutas de nuestra aplicacion.
 *
 * PUBLICA:
 * /login
 *
 * PRIVADAS:
 * /dashboard
 * /pacientes
 * /medicos
 * /citas
 *
 * SOLO ADMIN:
 * /usuarios
 */
export const routes: Routes = [

  // Redirigir la pagina inicial al login.
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ========================================
  // LOGIN - PUBLICO
  // ========================================
  {
    path: 'login',
    loadComponent: () =>
      import('./paginas/login/login')
        .then(m => m.Login)
  },

  // ========================================
  // DASHBOARD - PRIVADO
  // ========================================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./paginas/dashboard/dashboard')
        .then(m => m.Dashboard),
    canActivate: [authGuard]
  },

  // ========================================
  // PACIENTES - PRIVADO
  // ========================================
  {
    path: 'pacientes',
    loadComponent: () =>
      import('./paginas/pacientes/pacientes')
        .then(m => m.Pacientes),
    canActivate: [authGuard]
  },

  // ========================================
  // MEDICOS - PRIVADO
  // ========================================
  {
    path: 'medicos',
    loadComponent: () =>
      import('./paginas/medicos/medicos')
        .then(m => m.Medicos),
    canActivate: [authGuard]
  },

  // ========================================
  // CITAS - PRIVADO
  // ========================================
  {
    path: 'citas',
    loadComponent: () =>
      import('./paginas/citas/citas')
        .then(m => m.Citas),
    canActivate: [authGuard]
  },

  // ========================================
  // USUARIOS - SOLO ADMIN
  // ========================================
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./paginas/usuarios/usuarios')
        .then(m => m.Usuarios),
    canActivate: [authGuard, adminGuard]
  },

  // Rutas inexistentes regresan al login.
  {
    path: '**',
    redirectTo: 'login'
  }

];