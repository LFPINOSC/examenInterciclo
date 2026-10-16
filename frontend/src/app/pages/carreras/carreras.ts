import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Carrera,
  CarreraService
} from '../../services/carrera';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-carreras',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './carreras.html',
  styleUrl: './carreras.css'
})
export class Carreras implements OnInit {

  carreras: Carrera[] = [];

  formulario: Carrera = {
    nombre: '',
    descripcion: '',
    activa: true
  };

  editandoId: number | null = null;

  mensaje = '';
  error = '';

  rol = '';

  constructor(
    private carreraService: CarreraService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.rol =
      this.authService.getRol() || '';

    this.listar();
  }

  esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  listar(): void {

    this.carreraService
      .listar()
      .subscribe({

        next: respuesta => {
          this.carreras = respuesta;
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

    if (!this.formulario.nombre.trim()) {

      this.error =
        'El nombre de la carrera es obligatorio.';

      return;
    }

    if (this.editandoId !== null) {

      this.carreraService
        .actualizar(
          this.editandoId,
          this.formulario
        )
        .subscribe({

          next: () => {

            this.mensaje =
              'Carrera actualizada correctamente.';

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

    this.carreraService
      .guardar(this.formulario)
      .subscribe({

        next: () => {

          this.mensaje =
            'Carrera registrada correctamente.';

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

  editar(carrera: Carrera): void {

    this.editandoId =
      carrera.id || null;

    this.formulario = {
      nombre: carrera.nombre,
      descripcion: carrera.descripcion,
      activa: carrera.activa
    };
  }

  eliminar(carrera: Carrera): void {

    if (!carrera.id) {
      return;
    }

    const confirmar =
      confirm(
        `¿Eliminar la carrera "${carrera.nombre}"?`
      );

    if (!confirmar) {
      return;
    }

    this.carreraService
      .eliminar(carrera.id)
      .subscribe({

        next: () => {

          this.mensaje =
            'Carrera eliminada correctamente.';

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
      nombre: '',
      descripcion: '',
      activa: true
    };
  }
}