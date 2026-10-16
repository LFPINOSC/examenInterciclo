
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Turnos,
  Turno,
  TurnoRequest
} from '../../core/services/turnos';

import {
  Enfermeros,
  Enfermero
} from '../../core/services/enfermeros';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './turnos.html',
  styleUrl: './turnos.css'
})
export class TurnosPage implements OnInit {

  private servicio = inject(Turnos);
  private enfermerosServicio = inject(Enfermeros);

  turnos: Turno[] = [];
  enfermeros: Enfermero[] = [];

  formulario: TurnoRequest = this.formularioVacio();

  editandoId: number | null = null;

  guardando = false;
  cargando = false;

  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  formularioVacio(): TurnoRequest {
    return {
      enfermeroId: 0,
      fechaInicio: '',
      fechaFin: '',
      observaciones: ''
    };
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';

    // CARGAR TURNOS REGISTRADOS
    this.servicio.listar().subscribe({
      next: datos => {
        console.log('TURNOS RECIBIDOS:', datos);

        this.turnos = datos;
        this.cargando = false;
      },
      error: err => {
        console.error('ERROR AL CARGAR TURNOS:', err);

        this.error = err.error?.message
          || 'No se pudieron cargar los turnos.';

        this.cargando = false;
      }
    });

    // CARGAR ENFERMEROS PARA EL SELECTOR
    this.enfermerosServicio.listar().subscribe({
      next: datos => {
        console.log('ENFERMEROS RECIBIDOS:', datos);

        // TEMPORALMENTE SIN FILTRO PARA DIAGNOSTICAR
        this.enfermeros = datos;

        console.log(
          'TOTAL DE ENFERMEROS:',
          this.enfermeros.length
        );
      },
      error: err => {
        console.error(
          'ERROR AL CARGAR ENFERMEROS:',
          err
        );

        this.error = err.error?.message
          || 'No se pudieron cargar los enfermeros.';
      }
    });
  }

  guardar(): void {
    if (this.guardando) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    if (!this.formulario.enfermeroId) {
      this.error = 'Selecciona un enfermero.';
      return;
    }

    if (
      !this.formulario.fechaInicio ||
      !this.formulario.fechaFin
    ) {
      this.error = 'Debes seleccionar las fechas del turno.';
      return;
    }

    if (
      this.formulario.fechaFin <=
      this.formulario.fechaInicio
    ) {
      this.error =
        'La fecha de fin debe ser posterior al inicio.';
      return;
    }

    this.guardando = true;

    const peticion = this.editandoId === null
      ? this.servicio.crear(this.formulario)
      : this.servicio.actualizar(
          this.editandoId,
          this.formulario
        );

    peticion.subscribe({
      next: () => {
        const estabaEditando = this.editandoId !== null;

        this.cancelar();

        this.mensaje = estabaEditando
          ? 'Turno actualizado correctamente.'
          : 'Turno registrado correctamente.';

        this.guardando = false;
        this.cargar();
      },
      error: err => {
        console.error('ERROR AL GUARDAR TURNO:', err);

        this.error = err.error?.message
          || 'No se pudo guardar el turno.';

        this.guardando = false;
      }
    });
  }

  editar(turno: Turno): void {
    this.editandoId = turno.id;

    this.formulario = {
      enfermeroId: turno.enfermeroId,
      fechaInicio: turno.fechaInicio.slice(0, 16),
      fechaFin: turno.fechaFin.slice(0, 16),
      observaciones: turno.observaciones || ''
    };

    this.error = '';
    this.mensaje = '';
  }

  desactivar(turno: Turno): void {
    if (!confirm('¿Desactivar este turno?')) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    this.servicio.desactivar(turno.id).subscribe({
      next: () => {
        this.mensaje =
          'Turno desactivado correctamente.';

        this.cargar();
      },
      error: err => {
        console.error(
          'ERROR AL DESACTIVAR TURNO:',
          err
        );

        this.error = err.error?.message
          || 'No se pudo desactivar el turno.';
      }
    });
  }

  cancelar(): void {
    this.editandoId = null;
    this.formulario = this.formularioVacio();
  }
}
