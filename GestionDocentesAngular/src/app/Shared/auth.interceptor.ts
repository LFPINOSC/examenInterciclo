import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthServicio } from "../Servicios/auth-servicio";
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const t = inject(AuthServicio).token();
  return next(
    t ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : req,
  );
};
