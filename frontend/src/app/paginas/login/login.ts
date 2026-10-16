// ==========================================
// LOGIN - CONTROL DE CITAS MEDICAS
// ==========================================

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Servicio de autenticacion con JWT.
import { Auth } from '../../servicios/auth';

/**
 * Componente encargado del inicio de sesion.
 *
 * Permite:
 * 1. Ingresar usuario y contraseña.
 * 2. Mostrar u ocultar la contraseña.
 * 3. Validar campos obligatorios.
 * 4. Enviar credenciales al backend.
 * 5. Mostrar errores de autenticacion.
 * 6. Redirigir al dashboard.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // Servicios necesarios.
  private auth = inject(Auth);
  private router = inject(Router);

  // Datos del formulario.
  username = '';
  password = '';

  // Estados de la interfaz.
  mostrarPassword = signal(false);
  cargando = signal(false);
  error = signal('');

  /**
   * Muestra u oculta la contraseña.
   */
  alternarPassword(): void {
    this.mostrarPassword.update(valor => !valor);
  }

  /**
   * Inicia sesion mediante Spring Boot.
   */
  iniciarSesion(): void {

    // Limpiar mensajes anteriores.
    this.error.set('');

    // Comprobar campos obligatorios.
    if (!this.username.trim() || !this.password) {
      this.error.set('Complete usuario y contraseña.');
      return;
    }

    // Evitar solicitudes repetidas.
    if (this.cargando()) {
      return;
    }

    this.cargando.set(true);

    // Enviar las credenciales al backend.
    this.auth.login(
      this.username.trim(),
      this.password
    ).subscribe({

      // Login correcto.
      next: () => {
        this.cargando.set(false);
        this.router.navigateByUrl('/dashboard');
      },

      // Error del servidor o credenciales.
      error: (err: HttpErrorResponse) => {

        this.cargando.set(false);

        if (err.status === 401) {
          this.error.set(
            'Usuario o contraseña incorrectos.'
          );
        } else if (err.status === 0) {
          this.error.set(
            'No se pudo conectar con el backend.'
          );
        } else {
          this.error.set(
            err.error?.mensaje ||
            'Ocurrió un error al iniciar sesión.'
          );
        }
      }
    });
  }
}