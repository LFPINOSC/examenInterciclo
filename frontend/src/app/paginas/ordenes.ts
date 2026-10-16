import { Component, effect, inject, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ConfirmacionService } from '../core/confirmacion.service';
import { EstadoOrden, Orden } from '../core/modelos';
import { NotificacionService } from '../core/notificacion.service';
import { OrdenService } from '../core/servicios';
import { ESTADOS, LISTA_ESTADOS, PRIORIDADES, mensajeError } from '../core/utilidades';

/** Lista de ordenes con filtros. Admin: todas y CRUD; tecnico: solo las suyas (la API lo garantiza). */
@Component({
  selector: 'app-ordenes',
  imports: [FormsModule, RouterLink, CurrencyPipe],
  template: `
    <div class="barra">
      <h1 class="titulo">Órdenes de trabajo</h1>
      @if (auth.esAdmin()) {
        <a class="boton" routerLink="/ordenes/nueva">+ Nueva orden</a>
      }
    </div>

    <div class="filtros">
      <input type="search" placeholder="Buscar por código o cliente" aria-label="Buscar" [ngModel]="q()" (ngModelChange)="q.set($event)" (keyup.enter)="cargar()" />
      <select aria-label="Filtrar por estado" [ngModel]="filtroEstado()" (ngModelChange)="filtroEstado.set($event); cargar()">
        <option value="">Todos los estados</option>
        @for (e of estados; track e) {
          <option [value]="e">{{ nombres[e] }}</option>
        }
      </select>
      <button type="button" class="boton boton-secundario" (click)="cargar()">Buscar</button>
    </div>

    @if (error()) {
      <p class="alerta alerta-error" role="alert">{{ error() }}</p>
    }

    <div class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr><th>Código</th><th>Cliente</th><th>Equipo</th><th>Técnico</th><th>Prioridad</th><th>Estado</th><th>Costo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          @for (o of ordenes(); track o.id) {
            <tr>
              <td>{{ o.codigo }}</td>
              <td>{{ o.cliente }}</td>
              <td>{{ o.equipo }}</td>
              <td>{{ o.tecnico ?? '—' }}</td>
              <td><span class="insignia prioridad-{{ o.prioridad }}">{{ prioridades[o.prioridad] }}</span></td>
              <td><span class="insignia estado-{{ o.estado }}">{{ nombres[o.estado] }}</span></td>
              <td>{{ o.costoTotal | currency: 'USD' }}</td>
              <td class="acciones-tabla">
                <a class="boton-mini" [routerLink]="['/ordenes', o.id]">Ver</a>
                @if (auth.esAdmin()) {
                  <a class="boton-mini" [routerLink]="['/ordenes', o.id, 'editar']">Editar</a>
                  <button type="button" class="boton-mini peligro" (click)="eliminar(o)">Eliminar</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="texto-suave">No hay órdenes que mostrar.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class Ordenes {
  protected readonly auth = inject(AuthService);
  private readonly ordenService = inject(OrdenService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  /** Viene del enlace del inicio (?estado=PENDIENTE) gracias a withComponentInputBinding. */
  readonly estado = input<string>('');

  protected readonly estados = LISTA_ESTADOS;
  protected readonly nombres = ESTADOS;
  protected readonly prioridades = PRIORIDADES;
  protected readonly ordenes = signal<Orden[]>([]);
  protected readonly q = signal('');
  protected readonly filtroEstado = signal<EstadoOrden | ''>('');
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      this.filtroEstado.set(this.estado() as EstadoOrden | '');
      this.cargar();
    });
  }

  protected cargar(): void {
    this.ordenService.listar(this.filtroEstado(), this.q()).subscribe({
      next: (lista) => {
        this.ordenes.set(lista);
        this.error.set('');
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected async eliminar(orden: Orden): Promise<void> {
    const ok = await this.confirmacion.confirmar({
      titulo: 'Eliminar orden',
      mensaje: `¿Eliminar la orden ${orden.codigo} y todas sus tareas? Esta acción no se puede deshacer.`,
    });
    if (!ok) {
      return;
    }
    this.ordenService.eliminar(orden.id).subscribe({
      next: () => {
        this.notificaciones.mostrar(`Orden ${orden.codigo} eliminada.`);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
