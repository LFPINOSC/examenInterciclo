import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthServicio } from "../Servicios/auth-servicio";
export const inicioGuard: CanActivateFn = () => {
  const a = inject(AuthServicio),
    r = inject(Router);
  return a.autenticado() ? r.createUrlTree(["/app/dashboard"]) : true;
};
