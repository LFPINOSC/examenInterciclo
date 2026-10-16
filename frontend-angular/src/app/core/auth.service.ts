import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthRespuesta, Usuario } from './models';

const CLAVE = 'tecnosoporte.sesion';
interface Sesion { token: string; usuario: Usuario }
function recuperar(): Sesion | null {
  try {
    const valor = localStorage.getItem(CLAVE);
    if (!valor) return null;
    const sesion = JSON.parse(valor) as Sesion;
    if (typeof sesion?.token !== 'string' || !sesion.usuario?.rol) return null;
    // JWT usa segundos desde epoch; el payload se lee únicamente para vigencia visual.
    const parte = sesion.token.split('.')[1];
    if (parte) {
      const payload = JSON.parse(atob(parteAString(parte))) as {exp?:number};
      if (payload.exp && payload.exp * 1000 < Date.now()) {localStorage.removeItem(CLAVE);return null;}
    }
    return sesion;
  } catch {localStorage.removeItem(CLAVE);return null;}
}
function parteAString(valor: string): string { return valor.replace(/-/g,'+').replace(/_/g,'/'); }

@Injectable({providedIn:'root'})
export class AuthService {
  private readonly api = inject(ApiService);
  readonly sesion = signal<Sesion|null>(recuperar());
  readonly usuario = computed(() => this.sesion()?.usuario ?? null);
  readonly esAdmin = computed(() => this.usuario()?.rol === 'ADMIN');
  readonly autenticado = computed(() => !!this.sesion()?.token);
  readonly token = computed(() => this.sesion()?.token ?? null);

  login(correo:string, contrasena:string) {
    return this.api.crear<AuthRespuesta>('/auth/login',{correo,contrasena}).pipe(tap(r => {
      const sesion = {token:r.token,usuario:r.usuario};
      localStorage.setItem(CLAVE,JSON.stringify(sesion));
      this.sesion.set(sesion);
    }));
  }
  registro(datos: unknown) {return this.api.crear<Usuario>('/auth/registro',datos);}
  salir(): void {localStorage.removeItem(CLAVE);this.sesion.set(null);}
  actualizarUsuario(usuario: Usuario): void {
    const vieja = this.sesion();if (!vieja) return;
    const nueva = {...vieja,usuario};this.sesion.set(nueva);localStorage.setItem(CLAVE,JSON.stringify(nueva));
  }
}
