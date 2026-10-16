import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req,next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const peticion = token && req.url.startsWith('/api/') ? req.clone({setHeaders:{Authorization:`Bearer ${token}`}}) : req;
  return next(peticion).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/login')) {
      auth.salir();
      void router.navigateByUrl('/acceso');
    }
    return throwError(() => error);
  }));
};
