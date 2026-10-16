import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ESTADO_HABITACION, TIPO_HABITACION, mensajeError } from '../core/etiquetas';
import { Habitacion } from '../models';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <header class="page-head">
      <div>
        <p class="eyebrow">Censo de camas</p>
        <h1>Habitaciones</h1>
      </div>
      @if (puedeAdministrar) {
        <button type="button" class="btn primary" (click)="abrir()">Nueva habitación</button>
      }
    </header>
    <div class="toolbar">
      <input type="search" placeholder="Buscar por número o tipo" (input)="buscar($event)" />
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
          <tr><th>Número</th><th>Piso</th><th>Tipo</th><th>Estado</th><th>Paciente actual</th><th></th></tr>
        </thead>
        <tbody>
          @for (habitacion of lista(); track habitacion.id) {
            <tr>
              <td><strong>{{ habitacion.numero }}</strong><small>{{ habitacion.descripcion || 'Sin nota' }}</small></td>
              <td>{{ habitacion.piso }}</td>
              <td>{{ tipo(habitacion.tipo) }}</td>
              <td><span class="badge {{ habitacion.estado.toLowerCase() }}">{{ estadoHab(habitacion.estado) }}</span></td>
              <td>{{ habitacion.pacienteNombre || '—' }} <small>{{ habitacion.hospitalizacionCodigo }}</small></td>
              <td class="actions">
                @if (puedeAdministrar) {
                  <button type="button" class="btn tiny" (click)="abrir(habitacion)">Editar</button>
                  <button type="button" class="btn tiny danger" (click)="porBorrar.set(habitacion)">Eliminar</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="empty">No hay habitaciones en este filtro.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (modal()) {
      <div class="backdrop" (click)="modal.set(false)">
        <form class="modal" [formGroup]="form" (click)="$event.stopPropagation()" (ngSubmit)="guardar()">
          <h2>{{ editando() ? 'Editar habitación ' + editando()?.numero : 'Nueva habitación' }}</h2>
          <div class="form-grid">
            <label class="field"><span>Número</span><input formControlName="numero" /></label>
            <label class="field"><span>Piso</span><input type="number" min="1" formControlName="piso" /></label>
            <label class="field">
              <span>Tipo</span>
              <select formControlName="tipo">
                <option value="GENERAL">General</option>
                <option value="UCI">UCI</option>
                <option value="PEDIATRIA">Pediatría</option>
                <option value="AISLAMIENTO">Aislamiento</option>
              </select>
            </label>
            <label class="field">
              <span>Estado</span>
              <select formControlName="estado">
                @if (editando()?.estado === 'OCUPADA') { <option value="OCUPADA">Ocupada</option> }
                <option value="DISPONIBLE">Disponible</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
              </select>
            </label>
            <label class="field full"><span>Descripción</span><input formControlName="descripcion" /></label>
          </div>
          @if (editando()?.estado === 'OCUPADA') {
            <p class="banner">Esta cama tiene una estancia activa. El alta es lo que la libera.</p>
          }
          @if (errorModal()) { <p class="banner error">{{ errorModal() }}</p> }
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="modal.set(false)">Cancelar</button>
            <button class="btn primary" [disabled]="guardando()">Guardar</button>
          </div>
        </form>
      </div>
    }

    @if (porBorrar(); as habitacion) {
      <div class="backdrop" (click)="porBorrar.set(null)">
        <div class="modal compact" (click)="$event.stopPropagation()">
          <h2>Eliminar habitación {{ habitacion.numero }}</h2>
          <p>Solo se elimina si nunca tuvo hospitalizaciones. Si ya tiene historial, pásela a mantenimiento.</p>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="porBorrar.set(null)">Cancelar</button>
            <button type="button" class="btn danger" (click)="borrar()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class HabitacionesComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly lista = signal<Habitacion[]>([]);
  readonly estado = signal('');
  readonly modal = signal(false);
  readonly editando = signal<Habitacion | null>(null);
  readonly porBorrar = signal<Habitacion | null>(null);
  readonly error = signal('');
  readonly errorModal = signal('');
  readonly aviso = signal('');
  readonly guardando = signal(false);
  readonly puedeAdministrar = this.auth.tieneRol('ADMIN');
  readonly tipo = (valor: string) => TIPO_HABITACION[valor] ?? valor;
  readonly estadoHab = (valor: string) => ESTADO_HABITACION[valor] ?? valor;
  readonly filtros = [
    { valor: '', label: 'Todas' },
    { valor: 'DISPONIBLE', label: 'Disponibles' },
    { valor: 'OCUPADA', label: 'Ocupadas' },
    { valor: 'MANTENIMIENTO', label: 'Mantenimiento' },
  ];
  private consulta = '';

  readonly form = this.fb.nonNullable.group({
    numero: ['', [Validators.required, Validators.maxLength(10)]],
    piso: [1, [Validators.required, Validators.min(1)]],
    tipo: ['GENERAL', Validators.required],
    estado: ['DISPONIBLE', Validators.required],
    descripcion: [''],
  });

  constructor() {
    this.cargar();
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
    this.api.habitaciones({ q: this.consulta.trim(), estado: this.estado() }).subscribe({
      next: (lista) => this.lista.set(lista),
      error: (error) => this.error.set(mensajeError(error, 'No se pudieron cargar las habitaciones')),
    });
  }

  abrir(habitacion?: Habitacion): void {
    this.errorModal.set('');
    this.editando.set(habitacion ?? null);
    this.form.reset({
      numero: habitacion?.numero ?? '',
      piso: habitacion?.piso ?? 1,
      tipo: habitacion?.tipo ?? 'GENERAL',
      estado: habitacion?.estado === 'OCUPADA' ? 'OCUPADA' : habitacion?.estado ?? 'DISPONIBLE',
      descripcion: habitacion?.descripcion ?? '',
    });
    if (habitacion?.estado === 'OCUPADA') this.form.controls.estado.disable();
    else this.form.controls.estado.enable();
    this.modal.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorModal.set('Indique número, piso y tipo.');
      return;
    }
    const valor = this.form.getRawValue();
    const cuerpo = {
      numero: valor.numero.trim(),
      piso: Number(valor.piso),
      tipo: valor.tipo as Habitacion['tipo'],
      estado: valor.estado as Habitacion['estado'],
      descripcion: valor.descripcion.trim(),
      pacienteNombre: null,
      hospitalizacionCodigo: null,
    };
    this.guardando.set(true);
    const id = this.editando()?.id;
    const peticion = id ? this.api.actualizarHabitacion(id, cuerpo) : this.api.crearHabitacion(cuerpo);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modal.set(false);
        this.aviso.set(id ? 'Habitación actualizada' : 'Habitación registrada');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        this.errorModal.set(mensajeError(error, 'No se pudo guardar la habitación'));
      },
    });
  }

  borrar(): void {
    const habitacion = this.porBorrar();
    if (!habitacion) return;
    this.api.eliminarHabitacion(habitacion.id).subscribe({
      next: () => {
        this.porBorrar.set(null);
        this.aviso.set('Habitación eliminada');
        this.cargar();
      },
      error: (error) => {
        this.porBorrar.set(null);
        this.error.set(mensajeError(error, 'No se pudo eliminar la habitación'));
      },
    });
  }
}
