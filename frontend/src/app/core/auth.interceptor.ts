import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionStore } from './session.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(SessionStore);
  const router = inject(Router);
  const token = sesion.token();
  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        sesion.establecer(null);
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
