
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Actividades,
  Actividad,
  ActividadRequest,
  TipoActividad
} from '../../core/services/actividades';

import { Pacientes, Paciente } from '../../core/services/pacientes';
import { Enfermeros, Enfermero } from '../../core/services/enfermeros';
import { Turnos, Turno } from '../../core/services/turnos';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './actividades.html',
  styleUrl: './actividades.css'
})
export class ActividadesPage implements OnInit {

  private servicio = inject(Actividades);
  private pacientesServicio = inject(Pacientes);
  private enfermerosServicio = inject(Enfermeros);
  private turnosServicio = inject(Turnos);

  actividades: Actividad[] = [];
  pacientes: Paciente[] = [];
  enfermeros: Enfermero[] = [];
  turnos: Turno[] = [];

  tipos: { valor: TipoActividad; nombre: string }[] = [
    { valor: 'SIGNOS_VITALES', nombre: 'Signos vitales' },
    { valor: 'ADMINISTRACION_MEDICAMENTOS', nombre: 'Administración de medicamentos' },
    { valor: 'CURACION', nombre: 'Curación' },
    { valor: 'HIGIENE_PACIENTE', nombre: 'Higiene del paciente' },
    { valor: 'CONTROL_GLUCOSA', nombre: 'Control de glucosa' },
    { valor: 'MOVILIZACION', nombre: 'Movilización' },
    { valor: 'OTRA', nombre: 'Otra' }
  ];

  formulario: ActividadRequest = this.formularioVacio();

  editandoId: number | null = null;
  guardando = false;
  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  formularioVacio(): ActividadRequest {
    return {
      pacienteId: 0,
      enfermeroId: 0,
      turnoId: 0,
      tipo: 'SIGNOS_VITALES',
      descripcion: '',
      fechaProgramada: ''
    };
  }

  cargar(): void {
    this.servicio.listar().subscribe({
      next: datos => this.actividades = datos,
      error: err => this.mostrarError(err, 'No se pudieron cargar las actividades.')
    });

    this.pacientesServicio.listar().subscribe({
      next: datos => this.pacientes = datos.filter(p => p.activo),
      error: err => this.mostrarError(err, 'No se pudieron cargar los pacientes.')
    });

    this.enfermerosServicio.listar().subscribe({
      next: datos => this.enfermeros = datos.filter(e => e.activo),
      error: err => this.mostrarError(err, 'No se pudieron cargar los enfermeros.')
    });

    this.turnosServicio.listar().subscribe({
      next: datos => this.turnos = datos.filter(t => t.activo),
      error: err => this.mostrarError(err, 'No se pudieron cargar los turnos.')
    });
  }

  turnosDisponibles(): Turno[] {
    return this.turnos.filter(
      turno => turno.enfermeroId === Number(this.formulario.enfermeroId)
    );
  }

  guardar(): void {
    if (this.guardando) return;

    this.error = '';
    this.mensaje = '';

    if (!this.formulario.pacienteId ||
        !this.formulario.enfermeroId ||
        !this.formulario.turnoId ||
        !this.formulario.fechaProgramada) {
      this.error = 'Completa los campos obligatorios.';
      return;
    }

    const turno = this.turnos.find(
      t => t.id === Number(this.formulario.turnoId)
    );

    if (!turno || turno.enfermeroId !== Number(this.formulario.enfermeroId)) {
      this.error = 'El turno debe pertenecer al enfermero seleccionado.';
      return;
    }

    this.guardando = true;

    const peticion = this.editandoId === null
      ? this.servicio.crear(this.formulario)
      : this.servicio.actualizar(this.editandoId, this.formulario);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editandoId === null
          ? 'Actividad registrada correctamente.'
          : 'Actividad actualizada correctamente.';

        this.cancelarEdicion();
        this.cargar();
        this.guardando = false;
      },
      error: err => {
        this.mostrarError(err, 'No se pudo guardar la actividad.');
        this.guardando = false;
      }
    });
  }

  editar(actividad: Actividad): void {
    this.editandoId = actividad.id;

    this.formulario = {
      pacienteId: actividad.pacienteId,
      enfermeroId: actividad.enfermeroId,
      turnoId: actividad.turnoId,
      tipo: actividad.tipo,
      descripcion: actividad.descripcion,
      fechaProgramada: actividad.fechaProgramada.slice(0, 16)
    };

    this.mensaje = '';
    this.error = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarActividad(actividad: Actividad): void {
    if (!confirm('¿Cancelar esta actividad?')) return;

    this.servicio.cancelar(actividad.id).subscribe({
      next: () => {
        this.mensaje = 'Actividad cancelada correctamente.';
        this.cargar();
      },
      error: err => this.mostrarError(err, 'No se pudo cancelar la actividad.')
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario = this.formularioVacio();
  }

  nombrePaciente(id: number): string {
    const paciente = this.pacientes.find(p => p.id === id);
    return paciente
      ? `${paciente.nombres} ${paciente.apellidos}`
      : `Paciente #${id}`;
  }

  nombreEnfermero(id: number): string {
    const enfermero = this.enfermeros.find(e => e.id === id);
    return enfermero?.nombre || `Enfermero #${id}`;
  }

  mostrarError(err: any, defecto: string): void {
    this.error = err.error?.message || err.error?.mensaje || defecto;
  }
}
