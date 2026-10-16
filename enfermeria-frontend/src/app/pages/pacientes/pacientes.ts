
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Pacientes,
  Paciente,
  PacienteRequest
} from '../../core/services/pacientes';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class PacientesPage implements OnInit {
  private servicio = inject(Pacientes);

  pacientes: Paciente[] = [];
  editandoId: number | null = null;
  mensaje = '';
  error = '';
  guardando = false;

  formulario: PacienteRequest = this.formularioVacio();

  ngOnInit(): void {
    this.cargar();
  }

  formularioVacio(): PacienteRequest {
    return {
      cedula: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      telefono: '',
      direccion: ''
    };
  }

  cargar(): void {
    this.servicio.listar().subscribe({
      next: datos => {
        this.pacientes = datos;
        this.error = '';
      },
      error: () => {
        this.error = 'No se pudieron cargar los pacientes.';
      }
    });
  }

  guardar(): void {
    if (this.guardando) return;

    this.mensaje = '';
    this.error = '';
    this.guardando = true;

    const peticion = this.editandoId === null
      ? this.servicio.crear(this.formulario)
      : this.servicio.actualizar(this.editandoId, this.formulario);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editandoId === null
          ? 'Paciente registrado correctamente.'
          : 'Paciente actualizado correctamente.';

        this.cancelar();
        this.cargar();
        this.guardando = false;
      },
      error: err => {
        this.error = err.error?.message
          || 'No se pudo guardar el paciente.';
        this.guardando = false;
      }
    });
  }

  editar(paciente: Paciente): void {
    this.editandoId = paciente.id;

    this.formulario = {
      cedula: paciente.cedula,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      fechaNacimiento: paciente.fechaNacimiento,
      telefono: paciente.telefono,
      direccion: paciente.direccion
    };
  }

  eliminar(paciente: Paciente): void {
    if (!confirm(`¿Eliminar a ${paciente.nombres} ${paciente.apellidos}?`)) {
      return;
    }

    this.servicio.eliminar(paciente.id).subscribe({
      next: () => {
        this.mensaje = 'Paciente eliminado correctamente.';
        this.cargar();
      },
      error: err => {
        this.error = err.error?.message
          || 'No se pudo eliminar el paciente.';
      }
    });
  }

  cancelar(): void {
    this.editandoId = null;
    this.formulario = this.formularioVacio();
  }
}
