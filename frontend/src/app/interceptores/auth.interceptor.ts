// ==========================================
// INTERCEPTOR JWT - CONTROL DE CITAS MEDICAS
// ==========================================

// Permite interceptar solicitudes HTTP.
import { HttpInterceptorFn } from '@angular/common/http';

// Permite acceder al servicio de autenticacion.
import { inject } from '@angular/core';
import { Auth } from '../servicios/auth';

/**
 * Interceptor encargado de agregar el token JWT
 * a las peticiones dirigidas a nuestra API.
 *
 * FUNCIONAMIENTO:
 * 1. Obtiene el token del servicio Auth.
 * 2. Comprueba si la solicitud va al backend.
 * 3. Agrega Authorization: Bearer TOKEN.
 * 4. Envia la solicitud al servidor.
 *
 * El login no necesita token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Obtener el servicio de autenticacion.
  const auth = inject(Auth);

  // Recuperar el token almacenado.
  const token = auth.obtenerToken();

  // Solo agregar el token a nuestra API.
  const esBackend = req.url.startsWith(
    'http://localhost:8080/api/'
  );

  // No agregar token al endpoint de login.
  const esLogin = req.url.endsWith('/auth/login');

  if (token && esBackend && !esLogin) {

    // Clonar la solicitud y agregar el encabezado.
    const solicitudAutenticada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    // Continuar con la solicitud autenticada.
    return next(solicitudAutenticada);
  }

  // Continuar sin modificar las demas solicitudes.
  return next(req);
};