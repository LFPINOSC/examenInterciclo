import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// Servicio de citas
import {
  CitasApi,
  Cita,
  CitaSolicitud,
  EstadoCita
} from '../../services/citas';

// Servicios de los modulos relacionados
import {
  Pacientes as PacientesApi,
  Paciente
} from '../../services/pacientes';

import {
  OdontologosApi,
  Odontologo
} from '../../services/odontologos';

import {
  ServiciosApi,
  Servicio
} from '../../services/servicios';

// Modelo del formulario de citas
interface FormularioCita {
  pacienteId: number | null;
  odontologoId: number | null;
  servicioId: number | null;
  fechaHora: string;
  observaciones: string;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class Citas implements OnInit {

  // ==========================================
  // SERVICIOS
  // ==========================================

  private citasApi = inject(CitasApi);
  private pacientesApi = inject(PacientesApi);
  private odontologosApi = inject(OdontologosApi);
  private serviciosApi = inject(ServiciosApi);

  // ==========================================
  // LISTAS DEL SISTEMA
  // ==========================================

  citas: Cita[] = [];
  pacientes: Paciente[] = [];
  odontologos: Odontologo[] = [];
  tratamientos: Servicio[] = [];

  // ==========================================
  // FORMULARIO Y ESTADOS
  // ==========================================

  formulario: FormularioCita = this.nuevaCita();

  editandoId: number | null = null;

  cargando = false;
  cargandoCatalogos = false;
  guardando = false;

  procesandoEstadoId: number | null = null;
  eliminandoId: number | null = null;

  mensajeError = '';
  mensajeExito = '';

  // ==========================================
  // INICIALIZACION
  // ==========================================

  ngOnInit(): void {
    this.cargarCatalogos();
    this.listar();
  }

  // Crear un formulario vacio
  private nuevaCita(): FormularioCita {
    return {
      pacienteId: null,
      odontologoId: null,
      servicioId: null,
      fechaHora: '',
      observaciones: ''
    };
  }

  // ==========================================
  // CARGAR PACIENTES, ODONTOLOGOS Y SERVICIOS
  // ==========================================

  cargarCatalogos(): void {

    this.cargandoCatalogos = true;

    // Consultar las tres API al mismo tiempo
    forkJoin({
      pacientes: this.pacientesApi.listar(),
      odontologos: this.odontologosApi.listar(),
      tratamientos: this.serviciosApi.listar()
    }).subscribe({

      next: (datos) => {

        this.pacientes = datos.pacientes;
        this.odontologos = datos.odontologos;
        this.tratamientos = datos.tratamientos;

        this.cargandoCatalogos = false;
      },

      error: (error: HttpErrorResponse) => {
        this.cargandoCatalogos = false;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // GET: LISTAR TODAS LAS CITAS
  // ==========================================

  listar(): void {

    this.cargando = true;

    this.citasApi.listar().subscribe({

      next: (datos) => {
        this.citas = datos;
        this.cargando = false;
      },

      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // POST / PUT: REGISTRAR O ACTUALIZAR CITA
  // ==========================================

  guardar(): void {

    if (this.guardando) {
      return;
    }

    const f = this.formulario;

    // Verificar que el usuario selecciono las relaciones
    if (
      f.pacienteId == null ||
      f.odontologoId == null ||
      f.servicioId == null ||
      !f.fechaHora
    ) {
      this.mensajeError =
        'Debes seleccionar un paciente, un odontólogo, un tratamiento y la fecha.';
      return;
    }

    // Validar que existan las opciones seleccionadas
    const existePaciente = this.pacientes.some(
      p => p.id === f.pacienteId
    );

    const existeOdontologo = this.odontologos.some(
      o => o.id === f.odontologoId
    );

    const existeTratamiento = this.tratamientos.some(
      s => s.id === f.servicioId
    );

    if (!existePaciente || !existeOdontologo || !existeTratamiento) {
      this.mensajeError =
        'Los datos seleccionados no están disponibles. Actualiza los catálogos.';
      return;
    }

    // Construir el DTO que recibe Spring Boot
    const datos: CitaSolicitud = {
      pacienteId: f.pacienteId,
      odontologoId: f.odontologoId,
      servicioId: f.servicioId,
      fechaHora: f.fechaHora,
      observaciones: f.observaciones.trim()
    };

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    // Crear o editar segun el identificador
    const peticion = this.editandoId !== null
      ? this.citasApi.actualizar(this.editandoId, datos)
      : this.citasApi.guardar(datos);

    peticion.subscribe({

      next: () => {

        this.mensajeExito = this.editandoId !== null
          ? 'Cita actualizada correctamente.'
          : 'Cita registrada correctamente.';

        this.guardando = false;

        this.cancelarEdicion();
        this.listar();
      },

      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // EDITAR UNA CITA
  // ==========================================

  editar(cita: Cita): void {

    this.editandoId = cita.id;

    // El input datetime-local necesita fecha y hora
    // con el formato YYYY-MM-DDTHH:mm
    this.formulario = {
      pacienteId: cita.pacienteId,
      odontologoId: cita.odontologoId,
      servicioId: cita.servicioId,
      fechaHora: cita.fechaHora.slice(0, 16),
      observaciones: cita.observaciones || ''
    };

    this.mensajeError = '';
    this.mensajeExito = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ==========================================
  // CANCELAR LA EDICION
  // ==========================================

  cancelarEdicion(): void {

    this.editandoId = null;
    this.formulario = this.nuevaCita();
  }

  // ==========================================
  // PATCH: CAMBIAR ESTADO
  // ==========================================

  cambiarEstado(cita: Cita, nuevoEstado: string): void {

    const estados: EstadoCita[] = [
      'PENDIENTE',
      'CONFIRMADA',
      'ATENDIDA',
      'CANCELADA'
    ];

    // Validar valor antes de enviarlo a la API
    if (!estados.includes(nuevoEstado as EstadoCita)) {
      this.mensajeError = 'Estado de cita inválido.';
      return;
    }

    const estado = nuevoEstado as EstadoCita;

    if (estado === cita.estado) {
      return;
    }

    if (this.procesandoEstadoId !== null) {
      return;
    }

    this.procesandoEstadoId = cita.id;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.citasApi.cambiarEstado(cita.id, estado).subscribe({

      next: () => {
        this.procesandoEstadoId = null;
        this.mensajeExito = 'Estado actualizado correctamente.';
        this.listar();
      },

      error: (error: HttpErrorResponse) => {
        this.procesandoEstadoId = null;
        this.mostrarError(error);
        this.listar();
      }

    });
  }

  // ==========================================
  // DELETE: ELIMINAR CITA
  // ==========================================

  eliminar(cita: Cita): void {

    if (this.eliminandoId !== null) {
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la cita #${cita.id}?`
    );

    if (!confirmar) {
      return;
    }

    this.eliminandoId = cita.id;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.citasApi.eliminar(cita.id).subscribe({

      next: () => {

        this.eliminandoId = null;
        this.mensajeExito = 'Cita eliminada correctamente.';

        this.listar();
      },

      error: (error: HttpErrorResponse) => {
        this.eliminandoId = null;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // MOSTRAR NOMBRES EN LUGAR DE IDS
  // ==========================================

  nombrePaciente(id: number): string {

    const paciente = this.pacientes.find(
      p => p.id === id
    );

    return paciente
      ? `${paciente.nombre} ${paciente.apellido}`
      : `Paciente #${id}`;
  }

  nombreOdontologo(id: number): string {

    const odontologo = this.odontologos.find(
      o => o.id === id
    );

    return odontologo
      ? `${odontologo.nombre} ${odontologo.apellido}`
      : `Odontólogo #${id}`;
  }

  nombreTratamiento(id: number): string {

    const tratamiento = this.tratamientos.find(
      s => s.id === id
    );

    return tratamiento
      ? tratamiento.nombre
      : `Tratamiento #${id}`;
  }

  // ==========================================
  // CONTROL DE ERRORES DE LA API
  // ==========================================

  private mostrarError(error: HttpErrorResponse): void {

    if (error.status === 0) {

      this.mensajeError =
        'No hay conexión con Spring Boot. Verifica que esté ejecutándose.';

    } else if (error.status === 400) {

      this.mensajeError =
        'Datos inválidos. Revisa las relaciones, fecha y hora.';

    } else if (error.status === 401) {

      this.mensajeError =
        'Tu sesión expiró. Inicia sesión nuevamente.';

    } else if (error.status === 403) {

      this.mensajeError =
        'No tienes permisos para administrar citas.';

    } else if (error.status === 404) {

      this.mensajeError =
        'No se encontró la cita o alguno de los registros relacionados.';

    } else if (error.status === 409) {

      this.mensajeError =
        'Existe un conflicto de horario o de datos con la cita.';

    } else {

      this.mensajeError =
        'No se pudo completar la operación. Verifica los horarios, datos y pagos asociados.';
    }
  }
}