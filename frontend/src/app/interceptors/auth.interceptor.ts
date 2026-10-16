import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor que agrega el token JWT
 * a todas las peticiones enviadas al backend.
 */
export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const token = localStorage.getItem('token');

  if (token) {

    const requestConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(requestConToken);
  }

  return next(req);
};