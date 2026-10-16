
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  nombre: string;
  correo: string;
  rol: 'ADMIN' | 'ENFERMERO';
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';

  usuario = signal<LoginResponse | null>(this.leerUsuario());

  login(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { correo, password }
    ).pipe(
      tap(respuesta => {
        sessionStorage.setItem('token', respuesta.token);
        sessionStorage.setItem('usuario', JSON.stringify(respuesta));
        this.usuario.set(respuesta);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this.usuario.set(null);
  }

  obtenerToken(): string | null {
    return sessionStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken() && !!this.usuario();
  }

  obtenerRol(): 'ADMIN' | 'ENFERMERO' | null {
    return this.usuario()?.rol ?? null;
  }

  private leerUsuario(): LoginResponse | null {
    try {
      const datos = sessionStorage.getItem('usuario');
      return datos ? JSON.parse(datos) as LoginResponse : null;
    } catch {
      return null;
    }
  }
}
