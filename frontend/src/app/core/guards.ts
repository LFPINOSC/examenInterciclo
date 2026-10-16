import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Rutas que exigen haber iniciado sesion (ADMIN o TECNICO). */
export const authGuard: CanActivateFn = () => {
  return inject(AuthService).token ? true : inject(Router).createUrlTree(['/login']);
};

/** Rutas de administracion: solo ADMIN. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token) {
    return router.createUrlTree(['/login']);
  }
  return auth.esAdmin() ? true : router.createUrlTree(['/']);
};

/** Login: si ya hay sesion no tiene sentido mostrarlo. */
export const invitadoGuard: CanActivateFn = () => {
  return inject(AuthService).token ? inject(Router).createUrlTree(['/']) : true;
};
