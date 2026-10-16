
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.obtenerToken();

  if (token && req.url.startsWith('http://localhost:8080/api/')) {
    const solicitud = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(solicitud);
  }

  return next(req);
};
