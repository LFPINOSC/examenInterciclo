import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Servicio que se comunica con la API
import {
  ServiciosApi,
  Servicio
} from '../../services/servicios';

// Servicio de autenticacion y permisos
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-tratamientos',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './tratamientos.html',
  styleUrl: './tratamientos.css'
})
export class Tratamientos implements OnInit {

  // ==========================================
  // INYECCION DE SERVICIOS
  // ==========================================

  private api = inject(ServiciosApi);
  private auth = inject(Auth);

  // Verifica si el usuario es administrador
  esAdmin = this.auth.esAdmin();

  // ==========================================
  // VARIABLES DEL COMPONENTE
  // ==========================================

  tratamientos: Servicio[] = [];

  formulario: Servicio = this.nuevo();

  editandoId: number | null = null;

  cargando = false;
  guardando = false;

  mensajeError = '';
  mensajeExito = '';

  // Cargar tratamientos cuando se abre la pagina
  ngOnInit(): void {
    this.listar();
  }

  // ==========================================
  // FORMULARIO VACIO
  // ==========================================

  private nuevo(): Servicio {
    return {
      nombre: '',
      descripcion: '',
      precio: 0
    };
  }

  // ==========================================
  // GET - LISTAR TRATAMIENTOS
  // ==========================================

  listar(): void {

    this.cargando = true;
    this.mensajeError = '';

    this.api.listar().subscribe({

      next: (datos) => {
        this.tratamientos = datos;
        this.cargando = false;
      },

      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // POST / PUT - GUARDAR O ACTUALIZAR
  // ==========================================

  guardar(): void {

    // Los usuarios normales no pueden modificar
    if (!this.esAdmin || this.guardando) {
      return;
    }

    // Validar nombre
    if (!this.formulario.nombre.trim()) {
      this.mensajeError = 'El nombre del tratamiento es obligatorio.';
      return;
    }

    // Validar precio
    if (
      !Number.isFinite(this.formulario.precio) ||
      this.formulario.precio < 0
    ) {
      this.mensajeError = 'Ingresa un precio válido.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    // Preparar datos para enviarlos a Spring Boot
    const datos: Servicio = {
      nombre: this.formulario.nombre.trim(),
      descripcion: this.formulario.descripcion.trim(),
      precio: Number(this.formulario.precio)
    };

    // Determinar si corresponde POST o PUT
    const peticion = this.editandoId !== null
      ? this.api.actualizar(this.editandoId, datos)
      : this.api.guardar(datos);

    peticion.subscribe({

      next: () => {

        this.mensajeExito = this.editandoId !== null
          ? 'Tratamiento actualizado correctamente.'
          : 'Tratamiento registrado correctamente.';

        this.guardando = false;

        // Limpiar formulario
        this.cancelar();

        // Recargar listado
        this.listar();
      },

      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // EDITAR TRATAMIENTO
  // ==========================================

  editar(tratamiento: Servicio): void {

    if (!this.esAdmin) {
      return;
    }

    this.editandoId = tratamiento.id ?? null;

    // Copiar datos al formulario
    this.formulario = { ...tratamiento };

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

  cancelar(): void {
    this.editandoId = null;
    this.formulario = this.nuevo();
  }

  // ==========================================
  // DELETE - ELIMINAR TRATAMIENTO
  // ==========================================

  eliminar(tratamiento: Servicio): void {

    if (!this.esAdmin || tratamiento.id === undefined) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas eliminar el tratamiento "${tratamiento.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.mensajeError = '';
    this.mensajeExito = '';

    this.api.eliminar(tratamiento.id).subscribe({

      next: () => {
        this.mensajeExito = 'Tratamiento eliminado correctamente.';
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
        'No hay conexión con la API Spring Boot.';

    } else if (error.status === 400) {

      this.mensajeError =
        'Revisa el nombre y el precio del tratamiento.';

    } else if (error.status === 401) {

      this.mensajeError =
        'Tu sesión expiró. Vuelve a iniciar sesión.';

    } else if (error.status === 403) {

      this.mensajeError =
        'No tienes permisos para realizar esta operación.';

    } else if (error.status === 404) {

      this.mensajeError =
        'El tratamiento no fue encontrado.';

    } else if (error.status === 409) {

      this.mensajeError =
        'Existe un conflicto con este tratamiento.';

    } else {

      this.mensajeError =
        'No se pudo completar la operación. Verifica si el tratamiento tiene citas asociadas.';
    }
  }
}