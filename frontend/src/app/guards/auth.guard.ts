import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth';

/**
 * Protege las rutas que necesitan
 * un usuario autenticado.
 */
export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Si existe token, permite entrar
  if (authService.estaAutenticado()) {
    return true;
  }

  // Si no existe sesión, vuelve al login
  return router.createUrlTree(['/login']);
};