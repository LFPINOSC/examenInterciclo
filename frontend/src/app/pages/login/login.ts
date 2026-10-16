import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  correo: string = '';
  password: string = '';

  mensaje: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Envía las credenciales al backend.
   */
  iniciarSesion(): void {

    this.mensaje = '';

    if (
      !this.correo ||
      !this.password
    ) {

      this.mensaje =
        'Complete todos los campos.';

      return;
    }

    this.cargando = true;

    this.authService
      .login(
        this.correo,
        this.password
      )
      .subscribe({

        // Login correcto
        next: () => {

          this.cargando = false;

          this.router.navigate([
            '/dashboard'
          ]);
        },

        // Credenciales incorrectas
        error: error => {

          this.cargando = false;

          this.mensaje =
            error.error?.mensaje
            || 'Correo o contraseña incorrectos.';
        }
      });
  }
}