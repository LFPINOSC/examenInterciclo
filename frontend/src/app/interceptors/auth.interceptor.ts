import { HttpInterceptorFn } from '@angular/common/http';

// Agrega el token JWT a las solicitudes protegidas
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = typeof window !== 'undefined'
    ? sessionStorage.getItem('token')
    : null;

  // Solo enviar el token a nuestra API local
  // No agregarlo a registro ni login
  const esApi = req.url.startsWith(
    'http://localhost:8080/api/'
  );

  const esAuth = req.url.startsWith(
    'http://localhost:8080/api/auth/'
  );

  if (token && esApi && !esAuth) {

    const solicitud = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(solicitud);
  }

  return next(req);
};