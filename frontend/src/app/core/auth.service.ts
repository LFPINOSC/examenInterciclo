import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from './modelos';
import { API_URL } from './utilidades';

const CLAVE_SESION = 'ordenes.sesion';

/**
 * Maneja la sesion: guarda el JWT que devuelve /auth/login en localStorage
 * y expone el estado (sin sesion, TECNICO o ADMIN) como senales para toda la app.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sesion = signal<LoginResponse | null>(this.leerSesion());

  readonly nombre = computed(() => this.sesion()?.nombre ?? '');
  readonly rol = computed(() => this.sesion()?.rol ?? null);
  readonly autenticado = computed(() => this.sesion() !== null);
  readonly esAdmin = computed(() => this.rol() === 'ADMIN');

  /** Devuelve el token vigente; si ya expiro, cierra la sesion y devuelve null. */
  get token(): string | null {
    const actual = this.sesion();
    if (actual && new Date(actual.expira).getTime() <= Date.now()) {
      this.cerrarSesion(false);
      return null;
    }
    return actual?.token ?? null;
  }

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, datos).pipe(
      tap((respuesta) => {
        localStorage.setItem(CLAVE_SESION, JSON.stringify(respuesta));
        this.sesion.set(respuesta);
      }),
    );
  }

  cerrarSesion(irAlLogin = true): void {
    localStorage.removeItem(CLAVE_SESION);
    this.sesion.set(null);
    if (irAlLogin) {
      this.router.navigateByUrl('/login');
    }
  }

  private leerSesion(): LoginResponse | null {
    try {
      const guardada = localStorage.getItem(CLAVE_SESION);
      if (!guardada) {
        return null;
      }
      const sesion = JSON.parse(guardada) as LoginResponse;
      return new Date(sesion.expira).getTime() > Date.now() ? sesion : null;
    } catch {
      return null;
    }
  }
}
