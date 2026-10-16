import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Servicio de autenticacion conectado a Spring Boot
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  // Servicio para conectarse con la API
  private auth = inject(Auth);

  // Servicio para navegar entre paginas
  private router = inject(Router);

  // Datos ingresados en el formulario
  username: string = '';
  password: string = '';

  // Mostrar u ocultar contrasena
  mostrarContrasena: boolean = false;

  // Estado del formulario
  cargando: boolean = false;

  // Mensaje de error
  mensajeError: string = '';

  // ==========================================
  // MOSTRAR / OCULTAR CONTRASENA
  // ==========================================

  cambiarVisibilidad(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  // ==========================================
  // INICIAR SESION CON SPRING BOOT
  // ==========================================

  iniciarSesion(): void {

    // Limpiar errores anteriores
    this.mensajeError = '';

    // Validar campos obligatorios
    if (!this.username.trim() || !this.password) {
      this.mensajeError =
        'Debes ingresar tu usuario y contraseña.';
      return;
    }

    // Evitar multiples solicitudes
    if (this.cargando) {
      return;
    }

    this.cargando = true;

    // Enviar credenciales al backend
    this.auth.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({

      // Login correcto
      next: (respuesta) => {

        this.cargando = false;

        // El servicio Auth ya guarda el token JWT
        console.log('Inicio de sesion correcto');

        // Redirigir al panel principal
        this.router.navigateByUrl('/dashboard');
      },

      // Error durante el login
      error: (error: HttpErrorResponse) => {

        this.cargando = false;

        if (error.status === 401) {

          this.mensajeError =
            'Usuario o contraseña incorrectos.';

        } else if (error.status === 403) {

          this.mensajeError =
            'No tienes permiso para ingresar.';

        } else if (error.status === 400) {

          this.mensajeError =
            'Verifica los datos ingresados.';

        } else if (error.status === 0) {

          this.mensajeError =
            'No se pudo conectar con el servidor. Verifica que Spring Boot esté funcionando.';

        } else {

          this.mensajeError =
            'Ocurrió un error al iniciar sesión. Inténtalo nuevamente.';

        }

      }

    });
  }

  // ==========================================
  // IR A REGISTRO
  // ==========================================

  irRegistro(): void {
    this.router.navigateByUrl('/registro');
  }

}