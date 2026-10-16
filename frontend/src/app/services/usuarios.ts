import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// ROLES DISPONIBLES
// ==========================================

export type RolUsuario = 'ADMIN' | 'USER';

// ==========================================
// MODELO DE USUARIO
// ==========================================

// Coincide con UsuarioResumenDTO.java.
// No contiene contraseñas por seguridad.
export interface Usuario {
  id: number;
  username: string;
  rol: RolUsuario;
  activo: boolean;
}

// ==========================================
// SERVICIO HTTP DE USUARIOS
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class UsuariosApi {

  // Cliente HTTP de Angular
  private http = inject(HttpClient);

  // Endpoint protegido para administradores
  private apiUrl = 'http://localhost:8080/api/usuarios';

  // GET - Listar todos los usuarios
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // GET - Buscar usuario por ID
  buscar(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${this.apiUrl}/${id}`
    );
  }

  // PATCH - Cambiar rol del usuario
  cambiarRol(id: number, rol: RolUsuario): Observable<Usuario> {
    return this.http.patch<Usuario>(
      `${this.apiUrl}/${id}/rol`,
      { rol }
    );
  }

  // PATCH - Activar usuario
  activar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(
      `${this.apiUrl}/${id}/activar`,
      {}
    );
  }

  // PATCH - Desactivar usuario
  desactivar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(
      `${this.apiUrl}/${id}/desactivar`,
      {}
    );
  }
}