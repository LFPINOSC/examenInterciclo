// ==========================================
// GUARD DE AUTENTICACION
// SISTEMA DE CONTROL DE CITAS MEDICAS
// ==========================================

// Permite proteger las rutas de Angular.
import { CanActivateFn, Router } from '@angular/router';

// Permite utilizar los servicios de Angular.
import { inject } from '@angular/core';

// Servicio encargado del login y token JWT.
import { Auth } from '../servicios/auth';

/**
 * ==========================================
 * AUTH GUARD
 * ==========================================
 *
 * Este guard protege las pantallas privadas
 * del sistema de Control de Citas Medicas.
 *
 * FUNCIONAMIENTO:
 *
 * 1. Comprueba si existe una sesion activa.
 * 2. Verifica que el token no haya expirado.
 * 3. Permite acceder a la ruta protegida.
 * 4. Redirige al login si no hay sesion.
 *
 * IMPORTANTE:
 * La seguridad definitiva se verifica
 * en el backend mediante Spring Security.
 */
export const authGuard: CanActivateFn = (route, state) => {

  // ========================================
  // INYECTAR SERVICIOS
  // ========================================

  // Servicio que administra la autenticacion.
  const auth = inject(Auth);

  // Servicio encargado de la navegacion.
  const router = inject(Router);

  // ========================================
  // VERIFICAR AUTENTICACION
  // ========================================

  // Comprueba si existe un token vigente.
  if (auth.estaAutenticado()) {

    // Permitir el acceso a la pantalla.
    return true;
  }

  // ========================================
  // REDIRIGIR AL LOGIN
  // ========================================

  // Si no hay sesion, impedir el acceso
  // y enviar al usuario al login.
  return router.createUrlTree(['/login']);

};