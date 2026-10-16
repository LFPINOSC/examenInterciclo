import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

// Servicio de pagos
import {
  PagosApi,
  Pago
} from '../../services/pagos';

// Servicio de citas
import {
  CitasApi,
  Cita
} from '../../services/citas';

// Servicio de pacientes
import {
  Pacientes as PacientesApi,
  Paciente
} from '../../services/pacientes';

// Servicio de tratamientos
import {
  ServiciosApi,
  Servicio
} from '../../services/servicios';

// ==========================================
// DATOS DEL FORMULARIO
// ==========================================

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

interface FormularioPago {
  citaId: number | null;
  monto: number | null;
  metodoPago: MetodoPago;
}

// ==========================================
// COMPONENTE ANGULAR DE PAGOS
// ==========================================

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css'
})
export class Pagos implements OnInit {

  // ==========================================
  // INYECCION DE SERVICIOS
  // ==========================================

  private pagosApi = inject(PagosApi);
  private citasApi = inject(CitasApi);
  private pacientesApi = inject(PacientesApi);
  private serviciosApi = inject(ServiciosApi);

  // ==========================================
  // LISTAS DE LA BASE DE DATOS
  // ==========================================

  pagos: Pago[] = [];
  citas: Cita[] = [];
  pacientes: Paciente[] = [];
  tratamientos: Servicio[] = [];

  // ==========================================
  // ESTADO DEL FORMULARIO
  // ==========================================

  formulario: FormularioPago = this.nuevoPago();

  editandoId: number | null = null;

  cargando = false;
  guardando = false;
  procesandoId: number | null = null;

  mensajeError = '';
  mensajeExito = '';

  // ==========================================
  // INICIALIZACION
  // ==========================================

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Preparar formulario vacio
  private nuevoPago(): FormularioPago {
    return {
      citaId: null,
      monto: null,
      metodoPago: 'EFECTIVO'
    };
  }

  // ==========================================
  // LISTAR PAGOS Y DATOS RELACIONADOS
  // ==========================================

