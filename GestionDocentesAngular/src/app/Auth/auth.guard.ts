import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthServicio } from "../Servicios/auth-servicio";
export const authGuard: CanActivateFn = () => {
  const a = inject(AuthServicio),
    r = inject(Router);
  return a.autenticado() ? true : r.createUrlTree(["/login"]);
};
