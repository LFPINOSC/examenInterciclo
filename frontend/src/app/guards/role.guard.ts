import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth';

/**
 * Verifica que el usuario tenga uno de los
 * roles permitidos para acceder a una ruta.
 */
export const roleGuard: CanActivateFn =
  (route: ActivatedRouteSnapshot) => {

    const authService = inject(AuthService);
    const router = inject(Router);

    const rol = authService.getRol();

    const rolesPermitidos =
      route.data['roles'] as string[];

    if (
      rol &&
      rolesPermitidos.includes(rol)
    ) {
      return true;
    }

    // Si tiene sesión pero no el rol necesario,
    // lo envía al dashboard.
    return router.createUrlTree(['/dashboard']);
  };