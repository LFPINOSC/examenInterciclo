import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import {
  ESTADO_HOSPITALIZACION, MOTIVO_ALTA, TIPO_HABITACION, fechaHoy, formatoFecha, mensajeError,
} from '../core/etiquetas';
import { Habitacion, Hospitalizacion, Medico, Paciente } from '../models';

@Component({
  selector: 'app-hospitalizaciones',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <header class="page-head">
      <div>
        <p class="eyebrow">Ingresos y altas</p>
        <h1>Hospitalizaciones</h1>
      </div>
      @if (puedeCrear) {
        <button type="button" class="btn primary" (click)="abrir()">Nuevo ingreso</button>
      }
    </header>
    <div class="toolbar">
      <input type="search" placeholder="Paciente, cédula, cama o diagnóstico" (input)="buscar($event)" />
      <div class="filters">
        @for (filtro of filtros; track filtro.valor) {
          <button type="button" class="chip" [class.active]="estado() === filtro.valor" (click)="cambiarEstado(filtro.valor)">
            {{ filtro.label }}
          </button>
        }
      </div>
    </div>
    @if (error()) { <p class="banner error">{{ error() }}</p> }
    @if (aviso()) { <p class="banner ok">{{ aviso() }}</p> }
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Código</th><th>Paciente</th><th>Cama</th><th>Médico</th><th>Ingreso</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          @for (item of lista(); track item.id) {
            <tr>
              <td>
                <strong>{{ item.codigo }}</strong>
                <small>{{ item.diagnosticoIngreso }}</small>
              </td>
              <td>{{ item.pacienteNombre }}<small>{{ item.pacienteCedula }}</small></td>
              <td>{{ item.habitacionNumero }}<small>{{ tipo(item.habitacionTipo) }} · piso {{ item.habitacionPiso }}</small></td>
              <td>{{ item.medicoNombre }}<small>{{ item.medicoEspecialidad }}</small></td>
              <td>{{ fecha(item.fechaIngreso) }}<small>{{ item.fechaAlta ? 'Alta ' + fecha(item.fechaAlta) : 'Sin alta' }}</small></td>
              <td><span class="badge {{ item.estado.toLowerCase() }}">{{ estadoHosp(item.estado) }}</span></td>
              <td class="actions">
                @if (puedeEditar) { <button type="button" class="btn tiny" (click)="abrir(item)">Editar</button> }
                @if (puedeAlta && item.estado === 'ACTIVA') { <button type="button" class="btn tiny" (click)="abrirAlta(item)">Alta</button> }
                @if (puedeEliminar) { <button type="button" class="btn tiny danger" (click)="porBorrar.set(item)">Eliminar</button> }
                @if (esMia(item)) { <span class="badge info">A mi cargo</span> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="empty">No hay hospitalizaciones en este filtro.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (modal()) {
      <div class="backdrop" (click)="modal.set(false)">
        <form class="modal" [formGroup]="form" (click)="$event.stopPropagation()" (ngSubmit)="guardar()">
          <h2>{{ editando() ? 'Editar ' + editando()?.codigo : 'Nuevo ingreso' }}</h2>
          <div class="form-grid">
            <label class="field">
              <span>Paciente</span>
              <select formControlName="pacienteId">
                <option value="">Seleccione</option>
                @for (paciente of pacientes(); track paciente.id) {
                  <option [value]="paciente.id" [disabled]="ocupado(paciente.id)">
                    {{ paciente.apellidos }}, {{ paciente.nombres }}{{ ocupado(paciente.id) ? ' · ya hospitalizado' : '' }}
                  </option>
                }
              </select>
            </label>
            <label class="field">
              <span>Habitación</span>
              <select formControlName="habitacionId">
                <option value="">Seleccione</option>
                @for (habitacion of camasDisponibles(); track habitacion.id) {
                  <option [value]="habitacion.id">{{ habitacion.numero }} · {{ tipo(habitacion.tipo) }} · piso {{ habitacion.piso }}</option>
                }
              </select>
            </label>
            <label class="field">
              <span>Médico responsable</span>
              <select formControlName="medicoId">
                <option value="">Seleccione</option>
                @for (medico of medicos(); track medico.id) {
                  <option [value]="medico.id">{{ medico.apellidos }}, {{ medico.nombres }} · {{ medico.especialidad }}</option>
                }
              </select>
            </label>
            <label class="field">
              <span>Fecha de ingreso</span>
              <input type="date" formControlName="fechaIngreso" />
            </label>
            <label class="field full">
              <span>Diagnóstico de ingreso</span>
              <input formControlName="diagnosticoIngreso" />
            </label>
            <label class="field full">
              <span>Observaciones</span>
              <textarea rows="3" formControlName="observaciones"></textarea>
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

    @if (altaDe(); as item) {
      <div class="backdrop" (click)="altaDe.set(null)">
        <form class="modal" [formGroup]="alta" (click)="$event.stopPropagation()" (ngSubmit)="confirmarAlta()">
          <h2>Alta de {{ item.codigo }}</h2>
          <p class="muted">{{ item.pacienteNombre }} · habitación {{ item.habitacionNumero }}. Al guardar, la cama queda disponible.</p>
          <div class="form-grid">
            <label class="field">
              <span>Fecha de alta</span>
              <input type="date" formControlName="fechaAlta" />
            </label>
            <label class="field">
              <span>Motivo</span>
              <select formControlName="motivoAlta">
                <option value="">Seleccione</option>
                @for (motivo of motivos; track motivo) {
                  <option [value]="motivo">{{ motivoLabel(motivo) }}</option>
                }
              </select>
            </label>
            <label class="field full">
              <span>Diagnóstico de alta</span>
              <input formControlName="diagnosticoAlta" />
            </label>
          </div>
          @if (errorModal()) { <p class="banner error">{{ errorModal() }}</p> }
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="altaDe.set(null)">Cancelar</button>
            <button class="btn primary" [disabled]="guardando()">Registrar alta</button>
          </div>
        </form>
      </div>
    }

    @if (porBorrar(); as item) {
      <div class="backdrop" (click)="porBorrar.set(null)">
        <div class="modal compact" (click)="$event.stopPropagation()">
          <h2>Eliminar {{ item.codigo }}</h2>
          <p>Si la estancia está activa, la habitación {{ item.habitacionNumero }} vuelve a disponible.</p>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="porBorrar.set(null)">Cancelar</button>
            <button type="button" class="btn danger" (click)="borrar()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class HospitalizacionesComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly lista = signal<Hospitalizacion[]>([]);
  readonly pacientesActivos = signal<number[]>([]);
  readonly pacientes = signal<Paciente[]>([]);
  readonly habitaciones = signal<Habitacion[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly estado = signal('');
  readonly modal = signal(false);
  readonly editando = signal<Hospitalizacion | null>(null);
  readonly altaDe = signal<Hospitalizacion | null>(null);
  readonly porBorrar = signal<Hospitalizacion | null>(null);
  readonly error = signal('');
  readonly errorModal = signal('');
  readonly aviso = signal('');
  readonly guardando = signal(false);
  readonly fecha = formatoFecha;
  readonly tipo = (valor: string) => TIPO_HABITACION[valor] ?? valor;
  readonly estadoHosp = (valor: string) => ESTADO_HOSPITALIZACION[valor] ?? valor;
  readonly motivoLabel = (valor: string) => MOTIVO_ALTA[valor] ?? valor;
  readonly motivos = Object.keys(MOTIVO_ALTA);
  readonly puedeCrear = this.auth.tieneRol('ADMIN', 'RECEPCION', 'MEDICO');
  readonly puedeEditar = this.auth.tieneRol('ADMIN', 'MEDICO');
  readonly puedeAlta = this.auth.tieneRol('ADMIN', 'MEDICO');
  readonly puedeEliminar = this.auth.tieneRol('ADMIN');
  readonly filtros = [
    { valor: '', label: 'Todas' },
    { valor: 'ACTIVA', label: 'Activas' },
    { valor: 'ALTA', label: 'Altas' },
  ];
  private consulta = '';

  readonly form = this.fb.nonNullable.group({
    pacienteId: ['', Validators.required],
    habitacionId: ['', Validators.required],
    medicoId: ['', Validators.required],
    fechaIngreso: [fechaHoy(), Validators.required],
    diagnosticoIngreso: ['', [Validators.required, Validators.minLength(5)]],
    observaciones: [''],
  });

  readonly alta = this.fb.nonNullable.group({
    fechaAlta: [fechaHoy(), Validators.required],
    motivoAlta: ['', Validators.required],
    diagnosticoAlta: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor() {
    this.cargar();
    this.refrescarActivas();
    this.api.pacientes().subscribe({ next: (lista) => this.pacientes.set(lista) });
    this.api.habitaciones().subscribe({ next: (lista) => this.habitaciones.set(lista) });
    this.api.medicos().subscribe({ next: (lista) => this.medicos.set(lista) });
  }

  buscar(evento: Event): void {
    this.consulta = (evento.target as HTMLInputElement).value;
    this.cargar();
  }

  cambiarEstado(valor: string): void {
    this.estado.set(valor);
    this.cargar();
  }

  cargar(): void {
    this.api.hospitalizaciones({ q: this.consulta.trim(), estado: this.estado() }).subscribe({
      next: (lista) => this.lista.set(lista),
      error: (error) => this.error.set(mensajeError(error, 'No se pudieron cargar las hospitalizaciones')),
    });
  }

  ocupado(pacienteId: number): boolean {
    if (this.editando()?.pacienteId === pacienteId) return false;
    return this.pacientesActivos().includes(pacienteId);
  }

  private refrescarActivas(): void {
    this.api.hospitalizaciones({ estado: 'ACTIVA' }).subscribe({
      next: (lista) => this.pacientesActivos.set(lista.map((item) => item.pacienteId)),
    });
  }

  camasDisponibles(): Habitacion[] {
    const actual = this.editando()?.habitacionId;
    return this.habitaciones().filter((habitacion) => habitacion.estado === 'DISPONIBLE' || habitacion.id === actual);
  }

  esMia(item: Hospitalizacion): boolean {
    const medicoId = this.auth.user()?.medicoId;
    return Boolean(medicoId && item.medicoUsuarioId === this.auth.user()?.id);
  }

  abrir(item?: Hospitalizacion): void {
    this.errorModal.set('');
    this.editando.set(item ?? null);
    this.form.reset({
      pacienteId: item ? String(item.pacienteId) : '',
      habitacionId: item ? String(item.habitacionId) : '',
      medicoId: item ? String(item.medicoId) : '',
      fechaIngreso: item?.fechaIngreso ?? fechaHoy(),
      diagnosticoIngreso: item?.diagnosticoIngreso ?? '',
      observaciones: item?.observaciones ?? '',
    });
    if (item) {
      this.form.controls.pacienteId.disable();
      this.form.controls.fechaIngreso.disable();
      if (item.estado !== 'ACTIVA') this.form.controls.habitacionId.disable();
      else this.form.controls.habitacionId.enable();
    } else {
      this.form.controls.pacienteId.enable();
      this.form.controls.fechaIngreso.enable();
      this.form.controls.habitacionId.enable();
    }
    this.modal.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorModal.set('Seleccione paciente, cama y médico, y escriba el diagnóstico.');
      return;
    }
    const valor = this.form.getRawValue();
    this.guardando.set(true);
    const id = this.editando()?.id;
    const peticion = id
      ? this.api.actualizarHospitalizacion(id, {
          habitacionId: Number(valor.habitacionId),
          medicoId: Number(valor.medicoId),
          diagnosticoIngreso: valor.diagnosticoIngreso.trim(),
          observaciones: valor.observaciones.trim(),
        })
      : this.api.crearHospitalizacion({
          pacienteId: Number(valor.pacienteId),
          habitacionId: Number(valor.habitacionId),
          medicoId: Number(valor.medicoId),
          fechaIngreso: valor.fechaIngreso,
          diagnosticoIngreso: valor.diagnosticoIngreso.trim(),
          observaciones: valor.observaciones.trim(),
        });
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modal.set(false);
        this.aviso.set(id ? 'Hospitalización actualizada' : 'Ingreso registrado. La habitación quedó ocupada.');
        this.cargar();
        this.refrescarActivas();
        this.api.habitaciones().subscribe({ next: (lista) => this.habitaciones.set(lista) });
      },
      error: (error) => {
        this.guardando.set(false);
        this.errorModal.set(mensajeError(error, 'No se pudo guardar la hospitalización'));
      },
    });
  }

  abrirAlta(item: Hospitalizacion): void {
    this.errorModal.set('');
    this.alta.reset({ fechaAlta: fechaHoy(), motivoAlta: '', diagnosticoAlta: '' });
    this.altaDe.set(item);
  }

  confirmarAlta(): void {
    const item = this.altaDe();
    if (!item || this.alta.invalid) {
      this.alta.markAllAsTouched();
      this.errorModal.set('Indique fecha, motivo y diagnóstico de alta.');
      return;
    }
    const valor = this.alta.getRawValue();
    this.guardando.set(true);
    this.api.darAlta(item.id, {
      fechaAlta: valor.fechaAlta,
      motivoAlta: valor.motivoAlta,
      diagnosticoAlta: valor.diagnosticoAlta.trim(),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.altaDe.set(null);
        this.aviso.set(`${item.codigo} dada de alta. La habitación ${item.habitacionNumero} quedó disponible.`);
        this.cargar();
        this.refrescarActivas();
        this.api.habitaciones().subscribe({ next: (lista) => this.habitaciones.set(lista) });
      },
      error: (error) => {
        this.guardando.set(false);
        this.errorModal.set(mensajeError(error, 'No se pudo registrar el alta'));
      },
    });
  }

  borrar(): void {
    const item = this.porBorrar();
    if (!item) return;
    this.api.eliminarHospitalizacion(item.id).subscribe({
      next: () => {
        this.porBorrar.set(null);
        this.aviso.set('Hospitalización eliminada');
        this.cargar();
        this.refrescarActivas();
      },
      error: (error) => {
        this.porBorrar.set(null);
        this.error.set(mensajeError(error, 'No se pudo eliminar'));
      },
    });
  }
}
