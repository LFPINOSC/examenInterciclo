import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmacionService } from '../core/confirmacion.service';
import { Cliente, Equipo } from '../core/modelos';
import { NotificacionService } from '../core/notificacion.service';
import { ClienteService, EquipoService } from '../core/servicios';
import { errorCampo, mensajeError } from '../core/utilidades';

/** CRUD de /api/equipos (solo ADMIN). Cada equipo pertenece a un cliente. */
@Component({
  selector: 'app-equipos',
  imports: [ReactiveFormsModule],
  template: `
    <h1 class="titulo">Equipos</h1>
    @if (error()) {
      <p class="alerta alerta-error" role="alert">{{ error() }}</p>
    }
    <div class="dos-columnas">
      <div class="tabla-contenedor">
        <table class="tabla">
          <thead><tr><th>Cliente</th><th>Tipo</th><th>Marca</th><th>Modelo</th><th>Serie</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (e of equipos(); track e.id) {
              <tr [class.seleccionada]="editandoId() === e.id">
                <td>{{ e.cliente }}</td><td>{{ e.tipo }}</td><td>{{ e.marca }}</td><td>{{ e.modelo }}</td><td>{{ e.serie }}</td>
                <td class="acciones-tabla">
                  <button type="button" class="boton-mini" (click)="editar(e)">Editar</button>
                  <button type="button" class="boton-mini peligro" (click)="eliminar(e)">Eliminar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="texto-suave">Sin equipos.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <form class="tarjeta formulario" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
        <h2 class="subtitulo">{{ editandoId() ? 'Editar equipo' : 'Nuevo equipo' }}</h2>
        <label for="e-cliente">Cliente *</label>
        <select id="e-cliente" formControlName="clienteId">
          <option [ngValue]="null">-- Seleccione --</option>
          @for (c of clientes(); track c.id) {
            <option [ngValue]="c.id">{{ c.nombre }}</option>
          }
        </select>
        <small class="error-campo">{{ err('clienteId', 'El cliente') }}</small>
        <label for="e-tipo">Tipo * (laptop, impresora...)</label>
        <input id="e-tipo" formControlName="tipo" maxlength="60" />
        <small class="error-campo">{{ err('tipo', 'El tipo') }}</small>
        <label for="e-marca">Marca</label>
        <input id="e-marca" formControlName="marca" maxlength="60" />
        <label for="e-modelo">Modelo</label>
        <input id="e-modelo" formControlName="modelo" maxlength="60" />
        <label for="e-serie">Número de serie</label>
        <input id="e-serie" formControlName="serie" maxlength="60" />
        <div class="acciones">
          <button type="submit" class="boton">Guardar</button>
          @if (editandoId()) {
            <button type="button" class="boton boton-secundario" (click)="limpiar()">Cancelar</button>
          }
        </div>
      </form>
    </div>
  `,
})
export class Equipos {
  private readonly equipoService = inject(EquipoService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly equipos = signal<Equipo[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).group({
    clienteId: [null as number | null, Validators.required],
    tipo: ['', [Validators.required, Validators.maxLength(60)]],
    marca: [''],
    modelo: [''],
    serie: [''],
  });

  constructor() {
    inject(ClienteService).listar().subscribe({ next: (l) => this.clientes.set(l), error: (e) => this.error.set(mensajeError(e)) });
    this.cargar();
  }

  protected err(campo: 'clienteId' | 'tipo', etiqueta: string): string {
    return errorCampo(this.form.controls[campo], etiqueta);
  }

  private cargar(): void {
    this.equipoService.listar().subscribe({ next: (l) => this.equipos.set(l), error: (e) => this.error.set(mensajeError(e)) });
  }

  protected editar(e: Equipo): void {
    this.editandoId.set(e.id);
    this.form.setValue({ clienteId: e.clienteId, tipo: e.tipo, marca: e.marca ?? '', modelo: e.modelo ?? '', serie: e.serie ?? '' });
  }

  protected limpiar(): void {
    this.editandoId.set(null);
    this.form.reset({ clienteId: null, tipo: '', marca: '', modelo: '', serie: '' });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos = { clienteId: v.clienteId!, tipo: v.tipo!, marca: v.marca || null, modelo: v.modelo || null, serie: v.serie || null };
    const id = this.editandoId();
    (id ? this.equipoService.actualizar(id, datos) : this.equipoService.crear(datos)).subscribe({
      next: () => {
        this.notificaciones.mostrar('Equipo guardado.');
        this.error.set('');
        this.limpiar();
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected async eliminar(e: Equipo): Promise<void> {
    const ok = await this.confirmacion.confirmar({
      titulo: 'Eliminar equipo',
      mensaje: `¿Eliminar el equipo "${e.tipo} ${e.marca ?? ''}"?`,
    });
    if (!ok) {
      return;
    }
    this.equipoService.eliminar(e.id).subscribe({
      next: () => {
        this.notificaciones.mostrar('Equipo eliminado.');
        this.error.set('');
        this.cargar();
      },
      // 409 si el equipo tiene ordenes
      error: (err) => this.error.set(mensajeError(err)),
    });
  }
}
