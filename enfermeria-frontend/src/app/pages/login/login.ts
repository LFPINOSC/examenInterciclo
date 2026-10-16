
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  correo = '';
  password = '';

  cargando = signal(false);
  error = signal('');

  ingresar(): void {
    if (!this.correo.trim() || !this.password) {
      this.error.set('Ingresa tu correo y contraseña.');
      return;
    }

    this.error.set('');
    this.cargando.set(true);

    this.auth.login(this.correo.trim(), this.password)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.rol === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/enfermero']);
          }
        },
        error: () => {
          this.error.set('Correo o contraseña incorrectos.');
        }
      });
  }
}
