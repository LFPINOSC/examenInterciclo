import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthServicio } from "../Servicios/auth-servicio";
export const adminGuard: CanActivateFn = () => {
  const a = inject(AuthServicio),
    r = inject(Router);
  return a.esAdmin() ? true : r.createUrlTree(["/app/dashboard"]);
};
