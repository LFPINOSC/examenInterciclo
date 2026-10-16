import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Matricula,
  MatriculaRequest,
  MatriculaService
} from '../../services/matricula';

import {
  Asignatura,
  AsignaturaService
} from '../../services/asignatura';

import {
  Estudiante,
  EstudianteService
} from '../../services/estudiante';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-matriculas',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './matriculas.html',
  styleUrl: './matriculas.css'
})
export class Matriculas implements OnInit {

  matriculas: Matricula[] = [];
  asignaturas: Asignatura[] = [];
  estudiantes: Estudiante[] = [];

  rol = '';

  formulario: MatriculaRequest = {
    estudianteId: null,
    periodo: '',
    asignaturaIds: []
  };

  mensaje = '';
  error = '';
  cargando = false;

  constructor(
    private matriculaService: MatriculaService,
    private asignaturaService: AsignaturaService,
    private estudianteService: EstudianteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.rol =
      this.authService.getRol() || '';

    this.listarMatriculas();
    this.listarAsignaturas();

    if (this.esAdmin()) {
      this.listarEstudiantes();
    }
  }

  esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  esEstudiante(): boolean {
    return this.rol === 'ESTUDIANTE';
  }

  /**
   * ADMIN ve todas.
   * ESTUDIANTE ve únicamente las suyas.
   */
  listarMatriculas(): void {

    if (this.esAdmin()) {

      this.matriculaService
        .listar()
        .subscribe({
          next: datos => {
            this.matriculas = datos;
          },
          error: () => {
            this.error =
              'No se pudieron cargar las matrículas.';
          }
        });

    } else {

      this.matriculaService
        .listarPropias()
        .subscribe({
          next: datos => {
            this.matriculas = datos;
          },
          error: () => {
            this.error =
              'No se pudieron cargar sus matrículas.';
          }
        });
    }
  }

  listarAsignaturas(): void {

    this.asignaturaService
      .listar()
      .subscribe({
        next: datos => {

          // Solo mostramos asignaturas activas
          this.asignaturas =
            datos.filter(
              asignatura => asignatura.activa
            );
        },

        error: () => {
          this.error =
            'No se pudieron cargar las asignaturas.';
        }
      });
  }

  listarEstudiantes(): void {

    this.estudianteService
      .listar()
      .subscribe({
        next: datos => {
          this.estudiantes = datos;
        },

        error: () => {
          this.error =
            'No se pudieron cargar los estudiantes.';
        }
      });
  }

  /**
   * Agrega o elimina una materia
   * de la matrícula.
   */
  cambiarAsignatura(
    id: number,
    seleccionada: boolean
  ): void {

    if (seleccionada) {

      if (
        !this.formulario.asignaturaIds
          .includes(id)
      ) {
        this.formulario
          .asignaturaIds
          .push(id);
      }

    } else {

      this.formulario.asignaturaIds =
        this.formulario
          .asignaturaIds
          .filter(
            asignaturaId =>
              asignaturaId !== id
          );
    }
  }

  estaSeleccionada(id: number): boolean {

    return this.formulario
      .asignaturaIds
      .includes(id);
  }

  guardar(): void {

    this.mensaje = '';
    this.error = '';

    if (!this.formulario.periodo.trim()) {

      this.error =
        'Ingrese el período académico.';

      return;
    }

    if (
      this.formulario
        .asignaturaIds.length === 0
    ) {

      this.error =
        'Seleccione al menos una asignatura.';

      return;
    }

    if (
      this.esAdmin() &&
      !this.formulario.estudianteId
    ) {

      this.error =
        'Seleccione un estudiante.';

      return;
    }

    this.cargando = true;

    if (this.esAdmin()) {

      this.matriculaService
        .guardar(this.formulario)
        .subscribe({

          next: () => {
            this.guardadoCorrecto();
          },

          error: error => {
            this.error =
              error.error?.mensaje ||
              'No se pudo registrar la matrícula.';

            this.cargando = false;
          }
        });

    } else {

      this.matriculaService
        .guardarPropia(
          this.formulario
        )
        .subscribe({

          next: () => {
            this.guardadoCorrecto();
          },

          error: error => {
            this.error =
              error.error?.mensaje ||
              'No se pudo registrar la matrícula.';

            this.cargando = false;
          }
        });
    }
  }

  guardadoCorrecto(): void {

    this.cargando = false;

    this.mensaje =
      'Matrícula registrada correctamente.';

    this.limpiar();

    this.listarMatriculas();
  }

  cancelar(matricula: Matricula): void {

    if (
      matricula.estado === 'CANCELADA'
    ) {
      return;
    }

    const confirmar =
      confirm(
        '¿Está seguro de cancelar esta matrícula?'
      );

    if (!confirmar) {
      return;
    }

    this.matriculaService
      .cancelarPropia(matricula.id)
      .subscribe({

        next: () => {

          this.mensaje =
            'Matrícula cancelada correctamente.';

          this.listarMatriculas();
        },

        error: error => {

          this.error =
            error.error?.mensaje ||
            'No se pudo cancelar.';
        }
      });
  }

  eliminar(matricula: Matricula): void {

    const confirmar =
      confirm(
        `¿Eliminar la matrícula #${matricula.id}?`
      );

    if (!confirmar) {
      return;
    }

    this.matriculaService
      .eliminar(matricula.id)
      .subscribe({

        next: () => {

          this.mensaje =
            'Matrícula eliminada correctamente.';

          this.listarMatriculas();
        },

        error: error => {

          this.error =
            error.error?.mensaje ||
            'No se pudo eliminar.';
        }
      });
  }

  limpiar(): void {

    this.formulario = {
      estudianteId: null,
      periodo: '',
      asignaturaIds: []
    };
  }
}