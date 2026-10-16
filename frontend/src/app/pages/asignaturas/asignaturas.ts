import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Asignatura,
  AsignaturaRequest,
  AsignaturaService
} from '../../services/asignatura';

import {
  Carrera,
  CarreraService
} from '../../services/carrera';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-asignaturas',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './asignaturas.html',
  styleUrl: './asignaturas.css'
})
export class Asignaturas implements OnInit {

  asignaturas: Asignatura[] = [];
  carreras: Carrera[] = [];

  formulario: AsignaturaRequest = {
    codigo: '',
    nombre: '',
    creditos: 1,
    nivel: 1,
    activa: true,
    carreraId: null
  };

  editandoId: number | null = null;

  mensaje = '';
  error = '';
  rol = '';

  constructor(
    private asignaturaService: AsignaturaService,
    private carreraService: CarreraService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.rol =
      this.authService.getRol() || '';

    this.listar();
    this.listarCarreras();
  }

  esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  listar(): void {

    this.asignaturaService
      .listar()
      .subscribe({

        next: datos => {
          this.asignaturas = datos;
        },

        error: () => {
          this.error =
            'No se pudieron cargar las asignaturas.';
        }
      });
  }

  listarCarreras(): void {

    this.carreraService
      .listar()
      .subscribe({

        next: datos => {
          this.carreras = datos;
        },

        error: () => {
          this.error =
            'No se pudieron cargar las carreras.';
        }
      });
  }

  guardar(): void {

    this.mensaje = '';
    this.error = '';

    if (
      !this.formulario.codigo.trim() ||
      !this.formulario.nombre.trim() ||
      !this.formulario.carreraId
    ) {

      this.error =
        'Complete los campos obligatorios.';

      return;
    }

    if (this.editandoId !== null) {

      this.asignaturaService
        .actualizar(
          this.editandoId,
          this.formulario
        )
        .subscribe({

          next: () => {

            this.mensaje =
              'Asignatura actualizada correctamente.';

            this.limpiar();
            this.listar();
          },

          error: error => {

            this.error =
              error.error?.mensaje ||
              'No se pudo actualizar.';
          }
        });

      return;
    }

    this.asignaturaService
      .guardar(this.formulario)
      .subscribe({

        next: () => {

          this.mensaje =
            'Asignatura registrada correctamente.';

          this.limpiar();
          this.listar();
        },

        error: error => {

          this.error =
            error.error?.mensaje ||
            'No se pudo registrar.';
        }
      });
  }

  editar(asignatura: Asignatura): void {

    this.editandoId =
      asignatura.id || null;

    this.formulario = {
      codigo: asignatura.codigo,
      nombre: asignatura.nombre,
      creditos: asignatura.creditos,
      nivel: asignatura.nivel,
      activa: asignatura.activa,
      carreraId: asignatura.carrera.id || null
    };
  }

  eliminar(asignatura: Asignatura): void {

    if (!asignatura.id) {
      return;
    }

    const confirmar =
      confirm(
        `¿Eliminar la asignatura "${asignatura.nombre}"?`
      );

    if (!confirmar) {
      return;
    }

    this.asignaturaService
      .eliminar(asignatura.id)
      .subscribe({

        next: () => {

          this.mensaje =
            'Asignatura eliminada correctamente.';

          this.listar();
        },

        error: error => {

          this.error =
            error.error?.mensaje ||
            'No se pudo eliminar.';
        }
      });
  }

  limpiar(): void {

    this.editandoId = null;

    this.formulario = {
      codigo: '',
      nombre: '',
      creditos: 1,
      nivel: 1,
      activa: true,
      carreraId: null
    };
  }
}