import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Estudiante,
  EstudianteRequest,
  EstudianteService
} from '../../services/estudiante';

import {
  Carrera,
  CarreraService
} from '../../services/carrera';

@Component({
  selector: 'app-estudiantes',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.css'
})
export class Estudiantes implements OnInit {

  estudiantes: Estudiante[] = [];
  carreras: Carrera[] = [];

  formulario: EstudianteRequest = {
    cedula: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    carreraId: null,
    usuarioId: null
  };

  editandoId: number | null = null;

  mensaje = '';
  error = '';

  constructor(
    private estudianteService: EstudianteService,
    private carreraService: CarreraService
  ) {}

  ngOnInit(): void {
    this.listar();
    this.listarCarreras();
  }

  listar(): void {

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

  listarCarreras(): void {

    this.carreraService
      .listar()
      .subscribe({

        next: datos => {
          this.carreras = datos;
        }
      });
  }

  guardar(): void {

    this.mensaje = '';
    this.error = '';

    if (
      !this.formulario.cedula.trim() ||
      !this.formulario.nombres.trim() ||
      !this.formulario.apellidos.trim() ||
      !this.formulario.carreraId
    ) {

      this.error =
        'Complete los campos obligatorios.';

      return;
    }

    if (this.editandoId !== null) {

      this.estudianteService
        .actualizar(
          this.editandoId,
          this.formulario
        )
        .subscribe({

          next: () => {

            this.mensaje =
              'Estudiante actualizado correctamente.';

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

    if (!this.formulario.usuarioId) {

      this.error =
        'Ingrese el ID del usuario asociado.';

      return;
    }

    this.estudianteService
      .guardar(this.formulario)
      .subscribe({

        next: () => {

          this.mensaje =
            'Estudiante registrado correctamente.';

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

  editar(estudiante: Estudiante): void {

    this.editandoId =
      estudiante.id;

    this.formulario = {
      cedula: estudiante.cedula,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      telefono: estudiante.telefono,
      carreraId: estudiante.carreraId,
      usuarioId: estudiante.usuarioId
    };
  }

  eliminar(estudiante: Estudiante): void {

    const confirmar =
      confirm(
        `¿Eliminar a ${estudiante.nombres} ${estudiante.apellidos}?`
      );

    if (!confirmar) {
      return;
    }

    this.estudianteService
      .eliminar(estudiante.id)
      .subscribe({

        next: () => {

          this.mensaje =
            'Estudiante eliminado correctamente.';

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
      cedula: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      carreraId: null,
      usuarioId: null
    };
  }
}