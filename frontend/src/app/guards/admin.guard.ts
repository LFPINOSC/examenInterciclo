// ==========================================
// GUARD DE ADMINISTRADOR
// CONTROL DE CITAS MEDICAS
// ==========================================

// Permite proteger rutas y redirigir usuarios.
import { CanActivateFn, Router } from '@angular/router';

// Permite acceder a los servicios Angular.
import { inject } from '@angular/core';

// Servicio de autenticacion JWT.
import { Auth } from '../servicios/auth';

/**
 * Protege las pantallas exclusivas
 * para usuarios con rol ADMIN.
 *
 * 1. Comprueba si existe una sesion.
 * 2. Verifica si el usuario es ADMIN.
 * 3. Permite o rechaza el acceso.
 */
export const adminGuard: CanActivateFn = () => {

  // Obtener los servicios.
  const auth = inject(Auth);
  const router = inject(Router);

  // Si no inicio sesion, enviar al login.
  if (!auth.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  // Permitir solamente administradores.
  if (auth.tieneRol('ADMIN')) {
    return true;
  }

  // Los otros usuarios van al dashboard.
  return router.createUrlTree(['/dashboard']);
};