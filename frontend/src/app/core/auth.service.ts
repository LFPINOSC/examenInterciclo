import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthUser } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'biblioteca_session';
  private readonly current = signal<AuthUser | null>(this.readSession());

  readonly user = this.current.asReadonly();
  readonly isAuthenticated = computed(() => this.current() !== null);
  readonly isAdmin = computed(() => this.current()?.role === 'ADMIN');

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(tap(session => this.saveSession(session)));
  }

  register(data: { username: string; fullName: string; email: string; password: string }): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(session => this.saveSession(session)));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.current.set(null);
  }

  token(): string | null {
    return this.current()?.token ?? null;
  }

  private saveSession(session: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.current.set(session);
  }

  private readSession(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
