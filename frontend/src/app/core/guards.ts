import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SessionService } from "./session.service";
export const authGuard: CanActivateFn = () =>
  inject(SessionService).logged() || inject(Router).createUrlTree(["/login"]);
export const adminGuard: CanActivateFn = () => {
  const s = inject(SessionService),
    r = inject(Router);
  return !s.logged()
    ? r.createUrlTree(["/login"])
    : s.isAdmin() || r.createUrlTree(["/habitaciones"]);
};
