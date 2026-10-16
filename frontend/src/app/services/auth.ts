import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Datos que se envian para iniciar sesion
export interface LoginDTO {
  username: string;
  password: string;
}

// Datos que se envian para registrar un usuario
export interface RegistroDTO {
  username: string;
  password: string;
}

// Respuesta que devuelve Spring Boot
export interface AuthRespuesta {
  token: string;
  tipo: string;
  username: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  // Servicio HTTP para comunicarse con Spring Boot
  private http = inject(HttpClient);

  // URL de autenticacion de nuestra API
  private apiUrl = 'http://localhost:8080/api/auth';

  // ==========================================
  // INICIAR SESION
  // ==========================================

  login(datos: LoginDTO): Observable<AuthRespuesta> {

    return this.http.post<AuthRespuesta>(
      `${this.apiUrl}/login`,
      datos
    ).pipe(

      // Guardar los datos al iniciar sesion correctamente
      tap(respuesta => {
        this.guardarSesion(respuesta);
      })

    );
  }

  // ==========================================
  // REGISTRAR USUARIO
  // ==========================================

  registro(datos: RegistroDTO): Observable<AuthRespuesta> {

    return this.http.post<AuthRespuesta>(
      `${this.apiUrl}/registro`,
      datos
    ).pipe(

      // Guardar el token del nuevo usuario
      tap(respuesta => {
        this.guardarSesion(respuesta);
      })

    );
  }

  // ==========================================
  // GUARDAR SESION
  // ==========================================

  private guardarSesion(respuesta: AuthRespuesta): void {

    if (typeof window === 'undefined') {
      return;
    }

    sessionStorage.setItem('token', respuesta.token);
    sessionStorage.setItem('username', respuesta.username);
    sessionStorage.setItem('rol', respuesta.rol);
  }

  // ==========================================
  // OBTENER TOKEN JWT
  // ==========================================

  obtenerToken(): string | null {

    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem('token');
  }

  // ==========================================
  // OBTENER USUARIO AUTENTICADO
  // ==========================================

  obtenerUsuario(): string | null {

    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem('username');
  }

  // ==========================================
  // OBTENER ROL
  // ==========================================

  obtenerRol(): string | null {

    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem('rol');
  }

  // ==========================================
  // VERIFICAR SI EXISTE SESION VIGENTE
  // ==========================================

  estaAutenticado(): boolean {

    const token = this.obtenerToken();

    if (!token) {
      return false;
    }

    try {
      // Leer la fecha de expiracion del JWT
      const partes = token.split('.');

      if (partes.length !== 3) {
        this.cerrarSesion();
        return false;
      }

      const payload = JSON.parse(
        atob(
          partes[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );

      if (
        typeof payload.exp !== 'number' ||
        payload.exp * 1000 <= Date.now()
      ) {
        this.cerrarSesion();
        return false;
      }

      return true;

    } catch {
      this.cerrarSesion();
      return false;
    }
  }

  // ==========================================
  // VERIFICAR SI EL USUARIO ES ADMIN
  // ==========================================

  esAdmin(): boolean {

    return this.estaAutenticado() &&
           this.obtenerRol() === 'ADMIN';
  }

  // ==========================================
  // CERRAR SESION
  // ==========================================

  cerrarSesion(): void {

    if (typeof window === 'undefined') {
      return;
    }

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('rol');
  }

}