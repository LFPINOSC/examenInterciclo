import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { EstadoOrden } from '../core/modelos';
import { OrdenService } from '../core/servicios';
import { ESTADOS, LISTA_ESTADOS, mensajeError } from '../core/utilidades';

/** Inicio: cantidad de ordenes por estado (el tecnico ve solo las suyas). */
@Component({
  selector: 'app-panel',
  imports: [RouterLink],
  template: `
    <h1 class="titulo">Hola, {{ auth.nombre() }}</h1>
    <p class="texto-suave">
      {{ auth.esAdmin() ? 'Resumen de todas las órdenes de trabajo.' : 'Resumen de las órdenes asignadas a usted.' }}
    </p>
    @if (error()) {
      <p class="alerta alerta-error" role="alert">{{ error() }}</p>
    }
    <div class="resumen">
      @for (e of estados; track e) {
        <a class="tarjeta dato" routerLink="/ordenes" [queryParams]="{ estado: e }">
          <strong>{{ cantidades()[e] ?? 0 }}</strong>
          <span class="insignia estado-{{ e }}">{{ nombres[e] }}</span>
        </a>
      }
    </div>
  `,
})
export class Panel {
  protected readonly auth = inject(AuthService);
  protected readonly estados = LISTA_ESTADOS;
  protected readonly nombres = ESTADOS;
  protected readonly cantidades = signal<Partial<Record<EstadoOrden, number>>>({});
  protected readonly error = signal('');

  constructor() {
    inject(OrdenService).resumen().subscribe({
      next: (r) => this.cantidades.set(r.porEstado),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
