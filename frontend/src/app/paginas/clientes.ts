import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmacionService } from '../core/confirmacion.service';
import { Cliente } from '../core/modelos';
import { NotificacionService } from '../core/notificacion.service';
import { ClienteService } from '../core/servicios';
import { cedulaValida, errorCampo, mensajeError } from '../core/utilidades';

/** CRUD de /api/clientes (solo ADMIN): tabla a la izquierda, formulario a la derecha. */
@Component({
  selector: 'app-clientes',
  imports: [ReactiveFormsModule],
  template: `
    <h1 class="titulo">Clientes</h1>
    @if (error()) {
      <p class="alerta alerta-error" role="alert">{{ error() }}</p>
    }
    <div class="dos-columnas">
      <div>
        <div class="filtros">
          <input type="search" placeholder="Buscar por nombre o cédula" aria-label="Buscar cliente" #buscar (keyup.enter)="cargar(buscar.value)" />
          <button type="button" class="boton boton-secundario" (click)="cargar(buscar.value)">Buscar</button>
        </div>
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead><tr><th>Nombre</th><th>Cédula</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (c of clientes(); track c.id) {
                <tr [class.seleccionada]="editandoId() === c.id">
                  <td>{{ c.nombre }}</td><td>{{ c.cedula }}</td><td>{{ c.telefono }}</td><td>{{ c.correo }}</td>
                  <td class="acciones-tabla">
                    <button type="button" class="boton-mini" (click)="editar(c)">Editar</button>
                    <button type="button" class="boton-mini peligro" (click)="eliminar(c)">Eliminar</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="texto-suave">Sin clientes.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <form class="tarjeta formulario" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
        <h2 class="subtitulo">{{ editandoId() ? 'Editar cliente' : 'Nuevo cliente' }}</h2>
        <label for="c-nombre">Nombre *</label>
        <input id="c-nombre" formControlName="nombre" maxlength="120" />
        <small class="error-campo">{{ err('nombre', 'El nombre') }}</small>
        <label for="c-cedula">Cédula *</label>
        <input id="c-cedula" formControlName="cedula" maxlength="10" inputmode="numeric" />
        <small class="error-campo">{{ err('cedula', 'La cédula') }}</small>
        <label for="c-tel">Teléfono</label>
        <input id="c-tel" formControlName="telefono" maxlength="10" inputmode="numeric" />
        <small class="error-campo">{{ err('telefono', 'El teléfono') }}</small>
        <label for="c-correo">Correo</label>
        <input id="c-correo" type="email" formControlName="correo" maxlength="120" />
        <small class="error-campo">{{ err('correo', 'El correo') }}</small>
        <label for="c-dir">Dirección</label>
        <input id="c-dir" formControlName="direccion" maxlength="200" />
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
export class Clientes {
  private readonly clienteService = inject(ClienteService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    cedula: ['', [Validators.required, cedulaValida]],
    telefono: ['', Validators.pattern(/^(\d{7,10})?$/)],
    correo: ['', [Validators.email, Validators.maxLength(120)]],
    direccion: ['', Validators.maxLength(200)],
  });

  constructor() {
    this.cargar();
  }

  protected err(campo: keyof Clientes['form']['controls'], etiqueta: string): string {
    return errorCampo(this.form.controls[campo], etiqueta);
  }

  protected cargar(q = ''): void {
    this.clienteService.listar(q).subscribe({
      next: (l) => this.clientes.set(l),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected editar(c: Cliente): void {
    this.editandoId.set(c.id);
    this.form.setValue({
      nombre: c.nombre,
      cedula: c.cedula,
      telefono: c.telefono ?? '',
      correo: c.correo ?? '',
      direccion: c.direccion ?? '',
    });
  }

  protected limpiar(): void {
    this.editandoId.set(null);
    this.form.reset();
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos = { ...v, telefono: v.telefono || null, correo: v.correo || null, direccion: v.direccion || null };
    const id = this.editandoId();
    (id ? this.clienteService.actualizar(id, datos) : this.clienteService.crear(datos)).subscribe({
      next: (c) => {
        this.notificaciones.mostrar(`Cliente "${c.nombre}" guardado.`);
        this.error.set('');
        this.limpiar();
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected async eliminar(c: Cliente): Promise<void> {
    const ok = await this.confirmacion.confirmar({
      titulo: 'Eliminar cliente',
      mensaje: `¿Eliminar al cliente "${c.nombre}"?`,
    });
    if (!ok) {
      return;
    }
    this.clienteService.eliminar(c.id).subscribe({
      next: () => {
        this.notificaciones.mostrar(`Cliente "${c.nombre}" eliminado.`);
        this.error.set('');
        this.cargar();
      },
      // 409 si el cliente tiene equipos u ordenes
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
