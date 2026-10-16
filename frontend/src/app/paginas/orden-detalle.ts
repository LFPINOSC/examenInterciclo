import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ConfirmacionService } from '../core/confirmacion.service';
import { EstadoOrden, Orden, Tarea } from '../core/modelos';
import { NotificacionService } from '../core/notificacion.service';
import { OrdenService } from '../core/servicios';
import { ESTADOS, LISTA_ESTADOS, PRIORIDADES, errorCampo, mensajeError } from '../core/utilidades';

/**
 * Detalle de una orden: datos, cambio de estado y CRUD de sus tareas.
 * Lo puede usar el ADMIN o el tecnico asignado (la API rechaza con 403 a cualquier otro).
 */
@Component({
  selector: 'app-orden-detalle',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    <a routerLink="/ordenes" class="enlace-volver">&larr; Volver a órdenes</a>
    @if (error()) {
      <p class="alerta alerta-error" role="alert">{{ error() }}</p>
    }
    @if (orden(); as o) {
      <div class="barra">
        <h1 class="titulo">{{ o.codigo }}</h1>
        <div class="grupo">
          <label for="estado" class="sr-only">Estado</label>
          <select id="estado" [ngModel]="o.estado" (ngModelChange)="cambiarEstado($event)">
            @for (e of estados; track e) {
              <option [value]="e">{{ nombres[e] }}</option>
            }
          </select>
          @if (auth.esAdmin()) {
            <a class="boton boton-secundario" [routerLink]="['/ordenes', o.id, 'editar']">Editar</a>
          }
        </div>
      </div>

      <div class="tarjeta detalle">
        <div><span>Cliente</span>{{ o.cliente }}</div>
        <div><span>Equipo</span>{{ o.equipo }}</div>
        <div><span>Técnico</span>{{ o.tecnico ?? 'Sin asignar' }}</div>
        <div><span>Prioridad</span><span class="insignia prioridad-{{ o.prioridad }}">{{ prioridades[o.prioridad] }}</span></div>
        <div><span>Estado</span><span class="insignia estado-{{ o.estado }}">{{ nombres[o.estado] }}</span></div>
        <div><span>Ingreso</span>{{ o.fechaIngreso }}</div>
        <div><span>Entrega</span>{{ o.fechaEntrega ?? '—' }}</div>
        <div><span>Costo total</span><strong>{{ o.costoTotal | currency: 'USD' }}</strong></div>
        <p class="descripcion"><span>Problema reportado</span>{{ o.descripcion }}</p>
      </div>

      <h2 class="subtitulo">Tareas</h2>
      <div class="dos-columnas">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead><tr><th>Hecha</th><th>Descripción</th><th>Horas</th><th>Costo</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (t of o.tareas; track t.id) {
                <tr [class.seleccionada]="editandoId() === t.id">
                  <td><input type="checkbox" [checked]="t.completada" [attr.aria-label]="'Marcar como hecha: ' + t.descripcion" (change)="alternar(t)" /></td>
                  <td [class.tachado]="t.completada">{{ t.descripcion }}</td>
                  <td>{{ t.horas }}</td>
                  <td>{{ t.costo | currency: 'USD' }}</td>
                  <td class="acciones-tabla">
                    <button type="button" class="boton-mini" (click)="editar(t)">Editar</button>
                    <button type="button" class="boton-mini peligro" (click)="eliminar(t)">Quitar</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="texto-suave">Aún no hay tareas registradas.</td></tr>
              }
            </tbody>
          </table>
        </div>

        <form class="tarjeta formulario" [formGroup]="form" (ngSubmit)="guardarTarea()" novalidate>
          <h3 class="subtitulo">{{ editandoId() ? 'Editar tarea' : 'Nueva tarea' }}</h3>
          <label for="t-desc">Descripción *</label>
          <input id="t-desc" formControlName="descripcion" maxlength="200" />
          <small class="error-campo">{{ err('descripcion', 'La descripción') }}</small>
          <label for="t-horas">Horas *</label>
          <input id="t-horas" type="number" step="0.25" min="0" formControlName="horas" />
          <small class="error-campo">{{ err('horas', 'Las horas') }}</small>
          <label for="t-costo">Costo (USD) *</label>
          <input id="t-costo" type="number" step="0.01" min="0" formControlName="costo" />
          <small class="error-campo">{{ err('costo', 'El costo') }}</small>
          <div class="acciones">
            <button type="submit" class="boton">{{ editandoId() ? 'Guardar cambios' : 'Agregar tarea' }}</button>
            @if (editandoId()) {
              <button type="button" class="boton boton-secundario" (click)="limpiar()">Cancelar</button>
            }
          </div>
        </form>
      </div>
    }
  `,
})
export class OrdenDetalle implements OnInit {
  /** Viene de la ruta ordenes/:id (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly auth = inject(AuthService);
  private readonly ordenService = inject(OrdenService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly estados = LISTA_ESTADOS;
  protected readonly nombres = ESTADOS;
  protected readonly prioridades = PRIORIDADES;
  protected readonly orden = signal<Orden | null>(null);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    descripcion: ['', [Validators.required, Validators.maxLength(200)]],
    horas: [0, [Validators.required, Validators.min(0)]],
    costo: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected err(campo: 'descripcion' | 'horas' | 'costo', etiqueta: string): string {
    return errorCampo(this.form.controls[campo], etiqueta);
  }

  private cargar(): void {
    this.ordenService.buscar(Number(this.id())).subscribe({
      next: (o) => {
        this.orden.set(o);
        this.error.set('');
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected cambiarEstado(estado: EstadoOrden): void {
    this.ordenService.cambiarEstado(Number(this.id()), estado).subscribe({
      next: (o) => {
        this.orden.set(o);
        this.notificaciones.mostrar(`Estado actualizado a "${ESTADOS[estado]}".`);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargar();
      },
    });
  }

  protected editar(t: Tarea): void {
    this.editandoId.set(t.id);
    this.form.setValue({ descripcion: t.descripcion, horas: t.horas, costo: t.costo });
  }

  protected limpiar(): void {
    this.editandoId.set(null);
    this.form.reset({ descripcion: '', horas: 0, costo: 0 });
  }

  protected guardarTarea(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const tareaId = this.editandoId();
    const actual = this.orden()!.tareas.find((t) => t.id === tareaId);
    const datos = { ...this.form.getRawValue(), completada: actual?.completada ?? false };
    const peticion = tareaId
      ? this.ordenService.actualizarTarea(tareaId, datos)
      : this.ordenService.agregarTarea(Number(this.id()), datos);
    peticion.subscribe({
      next: () => {
        this.notificaciones.mostrar('Tarea guardada.');
        this.limpiar();
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected alternar(t: Tarea): void {
    this.ordenService
      .actualizarTarea(t.id, { descripcion: t.descripcion, horas: t.horas, costo: t.costo, completada: !t.completada })
      .subscribe({ next: () => this.cargar(), error: (e) => this.error.set(mensajeError(e)) });
  }

  protected async eliminar(t: Tarea): Promise<void> {
    const ok = await this.confirmacion.confirmar({
      titulo: 'Quitar tarea',
      mensaje: `¿Quitar la tarea "${t.descripcion}"?`,
      textoAceptar: 'Quitar',
    });
    if (!ok) {
      return;
    }
    this.ordenService.eliminarTarea(t.id).subscribe({
      next: () => {
        this.notificaciones.mostrar('Tarea eliminada.');
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
