import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Servicio de administracion de usuarios
import {
  UsuariosApi,
  Usuario,
  RolUsuario
} from '../../services/usuarios';

// Servicio de autenticacion JWT
import { Auth } from '../../services/auth';

// ==========================================
// COMPONENTE DE USUARIOS
// ==========================================

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {

  // ==========================================
  // SERVICIOS
  // ==========================================

  private usuariosApi = inject(UsuariosApi);
  private auth = inject(Auth);

  // ==========================================
  // DATOS DEL ADMINISTRADOR
  // ==========================================

  usernameActual = this.auth.obtenerUsuario() || '';

  // ==========================================
  // VARIABLES DE LA PANTALLA
  // ==========================================

  usuarios: Usuario[] = [];

  cargando = false;

  // Identifica al usuario cuya solicitud se procesa
  procesandoId: number | null = null;

  mensajeError = '';
  mensajeExito = '';

  // ==========================================
  // CARGAR USUARIOS AL ENTRAR
  // ==========================================

  ngOnInit(): void {
    this.listar();
  }

  // ==========================================
  // GET - LISTAR USUARIOS
  // ==========================================

  listar(): void {

    this.cargando = true;
    this.mensajeError = '';

    this.usuariosApi.listar().subscribe({

      next: (datos) => {
        this.usuarios = datos;
        this.cargando = false;
      },

      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // COMPROBAR SI ES EL USUARIO ACTUAL
  // ==========================================

  esMiCuenta(usuario: Usuario): boolean {

    return usuario.username === this.usernameActual;
  }

  // ==========================================
  // PATCH - CAMBIAR ROL
  // ==========================================

  cambiarRol(usuario: Usuario, nuevoRol: string): void {

    if (this.procesandoId !== null) {
      return;
    }

    // Evitar cambiar el rol de nuestra propia cuenta
    if (this.esMiCuenta(usuario)) {
      this.mensajeError =
        'No puedes modificar tu propio rol.';
      return;
    }

    // Validar los roles admitidos por Spring Boot
    if (nuevoRol !== 'ADMIN' && nuevoRol !== 'USER') {
      this.mensajeError = 'El rol seleccionado no es válido.';
      return;
    }

    const rol = nuevoRol as RolUsuario;

    // No enviar una solicitud innecesaria
    if (rol === usuario.rol) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas cambiar el rol de ${usuario.username} a ${rol}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoId = usuario.id;

    this.mensajeError = '';
    this.mensajeExito = '';

    // Enviar cambio a Spring Boot
    this.usuariosApi.cambiarRol(usuario.id, rol).subscribe({

      next: (actualizado) => {

        // Actualizar la informacion de la tabla
        this.usuarios = this.usuarios.map(u =>
          u.id === actualizado.id ? actualizado : u
        );

        this.procesandoId = null;

        this.mensajeExito =
          `Rol de ${usuario.username} actualizado correctamente.`;
      },

      error: (error: HttpErrorResponse) => {

        this.procesandoId = null;

        this.mostrarError(error);

        // Volver a consultar el estado real
        this.listar();
      }

    });
  }

  // ==========================================
  // PATCH - ACTIVAR USUARIO
  // ==========================================

  activar(usuario: Usuario): void {

    if (this.procesandoId !== null || usuario.activo) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas activar la cuenta de ${usuario.username}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoId = usuario.id;

    this.mensajeError = '';
    this.mensajeExito = '';

    this.usuariosApi.activar(usuario.id).subscribe({

      next: (actualizado) => {

        this.usuarios = this.usuarios.map(u =>
          u.id === actualizado.id ? actualizado : u
        );

        this.procesandoId = null;

        this.mensajeExito =
          `Usuario ${usuario.username} activado correctamente.`;
      },

      error: (error: HttpErrorResponse) => {
        this.procesandoId = null;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // PATCH - DESACTIVAR USUARIO
  // ==========================================

  desactivar(usuario: Usuario): void {

    if (this.procesandoId !== null || !usuario.activo) {
      return;
    }

    // Evitar desactivar la cuenta propia
    if (this.esMiCuenta(usuario)) {
      this.mensajeError =
        'No puedes desactivar tu propia cuenta.';
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas desactivar a ${usuario.username}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoId = usuario.id;

    this.mensajeError = '';
    this.mensajeExito = '';

    this.usuariosApi.desactivar(usuario.id).subscribe({

      next: (actualizado) => {

        this.usuarios = this.usuarios.map(u =>
          u.id === actualizado.id ? actualizado : u
        );

        this.procesandoId = null;

        this.mensajeExito =
          `Usuario ${usuario.username} desactivado correctamente.`;
      },

      error: (error: HttpErrorResponse) => {
        this.procesandoId = null;
        this.mostrarError(error);
      }

    });
  }

  // ==========================================
  // MANEJO DE ERRORES HTTP
  // ==========================================

  private mostrarError(error: HttpErrorResponse): void {

    if (error.status === 0) {

      this.mensajeError =
        'No hay conexión con Spring Boot.';

    } else if (error.status === 400) {

      this.mensajeError =
        'Los datos enviados no son válidos.';

    } else if (error.status === 401) {

      this.mensajeError =
        'Tu sesión expiró. Vuelve a iniciar sesión.';

    } else if (error.status === 403) {

      this.mensajeError =
        'No tienes permisos de administrador.';

    } else if (error.status === 404) {

      this.mensajeError =
        'El usuario seleccionado no existe.';

    } else if (error.status === 409) {

      this.mensajeError =
        'No puedes modificar tu propia cuenta de esa manera.';

    } else {

      this.mensajeError =
        'Ocurrió un error al administrar el usuario.';
    }
  }
}