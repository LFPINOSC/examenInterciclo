import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { SessionService } from "./session.service";
import { environment } from "../../environments/environment";
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const s = inject(SessionService),
    router = inject(Router);
  const propia = req.url.startsWith(environment.apiUrl + "/");
  const publica =
    req.url.endsWith("/auth/login") || req.url.endsWith("/auth/registro");
  if (propia && !publica && s.token())
    req = req.clone({ setHeaders: { Authorization: "Bearer " + s.token() } });
  return next(req).pipe(
    catchError((e) => {
      if (propia && !publica && e.status === 401) {
        s.clear();
        router.navigate(["/login"], { queryParams: { expirada: 1 } });
      }
      return throwError(() => e);
    }),
  );
};