  cargarDatos(): void {

    this.cargando = true;

    // Consultar cuatro endpoints reales
    forkJoin({
      pagos: this.pagosApi.listar(),
      citas: this.citasApi.listar(),
      pacientes: this.pacientesApi.listar(),
      tratamientos: this.serviciosApi.listar()
    }).subscribe({

      next: (datos) => {

        this.pagos = datos.pagos;
        this.citas = datos.citas;
        this.pacientes = datos.pacientes;
        this.tratamientos = datos.tratamientos;

        this.cargando = false;
      },

      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }
    });
  }

  // ==========================================
  // CITAS QUE TODAVIA NO TIENEN PAGO
  // ==========================================

  get citasDisponibles(): Cita[] {

    return this.citas.filter(cita => {

      // Cuando editamos, conservamos su cita original
      const pagoExistente = this.pagos.find(
        pago => pago.citaId === cita.id
      );

      if (pagoExistente) {
        return pagoExistente.id === this.editandoId;
      }

      // No registrar pagos nuevos de citas canceladas
      return cita.estado !== 'CANCELADA';
    });
  }

  // ==========================================
  // COMPLETAR MONTO SEGUN TRATAMIENTO
  // ==========================================

  alSeleccionarCita(): void {

    if (this.editandoId !== null) {
      return;
    }

    const cita = this.citas.find(
      c => c.id === this.formulario.citaId
    );

    if (!cita) {
      this.formulario.monto = null;
      return;
    }

    const tratamiento = this.tratamientos.find(
      s => s.id === cita.servicioId
    );

    // Utilizar precio como valor inicial editable
    this.formulario.monto = tratamiento
      ? Number(tratamiento.precio)
      : null;
  }

  // ==========================================
  // REGISTRAR O ACTUALIZAR PAGO
  // ==========================================

  guardar(): void {

    if (this.guardando) {
      return;
    }

    const datos = this.formulario;

    // Validar cita seleccionada
    if (datos.citaId === null) {
      this.mensajeError = 'Selecciona una cita.';
      return;
    }

    // Validar monto positivo
    if (
      datos.monto === null ||
      !Number.isFinite(Number(datos.monto)) ||
      Number(datos.monto) <= 0
    ) {
      this.mensajeError = 'Ingresa un monto mayor que cero.';
      return;
    }

    // Validar metodo
    if (!datos.metodoPago) {
      this.mensajeError = 'Selecciona un método de pago.';
      return;
    }

    // Evitar pagos duplicados
    const citaPermitida = this.citasDisponibles.some(
      cita => cita.id === datos.citaId
    );

    if (!citaPermitida) {
      this.mensajeError =
        'Esta cita ya tiene un pago o no está disponible.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const monto = Number(datos.monto);
    const metodoPago = datos.metodoPago;

    // El pago existente conserva su cita original
    const peticion = this.editandoId !== null
      ? this.pagosApi.actualizar(this.editandoId, {
          monto,
          metodoPago
        })
      : this.pagosApi.guardar({
          citaId: datos.citaId,
          monto,
          metodoPago
        });

    peticion.subscribe({

      next: () => {

        this.mensajeExito = this.editandoId !== null
          ? 'Pago actualizado correctamente.'
          : 'Pago registrado correctamente.';

        this.guardando = false;
        this.cancelarEdicion();
        this.cargarDatos();
      },

      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  // ==========================================
  // EDITAR PAGO PENDIENTE
  // ==========================================

  editar(pago: Pago): void {

    if (pago.estado !== 'PENDIENTE') {
      this.mensajeError =
        'Solo puedes editar pagos pendientes.';
      return;
    }

    this.editandoId = pago.id;

    this.formulario = {
      citaId: pago.citaId,
      monto: Number(pago.monto),
      metodoPago: pago.metodoPago as MetodoPago
    };

    this.mensajeError = '';
    this.mensajeExito = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ==========================================
  // CANCELAR EDICION
  // ==========================================

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario = this.nuevoPago();
  }

  // ==========================================
  // MARCAR COMO PAGADO
  // ==========================================

  marcarPagado(pago: Pago): void {

    if (
      pago.estado !== 'PENDIENTE' ||
      this.procesandoId !== null
    ) {
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmas que recibiste el pago #${pago.id}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoId = pago.id;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.pagosApi.marcarPagado(pago.id).subscribe({

      next: () => {

        this.procesandoId = null;
        this.mensajeExito =
          'Pago marcado como PAGADO correctamente.';

        this.cargarDatos();
      },

      error: (error: HttpErrorResponse) => {
        this.procesandoId = null;
        this.mostrarError(error);
      }
    });
  }

  // ==========================================
  // CANCELAR UN PAGO PENDIENTE
  // ==========================================

  cancelarPago(pago: Pago): void {

    if (
      pago.estado !== 'PENDIENTE' ||
      this.procesandoId !== null
    ) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas cancelar el pago #${pago.id}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoId = pago.id;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.pagosApi.cancelar(pago.id).subscribe({

      next: () => {

        this.procesandoId = null;
        this.mensajeExito =
          'Pago cancelado correctamente.';

        this.cargarDatos();
      },

      error: (error: HttpErrorResponse) => {
        this.procesandoId = null;
        this.mostrarError(error);
      }
    });
  }

  // ==========================================
  // ELIMINAR REGISTRO
  // ==========================================

  eliminar(pago: Pago): void {

    if (this.procesandoId !== null) {
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el registro de pago #${pago.id}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoId = pago.id;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.pagosApi.eliminar(pago.id).subscribe({

      next: () => {

        this.procesandoId = null;
        this.mensajeExito =
          'Registro de pago eliminado correctamente.';

        this.cancelarEdicion();
        this.cargarDatos();
      },

      error: (error: HttpErrorResponse) => {
        this.procesandoId = null;
        this.mostrarError(error);
      }
    });
  }

  // ==========================================
  // OBTENER NOMBRES PARA LA TABLA
  // ==========================================

  nombrePaciente(pacienteId: number): string {

    const paciente = this.pacientes.find(
      p => p.id === pacienteId
    );

    return paciente
      ? `${paciente.nombre} ${paciente.apellido}`
      : `Paciente #${pacienteId}`;
  }

  nombreTratamiento(servicioId: number): string {

    const tratamiento = this.tratamientos.find(
      s => s.id === servicioId
    );

    return tratamiento
      ? tratamiento.nombre
      : `Tratamiento #${servicioId}`;
  }

  // Obtener cita de un pago
  obtenerCita(citaId: number): Cita | undefined {
    return this.citas.find(c => c.id === citaId);
  }

  // ==========================================
  // MANEJO DE ERRORES HTTP
  // ==========================================

  private mostrarError(error: HttpErrorResponse): void {

    if (error.status === 0) {

      this.mensajeError =
        'No se pudo conectar con Spring Boot.';

    } else if (error.status === 400) {

      this.mensajeError =
        'Datos inválidos. Revisa la cita, monto y método de pago.';

    } else if (error.status === 401) {

      this.mensajeError =
        'Tu sesión expiró. Vuelve a iniciar sesión.';

    } else if (error.status === 403) {

      this.mensajeError =
        'No tienes permisos para administrar pagos.';

    } else if (error.status === 404) {

      this.mensajeError =
        'No se encontró el pago o la cita seleccionada.';

    } else if (error.status === 409) {

      this.mensajeError =
        'La cita ya tiene un pago o la operación no está permitida.';

    } else {

      this.mensajeError =
        'No se pudo completar la operación. Revisa los datos o el estado del pago.';
    }
  }
}