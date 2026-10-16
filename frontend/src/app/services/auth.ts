import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/**
 * Estructura de la respuesta enviada
 * por Spring Boot después del login.
 */
export interface AuthResponse {

  token: string;
  id: number;
  nombre: string;
  correo: string;
  rol: 'ADMIN' | 'ESTUDIANTE';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Permite realizar peticiones HTTP
  private http = inject(HttpClient);

  // URL base de autenticación del backend
  private readonly API =
    'http://localhost:8080/api/auth';

  /**
   * Envía las credenciales al backend.
   */
  login(
    correo: string,
    password: string
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.API}/login`,
        {
          correo,
          password
        }
      )
      .pipe(

        // Si el login funciona,
        // guardamos la sesión.
        tap(respuesta => {
          this.guardarSesion(respuesta);
        })
      );
  }

  /**
   * Guarda los datos de sesión
   * en el navegador.
   */
  private guardarSesion(
    respuesta: AuthResponse
  ): void {

    localStorage.setItem(
      'token',
      respuesta.token
    );

    localStorage.setItem(
      'rol',
      respuesta.rol
    );

    localStorage.setItem(
      'nombre',
      respuesta.nombre
    );

    localStorage.setItem(
      'correo',
      respuesta.correo
    );

    localStorage.setItem(
      'usuarioId',
      respuesta.id.toString()
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getNombre(): string | null {
    return localStorage.getItem('nombre');
  }

  getCorreo(): string | null {
    return localStorage.getItem('correo');
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  /**
   * Cierra la sesión.
   */
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    localStorage.removeItem('correo');
    localStorage.removeItem('usuarioId');
  }
}