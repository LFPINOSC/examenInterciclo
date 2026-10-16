import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/etiquetas';
import { cedulaEcuatoriana, telefonoEcuador } from '../core/validators';
import { Medico, Usuario } from '../models';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <header class="page-head">
      <div>
        <p class="eyebrow">Cuerpo médico</p>
        <h1>Médicos</h1>
      </div>
      @if (puedeAdministrar) {
        <button type="button" class="btn primary" (click)="abrir()">Nuevo médico</button>
      }
    </header>
    <div class="toolbar">
      <input type="search" placeholder="Buscar por nombre o especialidad" (input)="buscar($event)" />
    </div>
    @if (error()) { <p class="banner error">{{ error() }}</p> }
    @if (aviso()) { <p class="banner ok">{{ aviso() }}</p> }
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Médico</th><th>Especialidad</th><th>Contacto</th><th>Cuenta</th><th></th></tr>
        </thead>
        <tbody>
          @for (medico of lista(); track medico.id) {
            <tr>
              <td>
                <strong>{{ medico.apellidos }}, {{ medico.nombres }}</strong>
                <small>{{ medico.cedula }}</small>
              </td>
              <td>{{ medico.especialidad }}</td>
              <td>{{ medico.telefono }}<small>{{ medico.correo }}</small></td>
              <td>{{ medico.usuarioNombre || 'Sin cuenta vinculada' }}</td>
              <td class="actions">
                @if (puedeAdministrar) {
                  <button type="button" class="btn tiny" (click)="abrir(medico)">Editar</button>
                  <button type="button" class="btn tiny danger" (click)="porBorrar.set(medico)">Eliminar</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty">No hay médicos para mostrar.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (modal()) {
      <div class="backdrop" (click)="modal.set(false)">
        <form class="modal" [formGroup]="form" (click)="$event.stopPropagation()" (ngSubmit)="guardar()">
          <h2>{{ editando() ? 'Editar médico' : 'Nuevo médico' }}</h2>
          <div class="form-grid">
            <label class="field"><span>Cédula</span><input formControlName="cedula" maxlength="10" /></label>
            <label class="field"><span>Especialidad</span><input formControlName="especialidad" /></label>
            <label class="field"><span>Nombres</span><input formControlName="nombres" /></label>
            <label class="field"><span>Apellidos</span><input formControlName="apellidos" /></label>
            <label class="field"><span>Teléfono</span><input formControlName="telefono" /></label>
            <label class="field"><span>Correo</span><input type="email" formControlName="correo" /></label>
            <label class="field full">
              <span>Cuenta de acceso (opcional)</span>
              <select formControlName="usuarioId">
                <option value="">Sin vincular</option>
                @for (usuario of cuentasMedicas(); track usuario.id) {
                  <option [value]="usuario.id">{{ usuario.apellidos }}, {{ usuario.nombres }}</option>
                }
              </select>
            </label>
          </div>
          @if (errorModal()) { <p class="banner error">{{ errorModal() }}</p> }
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="modal.set(false)">Cancelar</button>
            <button class="btn primary" [disabled]="guardando()">Guardar</button>
          </div>
        </form>
      </div>
    }

    @if (porBorrar(); as medico) {
      <div class="backdrop" (click)="porBorrar.set(null)">
        <div class="modal compact" (click)="$event.stopPropagation()">
          <h2>Eliminar médico</h2>
          <p>{{ medico.nombres }} {{ medico.apellidos }} no se puede borrar si ya atendió una hospitalización.</p>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="porBorrar.set(null)">Cancelar</button>
            <button type="button" class="btn danger" (click)="borrar()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class MedicosComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly lista = signal<Medico[]>([]);
  readonly cuentasMedicas = signal<Usuario[]>([]);
  readonly modal = signal(false);
  readonly editando = signal<Medico | null>(null);
  readonly porBorrar = signal<Medico | null>(null);
  readonly error = signal('');
  readonly errorModal = signal('');
  readonly aviso = signal('');
  readonly guardando = signal(false);
  readonly puedeAdministrar = this.auth.tieneRol('ADMIN');

  readonly form = this.fb.nonNullable.group({
    cedula: ['', [Validators.required, cedulaEcuatoriana]],
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    especialidad: ['', [Validators.required, Validators.minLength(3)]],
    telefono: ['', [Validators.required, telefonoEcuador]],
    correo: ['', [Validators.required, Validators.email]],
    usuarioId: [''],
  });

  constructor() {
    this.cargar();
    if (this.puedeAdministrar) {
      this.api.usuarios().subscribe({
        next: (usuarios) => this.cuentasMedicas.set(usuarios.filter((usuario) => usuario.rol === 'MEDICO' && usuario.activo)),
        error: () => this.error.set('No se pudieron cargar las cuentas médicas'),
      });
    }
  }

  buscar(evento: Event): void {
    this.cargar((evento.target as HTMLInputElement).value);
  }

  cargar(q = ''): void {
    this.api.medicos(q.trim()).subscribe({
      next: (lista) => this.lista.set(lista),
      error: (error) => this.error.set(mensajeError(error, 'No se pudieron cargar los médicos')),
    });
  }

  abrir(medico?: Medico): void {
    this.errorModal.set('');
    this.editando.set(medico ?? null);
    this.form.reset({
      cedula: medico?.cedula ?? '',
      nombres: medico?.nombres ?? '',
      apellidos: medico?.apellidos ?? '',
      especialidad: medico?.especialidad ?? '',
      telefono: medico?.telefono ?? '',
      correo: medico?.correo ?? '',
      usuarioId: medico?.usuarioId ? String(medico.usuarioId) : '',
    });
    this.modal.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorModal.set('Complete la cédula, la especialidad y un correo válido.');
      return;
    }
    const valor = this.form.getRawValue();
    const cuerpo = {
      cedula: valor.cedula.trim(),
      nombres: valor.nombres.trim(),
      apellidos: valor.apellidos.trim(),
      especialidad: valor.especialidad.trim(),
      telefono: valor.telefono.replace(/\D/g, ''),
      correo: valor.correo.trim().toLowerCase(),
      usuarioId: valor.usuarioId ? Number(valor.usuarioId) : null,
      usuarioNombre: null,
    };
    this.guardando.set(true);
    const id = this.editando()?.id;
    const peticion = id ? this.api.actualizarMedico(id, cuerpo) : this.api.crearMedico(cuerpo);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modal.set(false);
        this.aviso.set(id ? 'Médico actualizado' : 'Médico registrado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        this.errorModal.set(mensajeError(error, 'No se pudo guardar el médico'));
      },
    });
  }

  borrar(): void {
    const medico = this.porBorrar();
    if (!medico) return;
    this.api.eliminarMedico(medico.id).subscribe({
      next: () => {
        this.porBorrar.set(null);
        this.aviso.set('Médico eliminado');
        this.cargar();
      },
      error: (error) => {
        this.porBorrar.set(null);
        this.error.set(mensajeError(error, 'No se pudo eliminar el médico'));
      },
    });
  }
}
