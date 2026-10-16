import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cliente, Equipo, OrdenRequest, Tecnico } from '../core/modelos';
import { NotificacionService } from '../core/notificacion.service';
import { ClienteService, EquipoService, OrdenService, UsuarioService } from '../core/servicios';
import { ESTADOS, LISTA_ESTADOS, LISTA_PRIORIDADES, PRIORIDADES, errorCampo, mensajeError } from '../core/utilidades';

/** Crear o editar una orden (solo ADMIN). Si la URL trae :id es edicion. */
@Component({
  selector: 'app-orden-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1 class="titulo">{{ id() ? 'Editar orden' : 'Nueva orden' }}</h1>
    @if (error()) {
      <p class="alerta alerta-error" role="alert">{{ error() }}</p>
    }
    <form class="tarjeta formulario ancho-medio" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
      <label for="o-cliente">Cliente *</label>
      <select id="o-cliente" formControlName="clienteId">
        <option [ngValue]="null">-- Seleccione --</option>
        @for (c of clientes(); track c.id) {
          <option [ngValue]="c.id">{{ c.nombre }} ({{ c.cedula }})</option>
        }
      </select>
      <small class="error-campo">{{ err('clienteId', 'El cliente') }}</small>

      <label for="o-equipo">Equipo * (solo los del cliente elegido)</label>
      <select id="o-equipo" formControlName="equipoId">
        <option [ngValue]="null">-- Seleccione --</option>
        @for (e of equipos(); track e.id) {
          <option [ngValue]="e.id">{{ e.tipo }} {{ e.marca }} {{ e.modelo }} {{ e.serie ? '(' + e.serie + ')' : '' }}</option>
        }
      </select>
      <small class="error-campo">{{ err('equipoId', 'El equipo') }}</small>

      <label for="o-tecnico">Técnico asignado</label>
      <select id="o-tecnico" formControlName="tecnicoId">
        <option [ngValue]="null">-- Sin asignar --</option>
        @for (t of tecnicos(); track t.id) {
          <option [ngValue]="t.id">{{ t.nombre }}</option>
        }
      </select>

      <label for="o-desc">Descripción del problema *</label>
      <textarea id="o-desc" rows="3" maxlength="500" formControlName="descripcion"></textarea>
      <small class="error-campo">{{ err('descripcion', 'La descripción') }}</small>

      <div class="fila">
        <div>
          <label for="o-prioridad">Prioridad</label>
          <select id="o-prioridad" formControlName="prioridad">
            @for (p of prioridades; track p) {
              <option [value]="p">{{ nombresPrioridad[p] }}</option>
            }
          </select>
        </div>
        <div>
          <label for="o-estado">Estado</label>
          <select id="o-estado" formControlName="estado">
            @for (e of estados; track e) {
              <option [value]="e">{{ nombresEstado[e] }}</option>
            }
          </select>
        </div>
      </div>

      <div class="fila">
        <div>
          <label for="o-ingreso">Fecha de ingreso</label>
          <input id="o-ingreso" type="date" formControlName="fechaIngreso" />
        </div>
        <div>
          <label for="o-entrega">Fecha de entrega</label>
          <input id="o-entrega" type="date" formControlName="fechaEntrega" />
        </div>
      </div>
      <small class="error-campo">{{ form.hasError('fechas') ? 'La entrega no puede ser anterior al ingreso.' : '' }}</small>

      <div class="acciones">
        <a class="boton boton-secundario" routerLink="/ordenes">Cancelar</a>
        <button type="submit" class="boton">Guardar</button>
      </div>
    </form>
  `,
})
export class OrdenForm implements OnInit {
  /** Viene de la ruta ordenes/:id/editar (withComponentInputBinding). */
  readonly id = input<string>();

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ordenService = inject(OrdenService);
  private readonly equipoService = inject(EquipoService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly estados = LISTA_ESTADOS;
  protected readonly nombresEstado = ESTADOS;
  protected readonly prioridades = LISTA_PRIORIDADES;
  protected readonly nombresPrioridad = PRIORIDADES;
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly equipos = signal<Equipo[]>([]);
  protected readonly tecnicos = signal<Tecnico[]>([]);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).group(
    {
      clienteId: [null as number | null, Validators.required],
      equipoId: [null as number | null, Validators.required],
      tecnicoId: [null as number | null],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      prioridad: ['MEDIA' as OrdenRequest['prioridad']],
      estado: ['PENDIENTE' as OrdenRequest['estado']],
      fechaIngreso: [''],
      fechaEntrega: [''],
    },
    {
      // Validacion cruzada entre dos campos: la entrega no puede ser antes del ingreso.
      validators: (g) => {
        const ing = g.get('fechaIngreso')?.value;
        const ent = g.get('fechaEntrega')?.value;
        return ing && ent && ent < ing ? { fechas: true } : null;
      },
    },
  );

  constructor() {
    inject(ClienteService).listar().subscribe({ next: (l) => this.clientes.set(l), error: (e) => this.error.set(mensajeError(e)) });
    inject(UsuarioService).tecnicos().subscribe({ next: (l) => this.tecnicos.set(l), error: (e) => this.error.set(mensajeError(e)) });

    // Al cambiar de cliente, el desplegable de equipos muestra solo los de ese cliente.
    this.form.controls.clienteId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((clienteId) => {
      this.form.controls.equipoId.setValue(null);
      this.cargarEquipos(clienteId);
    });
  }

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      return;
    }
    this.ordenService.buscar(Number(id)).subscribe({
      next: (o) => {
        this.cargarEquipos(o.clienteId);
        this.form.patchValue({ ...o, fechaEntrega: o.fechaEntrega ?? '' }, { emitEvent: false });
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected err(campo: 'clienteId' | 'equipoId' | 'descripcion', etiqueta: string): string {
    return errorCampo(this.form.controls[campo], etiqueta);
  }

  private cargarEquipos(clienteId: number | null): void {
    if (!clienteId) {
      this.equipos.set([]);
      return;
    }
    this.equipoService.listar(clienteId).subscribe({ next: (l) => this.equipos.set(l), error: (e) => this.error.set(mensajeError(e)) });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: OrdenRequest = {
      clienteId: v.clienteId!,
      equipoId: v.equipoId!,
      tecnicoId: v.tecnicoId,
      descripcion: v.descripcion ?? '',
      prioridad: v.prioridad!,
      estado: v.estado!,
      fechaIngreso: v.fechaIngreso || null,
      fechaEntrega: v.fechaEntrega || null,
    };
    const id = this.id();
    const peticion = id ? this.ordenService.actualizar(Number(id), datos) : this.ordenService.crear(datos);
    peticion.subscribe({
      next: (orden) => {
        this.notificaciones.mostrar(`Orden ${orden.codigo} guardada.`);
        this.router.navigate(['/ordenes', orden.id]);
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
