
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Usuarios,
  Usuario,
  UsuarioRequest,
  Rol
} from '../../core/services/usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosPage implements OnInit {

  private servicio = inject(Usuarios);

  usuarios: Usuario[] = [];

  formulario: UsuarioRequest = this.nuevoFormulario();

  editandoId: number | null = null;

  cargando = false;
  guardando = false;

  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  nuevoFormulario(): UsuarioRequest {
    return {
      nombre: '',
      correo: '',
      password: '',
      rol: 'ENFERMERO'
    };
  }

  cargarUsuarios(): void {
    this.cargando = true;

    this.servicio.listar().subscribe({
      next: (datos) => {
        this.usuarios = datos;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.message
          || 'No se pudieron cargar los usuarios.';

        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.guardando) return;

    this.error = '';
    this.mensaje = '';

    if (!this.formulario.nombre.trim()
        || !this.formulario.correo.trim()) {

      this.error = 'Completa el nombre y el correo.';
      return;
    }

    if (this.editandoId === null
        && this.formulario.password.length < 8) {

      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.guardando = true;

    const datos: UsuarioRequest = {
      ...this.formulario,
      nombre: this.formulario.nombre.trim(),
      correo: this.formulario.correo.trim()
    };

    const peticion = this.editandoId === null
      ? this.servicio.crear(datos)
      : this.servicio.actualizar(this.editandoId, datos);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editandoId === null
          ? 'Usuario registrado correctamente.'
          : 'Usuario actualizado correctamente.';

        this.cancelar();
        this.cargarUsuarios();
        this.guardando = false;
      },
      error: (err) => {
        this.error = err.error?.message
          || 'No se pudo guardar el usuario.';

        this.guardando = false;
      }
    });
  }

  editar(usuario: Usuario): void {
    this.editandoId = usuario.id;

    this.formulario = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol: usuario.rol
    };

    this.error = '';
    this.mensaje = '';
  }

  desactivar(usuario: Usuario): void {
    if (!confirm(`¿Desactivar al usuario ${usuario.nombre}?`)) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    this.servicio.desactivar(usuario.id).subscribe({
      next: () => {
        this.mensaje = 'Usuario desactivado correctamente.';
        this.cargarUsuarios();
      },
      error: (err) => {
        this.error = err.error?.message
          || 'No se pudo desactivar el usuario.';
      }
    });
  }

  cancelar(): void {
    this.editandoId = null;
    this.formulario = this.nuevoFormulario();
  }
}
