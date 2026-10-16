import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthUser } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Clave exclusiva del examen para no reutilizar sesiones de otros proyectos en localhost:4200.
  private readonly storageKey = 'examen_interciclo_biblioteca_braddley_session_v2';
  private readonly current = signal<AuthUser | null>(this.readSession());

  readonly user = this.current.asReadonly();
  readonly isAuthenticated = computed(() => this.current() !== null);
  readonly isAdmin = computed(() => this.current()?.role === 'ADMIN');

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/auth/login`, {
      username: username.trim(),
      password
    }).pipe(tap(session => this.saveSession(session)));
  }

  register(data: { username: string; fullName: string; email: string; password: string }): Observable<AuthUser> {
    const payload = {
      username: data.username.trim(),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      password: data.password
    };
    return this.http.post<AuthUser>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap(session => this.saveSession(session)));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    // Limpia también la clave del primer borrador para evitar sesiones cruzadas.
    localStorage.removeItem('biblioteca_session');
    this.current.set(null);
  }

  token(): string | null {
    const session = this.current();
    if (!session) return null;
    if (this.isTokenExpired(session.token)) {
      this.logout();
      return null;
    }
    return session.token;
  }

  invalidateSession(): void {
    this.logout();
  }

  private saveSession(session: AuthUser): void {
    localStorage.removeItem('biblioteca_session');
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.current.set(session);
  }

  private readSession(): AuthUser | null {
    // Nunca importamos automáticamente la sesión del proyecto anterior.
    localStorage.removeItem('biblioteca_session');
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw) as AuthUser;
      if (!session?.token || !session?.username || this.isTokenExpired(session.token)) {
        localStorage.removeItem(this.storageKey);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4 !== 0) payload += '=';

      const decoded = JSON.parse(atob(payload)) as { exp?: number };
      return typeof decoded.exp !== 'number' || decoded.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
