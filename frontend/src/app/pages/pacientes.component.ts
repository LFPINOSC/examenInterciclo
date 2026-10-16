import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/etiquetas';
import { cedulaEcuatoriana, telefonoEcuador } from '../core/validators';
import { Paciente } from '../models';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <header class="page-head">
      <h1>Pacientes</h1>
      @if (puedeEditar) {
        <button type="button" class="btn primary" (click)="abrir()">Nuevo paciente</button>
      }
    </header>
    <div class="toolbar">
      <input type="search" placeholder="Buscar por nombre o cédula" (input)="buscar($event)" />
    </div>
    @if (error()) { <p class="banner error">{{ error() }}</p> }
    @if (aviso()) { <p class="banner ok">{{ aviso() }}</p> }
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Paciente</th><th>Cédula</th><th>Teléfono</th><th>Dirección</th><th></th></tr>
        </thead>
        <tbody>
          @for (p of lista(); track p.id) {
            <tr>
              <td><strong>{{ p.apellidos }}, {{ p.nombres }}</strong></td>
              <td>{{ p.cedula }}</td>
              <td>{{ p.telefono }}</td>
              <td>{{ p.direccion }}</td>
              <td class="actions">
                @if (puedeEditar) { <button type="button" class="btn tiny" (click)="abrir(p)">Editar</button> }
                @if (puedeEliminar) { <button type="button" class="btn tiny danger" (click)="borrar(p)">Eliminar</button> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty">Sin pacientes.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (modal()) {
      <div class="backdrop" (click)="modal.set(false)">
        <form class="modal" [formGroup]="form" (click)="$event.stopPropagation()" (ngSubmit)="guardar()">
          <h2>{{ editando() ? 'Editar paciente' : 'Nuevo paciente' }}</h2>
          <div class="form-grid">
            <label class="field"><span>Cédula</span><input formControlName="cedula" maxlength="10" /></label>
            <label class="field"><span>Teléfono</span><input formControlName="telefono" /></label>
            <label class="field"><span>Nombres</span><input formControlName="nombres" /></label>
            <label class="field"><span>Apellidos</span><input formControlName="apellidos" /></label>
            <label class="field full"><span>Dirección</span><input formControlName="direccion" /></label>
          </div>
          @if (errorModal()) { <p class="banner error">{{ errorModal() }}</p> }
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="modal.set(false)">Cancelar</button>
            <button class="btn primary" [disabled]="guardando()">Guardar</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class PacientesComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly lista = signal<Paciente[]>([]);
  readonly modal = signal(false);
  readonly editando = signal<Paciente | null>(null);
  readonly error = signal('');
  readonly errorModal = signal('');
  readonly aviso = signal('');
  readonly guardando = signal(false);
  readonly puedeEditar = this.auth.tieneRol('ADMIN', 'RECEPCION');
  readonly puedeEliminar = this.auth.tieneRol('ADMIN');

  readonly form = this.fb.nonNullable.group({
    cedula: ['', [Validators.required, cedulaEcuatoriana]],
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    telefono: ['', [Validators.required, telefonoEcuador]],
    direccion: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor() {
    this.cargar();
  }

  buscar(evento: Event): void {
    this.cargar((evento.target as HTMLInputElement).value);
  }

  cargar(q = ''): void {
    this.api.pacientes(q.trim()).subscribe({
      next: (lista) => this.lista.set(lista),
      error: (e) => this.error.set(mensajeError(e, 'No se pudo cargar')),
    });
  }

  abrir(p?: Paciente): void {
    this.errorModal.set('');
    this.editando.set(p ?? null);
    this.form.reset(p ?? { cedula: '', nombres: '', apellidos: '', telefono: '', direccion: '' });
    this.modal.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorModal.set('Revise los datos del paciente.');
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo = {
      ...v,
      cedula: v.cedula.trim(),
      telefono: v.telefono.replace(/\D/g, ''),
    };
    this.guardando.set(true);
    const id = this.editando()?.id;
    const req = id ? this.api.actualizarPaciente(id, cuerpo) : this.api.crearPaciente(cuerpo);
    req.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modal.set(false);
        this.aviso.set(id ? 'Paciente actualizado' : 'Paciente registrado');
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.errorModal.set(mensajeError(e, 'No se pudo guardar'));
      },
    });
  }

  borrar(p: Paciente): void {
    if (!confirm(`¿Eliminar a ${p.nombres} ${p.apellidos}?`)) return;
    this.api.eliminarPaciente(p.id).subscribe({
      next: () => {
        this.aviso.set('Paciente eliminado');
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e, 'No se pudo eliminar')),
    });
  }
}
