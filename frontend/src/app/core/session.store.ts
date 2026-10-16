import { Injectable, computed, signal } from '@angular/core';
import { Sesion } from '../models';

const CLAVE = 'hosp_session';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly sesion = signal<Sesion | null>(this.leer());

  readonly user = computed(() => this.sesion()?.user ?? null);
  readonly token = computed(() => this.sesion()?.token ?? '');

  establecer(sesion: Sesion | null): void {
    this.sesion.set(sesion);
    if (sesion) localStorage.setItem(CLAVE, JSON.stringify(sesion));
    else localStorage.removeItem(CLAVE);
  }

  private leer(): Sesion | null {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    try {
      return JSON.parse(crudo) as Sesion;
    } catch {
      localStorage.removeItem(CLAVE);
      return null;
    }
  }
}
