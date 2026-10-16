import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  OdontologosApi,
  Odontologo
} from '../../services/odontologos';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-odontologos',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './odontologos.html',
  styleUrl: './odontologos.css'
})
export class Odontologos implements OnInit {

  private api = inject(OdontologosApi);
  private auth = inject(Auth);

  // Solo el administrador puede modificar registros
  esAdmin = this.auth.esAdmin();

  odontologos: Odontologo[] = [];

  formulario: Odontologo = this.nuevo();

  editandoId: number | null = null;

  cargando = false;
  guardando = false;

  mensajeError = '';
  mensajeExito = '';

  // Cargar datos al abrir la pantalla
  ngOnInit(): void {
    this.listar();
  }

  // Formulario vacio
  private nuevo(): Odontologo {
    return {
      nombre: '',
      apellido: '',
      especialidad: '',
      telefono: '',
      correo: ''
    };
  }

  // GET: consultar odontologos
  listar(): void {

    this.cargando = true;
    this.mensajeError = '';

    this.api.listar().subscribe({
      next: (datos) => {
        this.odontologos = datos;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }
    });
  }

  // POST / PUT: registrar o actualizar
  guardar(): void {

    if (!this.esAdmin || this.guardando) {
      return;
    }

    if (!this.formulario.nombre.trim() ||
        !this.formulario.apellido.trim()) {
      this.mensajeError = 'Nombre y apellido son obligatorios.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const datos = { ...this.formulario };

    const peticion = this.editandoId !== null
      ? this.api.actualizar(this.editandoId, datos)
      : this.api.guardar(datos);

    peticion.subscribe({
      next: () => {

        this.mensajeExito = this.editandoId !== null
          ? 'Odontólogo actualizado correctamente.'
          : 'Odontólogo registrado correctamente.';

        this.guardando = false;
        this.cancelar();
        this.listar();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  // Cargar datos para editar
  editar(odontologo: Odontologo): void {

    if (!this.esAdmin) return;

    this.editandoId = odontologo.id ?? null;
    this.formulario = { ...odontologo };

    this.mensajeError = '';
    this.mensajeExito = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Limpiar formulario
  cancelar(): void {
    this.editandoId = null;
    this.formulario = this.nuevo();
  }

  // DELETE: eliminar odontologo
  eliminar(odontologo: Odontologo): void {

    if (!this.esAdmin || odontologo.id === undefined) {
      return;
    }

    const confirmar = window.confirm(
      `¿Eliminar al odontólogo ${odontologo.nombre} ${odontologo.apellido}?`
    );

    if (!confirmar) return;

    this.mensajeError = '';
    this.mensajeExito = '';

    this.api.eliminar(odontologo.id).subscribe({
      next: () => {
        this.mensajeExito = 'Odontólogo eliminado correctamente.';
        this.listar();
      },
      error: (error: HttpErrorResponse) => {
        this.mostrarError(error);
      }
    });
  }

  // Control de errores HTTP
  private mostrarError(error: HttpErrorResponse): void {

    if (error.status === 0) {
      this.mensajeError = 'No hay conexión con Spring Boot.';
    } else if (error.status === 400) {
      this.mensajeError = 'Revisa los datos ingresados.';
    } else if (error.status === 401) {
      this.mensajeError = 'Sesión expirada. Inicia sesión nuevamente.';
    } else if (error.status === 403) {
      this.mensajeError = 'No tienes permisos para esta operación.';
    } else if (error.status === 404) {
      this.mensajeError = 'Odontólogo no encontrado.';
    } else if (error.status === 409) {
      this.mensajeError = 'No se puede completar por un conflicto de datos.';
    } else {
      this.mensajeError =
        'Error al realizar la operación. Verifica si tiene citas asociadas.';
    }
  }
}