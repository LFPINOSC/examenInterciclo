import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Sesion } from '../models';
import { SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SessionStore);

  readonly user = this.sesion.user;
  readonly token = this.sesion.token;

  estaAutenticado(): boolean {
    return Boolean(this.token());
  }

  tieneRol(...roles: string[]): boolean {
    return roles.includes(this.user()?.rol ?? '');
  }

  login(correo: string, password: string) {
    return this.http.post<Sesion>('/api/auth/login', { correo, password }).pipe(
      tap((respuesta) => this.sesion.establecer(respuesta))
    );
  }

  salir(): void {
    this.sesion.establecer(null);
  }
}
