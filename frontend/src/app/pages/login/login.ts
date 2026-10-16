import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  correo: string = '';
  password: string = '';
  mensaje: string = '';

  constructor(private router: Router) {}

  iniciarSesion(): void {

    // Validación básica del formulario
    if (!this.correo || !this.password) {
      this.mensaje = 'Complete todos los campos.';
      return;
    }

    // Temporalmente permite entrar al dashboard.
    // Después este método consumirá la API de Spring Boot.
    this.router.navigate(['/dashboard']);
  }
}