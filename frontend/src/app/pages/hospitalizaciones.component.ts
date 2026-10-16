import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import {
  ESTADO_HOSPITALIZACION, MOTIVO_ALTA, TIPO_HABITACION, fechaHoy, formatoFecha, mensajeError,
} from '../core/etiquetas';
import { cedulaEcuatoriana, telefonoEcuador } from '../core/validators';
import { Habitacion, Hospitalizacion, Paciente } from '../models';

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
              <td>{{ item.medicoResponsable }}</td>
              <td>{{ fecha(item.fechaIngreso) }}<small>{{ item.fechaAlta ? 'Alta ' + fecha(item.fechaAlta) : 'Sin alta' }}</small></td>
              <td><span class="badge {{ item.estado.toLowerCase() }}">{{ estadoHosp(item.estado) }}</span></td>
              <td class="actions">
                @if (puedeEditar) { <button type="button" class="btn tiny" (click)="abrir(item)">Editar</button> }
                @if (puedeAlta && item.estado === 'ACTIVA') { <button type="button" class="btn tiny" (click)="abrirAlta(item)">Alta</button> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="empty">No hay hospitalizaciones en este filtro.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (modal()) {
      <div class="backdrop" (click)="cerrarModal()">
        <form class="modal modal-ingreso" [formGroup]="form" (click)="$event.stopPropagation()" (ngSubmit)="guardar()">
          <h2>{{ editando() ? 'Editar ' + editando()?.codigo : 'Nuevo ingreso' }}</h2>

          @if (!editando()) {
            <div class="tabs">
              <button type="button" class="chip" [class.active]="modoPaciente() === 'buscar'" (click)="modoPaciente.set('buscar')">
                Del archivo
              </button>
              <button type="button" class="chip" [class.active]="modoPaciente() === 'nuevo'" (click)="modoPaciente.set('nuevo')">
                Paciente nuevo
              </button>
            </div>

            @if (modoPaciente() === 'buscar') {
              <label class="field full">
                <span>Buscar paciente</span>
                <input type="search" placeholder="Nombre o cédula" [value]="busquedaPaciente()" (input)="buscarPaciente($event)" />
              </label>
              <div class="patient-pick">
                @for (paciente of pacientesFiltrados(); track paciente.id) {
                  <button
                    type="button"
                    [class.selected]="pacienteElegido() === paciente.id"
                    [disabled]="ocupado(paciente.id)"
                    (click)="elegirPaciente(paciente.id)"
                  >
                    <strong>{{ paciente.apellidos }}, {{ paciente.nombres }}</strong>
                    <small>{{ paciente.cedula }}{{ ocupado(paciente.id) ? ' · ya hospitalizado' : '' }}</small>
                  </button>
                } @empty {
                  <p class="empty-pick">No hay coincidencias. Use «Paciente nuevo».</p>
                }
              </div>
            } @else {
              <div class="form-grid" formGroupName="nuevoPaciente">
                <label class="field"><span>Nombres</span><input formControlName="nombres" /></label>
                <label class="field"><span>Apellidos</span><input formControlName="apellidos" /></label>
                <label class="field"><span>Cédula</span><input formControlName="cedula" maxlength="10" /></label>
                <label class="field"><span>Teléfono</span><input formControlName="telefono" /></label>
                <label class="field full"><span>Dirección</span><input formControlName="direccion" /></label>
              </div>
            }

            <div class="form-grid bloque">
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
                <input formControlName="medicoResponsable" placeholder="Ej. Ana Torres" />
              </label>
              <label class="field">
                <span>Fecha de ingreso</span>
                <input type="date" formControlName="fechaIngreso" />
              </label>
            </div>
          } @else {
            <p class="muted bloque">
              {{ editando()?.pacienteNombre }} · {{ editando()?.habitacionNumero }} · {{ editando()?.medicoResponsable }}
            </p>
          }

          <div class="form-grid bloque">
            <label class="field full">
              <span>Diagnóstico de ingreso</span>
              <input formControlName="diagnosticoIngreso" />
            </label>
            <label class="field full">
              <span>Observaciones</span>
              <textarea rows="2" formControlName="observaciones"></textarea>
            </label>
          </div>
          @if (errorModal()) { <p class="banner error">{{ errorModal() }}</p> }
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="cerrarModal()">Cancelar</button>
            <button class="btn primary" [disabled]="guardando()">Guardar</button>
          </div>
        </form>
      </div>
    }

    @if (altaDe(); as item) {
      <div class="backdrop" (click)="altaDe.set(null)">
        <form class="modal" [formGroup]="alta" (click)="$event.stopPropagation()" (ngSubmit)="confirmarAlta()">
          <h2>Alta de {{ item.codigo }}</h2>
          <p class="muted">{{ item.pacienteNombre }} · habitación {{ item.habitacionNumero }}</p>
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
  readonly estado = signal('');
  readonly modal = signal(false);
  readonly editando = signal<Hospitalizacion | null>(null);
  readonly altaDe = signal<Hospitalizacion | null>(null);
  readonly error = signal('');
  readonly errorModal = signal('');
  readonly aviso = signal('');
  readonly guardando = signal(false);
  readonly modoPaciente = signal<'buscar' | 'nuevo'>('buscar');
  readonly busquedaPaciente = signal('');
  readonly pacienteElegido = signal<number | null>(null);
  readonly fecha = formatoFecha;
  readonly tipo = (valor: string) => TIPO_HABITACION[valor] ?? valor;
  readonly estadoHosp = (valor: string) => ESTADO_HOSPITALIZACION[valor] ?? valor;
  readonly motivoLabel = (valor: string) => MOTIVO_ALTA[valor] ?? valor;
  readonly motivos = Object.keys(MOTIVO_ALTA);
  readonly puedeCrear = this.auth.tieneRol('ADMIN', 'RECEPCION');
  readonly puedeEditar = this.auth.tieneRol('ADMIN', 'MEDICO');
  readonly puedeAlta = this.auth.tieneRol('ADMIN', 'MEDICO');
  readonly filtros = [
    { valor: '', label: 'Todas' },
    { valor: 'ACTIVA', label: 'Activas' },
    { valor: 'ALTA', label: 'Altas' },
  ];
  private consulta = '';

  readonly pacientesFiltrados = computed(() => {
    const q = this.busquedaPaciente().trim().toLowerCase();
    const lista = this.pacientes();
    if (!q) return lista;
    return lista.filter((p) =>
      p.cedula.includes(q)
      || p.nombres.toLowerCase().includes(q)
      || p.apellidos.toLowerCase().includes(q)
    );
  });

  readonly form = this.fb.nonNullable.group({
    habitacionId: ['', Validators.required],
    medicoResponsable: ['', [Validators.required, Validators.minLength(3)]],
    fechaIngreso: [fechaHoy(), Validators.required],
    diagnosticoIngreso: ['', [Validators.required, Validators.minLength(3)]],
    observaciones: [''],
    nuevoPaciente: this.fb.nonNullable.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      cedula: ['', [Validators.required, cedulaEcuatoriana]],
      telefono: ['', [Validators.required, telefonoEcuador]],
      direccion: ['', [Validators.required, Validators.minLength(4)]],
    }),
  });

  readonly alta = this.fb.nonNullable.group({
    fechaAlta: [fechaHoy(), Validators.required],
    motivoAlta: ['', Validators.required],
    diagnosticoAlta: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    this.cargar();
    this.refrescarActivas();
    this.api.pacientes().subscribe({ next: (lista) => this.pacientes.set(lista) });
    this.api.habitaciones().subscribe({ next: (lista) => this.habitaciones.set(lista) });
  }

  buscar(evento: Event): void {
    this.consulta = (evento.target as HTMLInputElement).value;
    this.cargar();
  }

  buscarPaciente(evento: Event): void {
    this.busquedaPaciente.set((evento.target as HTMLInputElement).value);
  }

  elegirPaciente(id: number): void {
    this.pacienteElegido.set(id);
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
    return this.pacientesActivos().includes(pacienteId);
  }

  private refrescarActivas(): void {
    this.api.hospitalizaciones({ estado: 'ACTIVA' }).subscribe({
      next: (lista) => this.pacientesActivos.set(lista.map((item) => item.pacienteId)),
    });
  }

  camasDisponibles(): Habitacion[] {
    return this.habitaciones().filter((h) => h.estado === 'DISPONIBLE');
  }

  abrir(item?: Hospitalizacion): void {
    this.errorModal.set('');
    this.editando.set(item ?? null);
    this.modoPaciente.set('buscar');
    this.busquedaPaciente.set('');
    this.pacienteElegido.set(item?.pacienteId ?? null);
    this.form.controls.nuevoPaciente.reset({
      nombres: '', apellidos: '', cedula: '', telefono: '', direccion: '',
    });
    if (item) {
      this.form.reset({
        habitacionId: '',
        medicoResponsable: '',
        fechaIngreso: fechaHoy(),
        diagnosticoIngreso: item.diagnosticoIngreso,
        observaciones: item.observaciones ?? '',
      });
      this.form.controls.habitacionId.clearValidators();
      this.form.controls.medicoResponsable.clearValidators();
      this.form.controls.fechaIngreso.clearValidators();
    } else {
      this.form.controls.habitacionId.setValidators(Validators.required);
      this.form.controls.medicoResponsable.setValidators([Validators.required, Validators.minLength(3)]);
      this.form.controls.fechaIngreso.setValidators(Validators.required);
      this.form.reset({
        habitacionId: '',
        medicoResponsable: '',
        fechaIngreso: fechaHoy(),
        diagnosticoIngreso: '',
        observaciones: '',
      });
    }
    this.form.updateValueAndValidity();
    this.modal.set(true);
  }

  cerrarModal(): void {
    this.modal.set(false);
  }

  guardar(): void {
    const id = this.editando()?.id;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorModal.set(id ? 'Revise diagnóstico y observaciones.' : 'Complete cama, médico y diagnóstico.');
      return;
    }
    if (!id) {
      if (this.modoPaciente() === 'buscar' && !this.pacienteElegido()) {
        this.errorModal.set('Elija un paciente de la lista o registre uno nuevo.');
        return;
      }
      if (this.modoPaciente() === 'nuevo' && this.form.controls.nuevoPaciente.invalid) {
        this.form.controls.nuevoPaciente.markAllAsTouched();
        this.errorModal.set('Complete los datos del paciente nuevo.');
        return;
      }
    }

    const valor = this.form.getRawValue();
    this.guardando.set(true);
    this.errorModal.set('');

    if (id) {
      this.api.actualizarHospitalizacion(id, {
        diagnosticoIngreso: valor.diagnosticoIngreso.trim(),
        observaciones: valor.observaciones.trim(),
      }).subscribe({
        next: () => this.finGuardar('Hospitalización actualizada'),
        error: (error) => this.fallaGuardar(error, 'No se pudo actualizar'),
      });
      return;
    }

    const cuerpoIngreso = {
      habitacionId: Number(valor.habitacionId),
      medicoResponsable: valor.medicoResponsable.trim(),
      fechaIngreso: valor.fechaIngreso,
      diagnosticoIngreso: valor.diagnosticoIngreso.trim(),
      observaciones: valor.observaciones.trim(),
    };

    if (this.modoPaciente() === 'nuevo') {
      const np = valor.nuevoPaciente;
      this.api.crearPaciente({
        cedula: np.cedula.trim(),
        nombres: np.nombres.trim(),
        apellidos: np.apellidos.trim(),
        telefono: np.telefono.replace(/\D/g, ''),
        direccion: np.direccion.trim(),
      }).pipe(
        switchMap((paciente) => this.api.crearHospitalizacion({ pacienteId: paciente.id, ...cuerpoIngreso })),
      ).subscribe({
        next: () => {
          this.api.pacientes().subscribe({ next: (lista) => this.pacientes.set(lista) });
          this.finGuardar('Paciente e ingreso registrados');
        },
        error: (error) => this.fallaGuardar(error, 'No se pudo registrar el ingreso'),
      });
      return;
    }

    this.api.crearHospitalizacion({ pacienteId: this.pacienteElegido()!, ...cuerpoIngreso }).subscribe({
      next: () => this.finGuardar('Ingreso registrado'),
      error: (error) => this.fallaGuardar(error, 'No se pudo registrar el ingreso'),
    });
  }

  private finGuardar(mensaje: string): void {
    this.guardando.set(false);
    this.modal.set(false);
    this.aviso.set(mensaje);
    this.cargar();
    this.refrescarActivas();
    this.api.habitaciones().subscribe({ next: (lista) => this.habitaciones.set(lista) });
  }

  private fallaGuardar(error: unknown, respaldo: string): void {
    this.guardando.set(false);
    this.errorModal.set(mensajeError(error, respaldo));
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
        this.aviso.set(`${item.codigo} dada de alta`);
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
}
