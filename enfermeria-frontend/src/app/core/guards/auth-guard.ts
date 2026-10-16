
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  const rolPermitido = route.data['rol'] as string | undefined;

  if (rolPermitido && auth.obtenerRol() !== rolPermitido) {
    return router.createUrlTree([
      auth.obtenerRol() === 'ADMIN' ? '/admin' : '/enfermero'
    ]);
  }

  return true;
};
