import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

// Importar el servicio y la interfaz del paciente
import {
  Pacientes as PacientesService,
  Paciente
} from '../../services/pacientes';

// Componente visual de gestion de pacientes
@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes implements OnInit {

  // Conexion con el servicio de la API
  private api = inject(PacientesService);

  // Lista de pacientes de PostgreSQL
  pacientes: Paciente[] = [];

  // Formulario
  formulario: Paciente = this.nuevoPaciente();

  // Identificador del paciente en edicion
  editandoId: number | null = null;

  // Estados de carga
  cargando = false;
  guardando = false;

  // Mensajes
  mensajeError = '';
  mensajeExito = '';

  // Cargar pacientes al ingresar a la pantalla
  ngOnInit(): void {
    this.listar();
  }

  // Crear un formulario vacio
  private nuevoPaciente(): Paciente {
    return {
      cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      direccion: ''
    };
  }

  // ==========================================
  // LISTAR PACIENTES
  // ==========================================

  listar(): void {

    this.cargando = true;
    this.mensajeError = '';

    this.api.listar().subscribe({

      next: (datos) => {
        this.pacientes = datos;
        this.cargando = false;
      },

      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // GUARDAR O ACTUALIZAR PACIENTE
  // ==========================================

  guardar(): void {

    if (this.guardando) {
      return;
    }

    this.mensajeError = '';
    this.mensajeExito = '';
    this.guardando = true;

    const datos = { ...this.formulario };

    // Determinar si se crea o actualiza
    const peticion = this.editandoId !== null
      ? this.api.actualizar(this.editandoId, datos)
      : this.api.guardar(datos);

    peticion.subscribe({

      next: () => {

        this.mensajeExito = this.editandoId !== null
          ? 'Paciente actualizado correctamente.'
          : 'Paciente registrado correctamente.';

        this.guardando = false;

        // Limpiar formulario
        this.cancelarEdicion();

        // Actualizar tabla
        this.listar();
      },

      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // EDITAR PACIENTE
  // ==========================================

  editar(paciente: Paciente): void {

    this.editandoId = paciente.id ?? null;

    this.formulario = { ...paciente };

    this.mensajeError = '';
    this.mensajeExito = '';

    // Subir al formulario
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
    this.formulario = this.nuevoPaciente();
  }

  // ==========================================
  // ELIMINAR PACIENTE
  // ==========================================

  eliminar(paciente: Paciente): void {

    if (paciente.id === undefined) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas eliminar al paciente ${paciente.nombre} ${paciente.apellido}?`
    );

    if (!confirmar) {
      return;
    }

    this.mensajeError = '';
    this.mensajeExito = '';

    this.api.eliminar(paciente.id).subscribe({

      next: () => {

        this.mensajeExito =
          'Paciente eliminado correctamente.';

        this.listar();
      },

      error: (error: HttpErrorResponse) => {
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // CONTROL DE ERRORES HTTP
  // ==========================================

  private mostrarError(error: HttpErrorResponse): void {

    if (error.status === 0) {

      this.mensajeError =
        'No se pudo conectar con Spring Boot.';

    } else if (error.status === 400) {

      this.mensajeError =
        'Revisa los datos ingresados.';

    } else if (error.status === 401) {

      this.mensajeError =
        'Tu sesión expiró. Inicia sesión nuevamente.';

    } else if (error.status === 403) {

      this.mensajeError =
        'No tienes permisos de administrador.';

    } else if (error.status === 404) {

      this.mensajeError =
        'Paciente no encontrado.';

    } else if (error.status === 409) {

      this.mensajeError =
        'La cédula ya está registrada o existe un conflicto.';

    } else {

      this.mensajeError =
        'No se pudo completar la operación. Revisa los datos o las relaciones del paciente.';
    }
  }
}