// ==========================================
// SERVICIO DE AUTENTICACION
// SISTEMA DE CONTROL DE CITAS MEDICAS
// ==========================================

// Permite crear servicios e inyectar dependencias.
import { Injectable, inject } from '@angular/core';

// Permite enviar solicitudes HTTP al backend.
import { HttpClient } from '@angular/common/http';

// Permite manejar respuestas asincronas
// y ejecutar acciones cuando llegan los datos.
import { Observable, tap } from 'rxjs';

// ==========================================
// MODELO DE RESPUESTA DEL LOGIN
// ==========================================

/**
 * Representa los datos que devuelve
 * AuthController.java desde Spring Boot.
 */
export interface LoginRespuesta {
  id: number;
  username: string;
  rol: string;
  activo: boolean;
  token: string;
  tipo: string;
  expiresIn: number;
  mensaje: string;
}

/**
 * SERVICIO AUTH
 *
 * Administra el inicio y cierre de sesion.
 *
 * Funciones:
 * - Iniciar sesion mediante la API REST.
 * - Guardar temporalmente el token JWT.
 * - Obtener nombre y rol del usuario.
 * - Verificar la expiracion de la sesion.
 * - Cerrar sesion.
 */
@Injectable({
  providedIn: 'root'
})
export class Auth {

  // Inyectar HttpClient para consumir la API.
  private readonly http = inject(HttpClient);

  // Direccion del backend Spring Boot.
  private readonly apiUrl =
    'http://localhost:8080/api/auth';

  // ==========================================
  // 1. INICIAR SESION
  // ==========================================

  /**
   * Envia las credenciales al backend.
   *
   * POST /api/auth/login
   *
   * Recibe el token JWT y los datos del usuario.
   */
  login(
    username: string,
    password: string
  ): Observable<LoginRespuesta> {

    return this.http.post<LoginRespuesta>(
      `${this.apiUrl}/login`,
      { username, password }
    ).pipe(

      tap((respuesta: LoginRespuesta) => {

        // Guardar el token recibido.
        sessionStorage.setItem(
          'token',
          respuesta.token
        );

        // Guardar el nombre del usuario.
        sessionStorage.setItem(
          'username',
          respuesta.username
        );

        // Guardar el rol del usuario.
        sessionStorage.setItem(
          'rol',
          respuesta.rol
        );

        // Calcular la fecha de expiracion.
        const expiracion =
          Date.now() + respuesta.expiresIn * 1000;

        sessionStorage.setItem(
          'expiracion',
          expiracion.toString()
        );
      })
    );
  }

  // ==========================================
  // 2. OBTENER TOKEN
  // ==========================================

  /**
   * Obtiene el token JWT almacenado.
   */
  obtenerToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // ==========================================
  // 3. OBTENER USUARIO
  // ==========================================

  /**
   * Obtiene el username de la sesion.
   */
  obtenerUsuario(): string {
    return sessionStorage.getItem('username') || '';
  }

  // ==========================================
  // 4. OBTENER ROL
  // ==========================================

  /**
   * Devuelve ADMIN o RECEPCIONISTA.
   */
  obtenerRol(): string {
    return sessionStorage.getItem('rol') || '';
  }

  // ==========================================
  // 5. VERIFICAR AUTENTICACION
  // ==========================================

  /**
   * Comprueba que exista un token JWT
   * y que no haya expirado.
   */
  estaAutenticado(): boolean {

    const token = this.obtenerToken();

    const expiracion = Number(
      sessionStorage.getItem('expiracion')
    );

    // No permitir sesiones sin token valido.
    if (
      !token ||
      !expiracion ||
      Date.now() >= expiracion
    ) {

      this.cerrarSesion();

      return false;
    }

    return true;
  }

  // ==========================================
  // 6. COMPROBAR ROL
  // ==========================================

  /**
   * Comprueba si el usuario autenticado
   * tiene el rol solicitado.
   */
  tieneRol(rol: string): boolean {

    return (
      this.estaAutenticado() &&
      this.obtenerRol() === rol
    );
  }

  // ==========================================
  // 7. CERRAR SESION
  // ==========================================

  /**
   * Elimina los datos de autenticacion
   * almacenados en el navegador.
   */
  cerrarSesion(): void {

    sessionStorage.removeItem('token');

    sessionStorage.removeItem('username');

    sessionStorage.removeItem('rol');

    sessionStorage.removeItem('expiracion');
  }

}