
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Enfermeros,
  Enfermero,
  EnfermeroRequest
} from '../../core/services/enfermeros';

import {
  Usuarios,
  Usuario
} from '../../core/services/usuarios';

@Component({
  selector: 'app-enfermeros',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './enfermeros.html',
  styleUrl: './enfermeros.css'
})
export class EnfermerosPage implements OnInit {

  private servicio = inject(Enfermeros);
  private usuariosServicio = inject(Usuarios);

  enfermeros: Enfermero[] = [];
  usuariosDisponibles: Usuario[] = [];

  formulario: EnfermeroRequest = this.formularioVacio();

  editandoId: number | null = null;
  guardando = false;
  cargando = false;

  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  formularioVacio(): EnfermeroRequest {
    return {
      usuarioId: 0,
      cedula: '',
      numeroLicencia: '',
      telefono: '',
      especialidad: ''
    };
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';

    this.servicio.listar().subscribe({
      next: datos => {
        this.enfermeros = datos;
        this.cargando = false;
      },
      error: err => {
        this.error = err.error?.message
          || 'No se pudieron cargar los enfermeros.';
        this.cargando = false;
      }
    });

    this.usuariosServicio.listar().subscribe({
      next: datos => {
        this.usuariosDisponibles = datos.filter(
          usuario => usuario.rol === 'ENFERMERO'
            && usuario.activo
        );
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios.';
      }
    });
  }

  usuariosParaSeleccionar(): Usuario[] {
    const vinculados = new Set(
      this.enfermeros
        .filter(e => e.id !== this.editandoId)
        .map(e => e.usuarioId)
    );

    return this.usuariosDisponibles.filter(
      usuario => !vinculados.has(usuario.id)
    );
  }

  guardar(): void {
    if (this.guardando) return;

    this.error = '';
    this.mensaje = '';

    if (!this.formulario.usuarioId) {
      this.error = 'Selecciona una cuenta de usuario.';
      return;
    }

    this.guardando = true;

    const datos = { ...this.formulario };

    const peticion = this.editandoId === null
      ? this.servicio.crear(datos)
      : this.servicio.actualizar(this.editandoId, datos);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editandoId === null
          ? 'Enfermero registrado correctamente.'
          : 'Enfermero actualizado correctamente.';

        this.cancelar();
        this.cargar();
        this.guardando = false;
      },
      error: err => {
        this.error = err.error?.message
          || 'No se pudo guardar el enfermero.';
        this.guardando = false;
      }
    });
  }

  editar(enfermero: Enfermero): void {
    this.editandoId = enfermero.id;

    this.formulario = {
      usuarioId: enfermero.usuarioId,
      cedula: enfermero.cedula,
      numeroLicencia: enfermero.numeroLicencia,
      telefono: enfermero.telefono || '',
      especialidad: enfermero.especialidad || ''
    };

    this.error = '';
    this.mensaje = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  desactivar(enfermero: Enfermero): void {
    if (!confirm(`¿Desactivar a ${enfermero.nombre}?`)) {
      return;
    }

    this.servicio.desactivar(enfermero.id).subscribe({
      next: () => {
        this.mensaje = 'Enfermero desactivado correctamente.';
        this.cargar();
      },
      error: err => {
        this.error = err.error?.message
          || 'No se pudo desactivar el enfermero.';
      }
    });
  }

  cancelar(): void {
    this.editandoId = null;
    this.formulario = this.formularioVacio();
  }
}
