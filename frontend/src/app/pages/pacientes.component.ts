import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { SEXO, TIPOS_SANGRE, edad, formatoFecha, mensajeError } from '../core/etiquetas';
import { cedulaEcuatoriana, telefonoEcuador } from '../core/validators';
import { Paciente } from '../models';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <header class="page-head">
      <div>
        <p class="eyebrow">Historia clínica administrativa</p>
        <h1>Pacientes</h1>
      </div>
      @if (puedeEditar) {
        <button type="button" class="btn primary" (click)="abrir()">Nuevo paciente</button>
      }
    </header>

    <div class="toolbar">
      <input type="search" placeholder="Buscar por nombre o cédula" (input)="buscar($event)" />
      <span class="muted">{{ lista().length }} registros</span>
    </div>
    @if (error()) { <p class="banner error">{{ error() }}</p> }
    @if (aviso()) { <p class="banner ok">{{ aviso() }}</p> }

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Cédula</th>
            <th>Edad</th>
            <th>Sangre</th>
            <th>Contacto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (paciente of lista(); track paciente.id) {
            <tr>
              <td>
                <strong>{{ paciente.apellidos }}, {{ paciente.nombres }}</strong>
                <small>{{ sexo(paciente.sexo) }} · {{ paciente.direccion }}</small>
              </td>
              <td>{{ paciente.cedula }}</td>
              <td>{{ anios(paciente.fechaNacimiento) }} años</td>
              <td>{{ paciente.tipoSangre || '—' }}</td>
              <td>
                {{ paciente.telefono }}
                <small>{{ paciente.contactoEmergencia }}</small>
              </td>
              <td class="actions">
                @if (puedeEditar) { <button type="button" class="btn tiny" (click)="abrir(paciente)">Editar</button> }
                @if (puedeEliminar) { <button type="button" class="btn tiny danger" (click)="pedirBorrar(paciente)">Eliminar</button> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="empty">No hay pacientes con ese criterio.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (modal()) {
      <div class="backdrop" (click)="cerrar()">
        <form class="modal" [formGroup]="form" (click)="$event.stopPropagation()" (ngSubmit)="guardar()">
          <h2>{{ editando() ? 'Editar paciente' : 'Nuevo paciente' }}</h2>
          <div class="form-grid">
            <label class="field">
              <span>Cédula</span>
              <input formControlName="cedula" maxlength="10" />
              @if (invalido('cedula')) { <small>Ingrese una cédula ecuatoriana válida</small> }
            </label>
            <label class="field">
              <span>Fecha de nacimiento</span>
              <input type="date" formControlName="fechaNacimiento" />
            </label>
            <label class="field">
              <span>Nombres</span>
              <input formControlName="nombres" />
            </label>
            <label class="field">
              <span>Apellidos</span>
              <input formControlName="apellidos" />
            </label>
            <label class="field">
              <span>Sexo</span>
              <select formControlName="sexo">
                <option value="">Seleccione</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="O">Otro</option>
              </select>
            </label>
            <label class="field">
              <span>Tipo de sangre</span>
              <select formControlName="tipoSangre">
                <option value="">Sin registro</option>
                @for (tipo of tiposSangre; track tipo) { <option [value]="tipo">{{ tipo }}</option> }
              </select>
            </label>
            <label class="field">
              <span>Teléfono</span>
              <input formControlName="telefono" />
            </label>
            <label class="field">
              <span>Teléfono de emergencia</span>
              <input formControlName="telefonoEmergencia" />
            </label>
            <label class="field full">
              <span>Dirección</span>
              <input formControlName="direccion" />
            </label>
            <label class="field">
              <span>Contacto de emergencia</span>
              <input formControlName="contactoEmergencia" />
            </label>
            <label class="field">
              <span>Alergias</span>
              <input formControlName="alergias" placeholder="Ninguna conocida" />
            </label>
          </div>
          @if (errorModal()) { <p class="banner error">{{ errorModal() }}</p> }
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="cerrar()">Cancelar</button>
            <button type="submit" class="btn primary" [disabled]="guardando()">Guardar</button>
          </div>
        </form>
      </div>
    }

    @if (porBorrar(); as paciente) {
      <div class="backdrop" (click)="porBorrar.set(null)">
        <div class="modal compact" (click)="$event.stopPropagation()">
          <h2>Eliminar paciente</h2>
          <p>Se eliminará a {{ paciente.nombres }} {{ paciente.apellidos }}. Si tiene hospitalizaciones, la API lo rechazará.</p>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="porBorrar.set(null)">Cancelar</button>
            <button type="button" class="btn danger" (click)="borrar()">Eliminar</button>
          </div>
        </div>
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
  readonly porBorrar = signal<Paciente | null>(null);
  readonly error = signal('');
  readonly errorModal = signal('');
  readonly aviso = signal('');
  readonly guardando = signal(false);
  readonly tiposSangre = TIPOS_SANGRE;
  readonly fecha = formatoFecha;
  readonly anios = edad;
  readonly sexo = (valor: string) => SEXO[valor] ?? valor;
  readonly puedeEditar = this.auth.tieneRol('ADMIN', 'RECEPCION');
  readonly puedeEliminar = this.auth.tieneRol('ADMIN');

  readonly form = this.fb.nonNullable.group({
    cedula: ['', [Validators.required, cedulaEcuatoriana]],
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    fechaNacimiento: ['', Validators.required],
    sexo: ['', Validators.required],
    telefono: ['', [Validators.required, telefonoEcuador]],
    direccion: ['', [Validators.required, Validators.minLength(4)]],
    tipoSangre: [''],
    alergias: [''],
    contactoEmergencia: ['', [Validators.required, Validators.minLength(2)]],
    telefonoEmergencia: ['', [Validators.required, telefonoEcuador]],
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
      error: (error) => this.error.set(mensajeError(error, 'No se pudieron cargar los pacientes')),
    });
  }

  abrir(paciente?: Paciente): void {
    this.errorModal.set('');
    this.editando.set(paciente ?? null);
    this.form.reset(paciente ? {
      ...paciente,
      tipoSangre: paciente.tipoSangre || '',
    } : {
      cedula: '', nombres: '', apellidos: '', fechaNacimiento: '', sexo: '',
      telefono: '', direccion: '', tipoSangre: '', alergias: '',
      contactoEmergencia: '', telefonoEmergencia: '',
    });
    this.modal.set(true);
  }

  cerrar(): void {
    this.modal.set(false);
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorModal.set('Revise los campos marcados. La cédula y los teléfonos se validan antes de llamar a la API.');
      return;
    }
    const valor = this.form.getRawValue();
    const cuerpo = {
      ...valor,
      sexo: valor.sexo as Paciente['sexo'],
      cedula: valor.cedula.trim(),
      nombres: valor.nombres.trim(),
      apellidos: valor.apellidos.trim(),
      direccion: valor.direccion.trim(),
      alergias: valor.alergias.trim(),
      contactoEmergencia: valor.contactoEmergencia.trim(),
      telefono: valor.telefono.replace(/\D/g, ''),
      telefonoEmergencia: valor.telefonoEmergencia.replace(/\D/g, ''),
    };
    this.guardando.set(true);
    const id = this.editando()?.id;
    const peticion = id ? this.api.actualizarPaciente(id, cuerpo) : this.api.crearPaciente(cuerpo);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modal.set(false);
        this.aviso.set(id ? 'Paciente actualizado' : 'Paciente registrado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        this.errorModal.set(mensajeError(error, 'No se pudo guardar el paciente'));
      },
    });
  }

  pedirBorrar(paciente: Paciente): void {
    this.porBorrar.set(paciente);
  }

  borrar(): void {
    const paciente = this.porBorrar();
    if (!paciente) return;
    this.api.eliminarPaciente(paciente.id).subscribe({
      next: () => {
        this.porBorrar.set(null);
        this.aviso.set('Paciente eliminado');
        this.cargar();
      },
      error: (error) => {
        this.porBorrar.set(null);
        this.error.set(mensajeError(error, 'No se pudo eliminar el paciente'));
      },
    });
  }
}
