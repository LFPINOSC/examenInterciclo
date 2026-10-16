import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  mensaje = '';
  esError = false;

  constructor(private apiService: ApiService, private router: Router) {}

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    this.apiService.login(credentials).subscribe({
      next: (data: any) => {
        this.esError = false;
        this.mensaje = '¡Inicio de sesión exitoso! Redirigiendo...';
        
        // Guardar Token y Usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (err) => {
        this.esError = true;
        this.mensaje = err.error?.error || 'Credenciales incorrectas o error de servidor.';
      }
    });
  }
}