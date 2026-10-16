import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

/** Barra superior: el menu cambia segun el rol (el TECNICO solo ve Inicio y Ordenes). */
@Component({
  selector: 'app-encabezado',
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (auth.autenticado()) {
      <header class="encabezado">
        <a class="marca" routerLink="/">Órdenes de trabajo</a>
        <nav class="menu" aria-label="Secciones">
          <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
          <a routerLink="/ordenes" routerLinkActive="activo">Órdenes</a>
          @if (auth.esAdmin()) {
            <a routerLink="/clientes" routerLinkActive="activo">Clientes</a>
            <a routerLink="/equipos" routerLinkActive="activo">Equipos</a>
            <a routerLink="/usuarios" routerLinkActive="activo">Usuarios</a>
          }
        </nav>
        <span class="sesion">{{ auth.nombre() }} <small>({{ auth.rol() }})</small></span>
        <button type="button" class="boton boton-secundario" (click)="auth.cerrarSesion()">Salir</button>
      </header>
    }
  `,
})
export class Encabezado {
  protected readonly auth = inject(AuthService);
}
