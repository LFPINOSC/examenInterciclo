import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const requiereSesion: CanActivateFn = () => {
  const auth = inject(AuthService);return auth.autenticado() ? true : inject(Router).createUrlTree(['/acceso']);
};
export const requiereAdmin: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.autenticado()) return inject(Router).createUrlTree(['/acceso']);
  return auth.esAdmin() ? true : inject(Router).createUrlTree(['/panel']);
};
export const soloInvitado: CanActivateFn = () => inject(AuthService).autenticado() ? inject(Router).createUrlTree(['/panel']) : true;
