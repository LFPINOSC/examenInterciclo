import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <section class="auth-card">
        <div class="auth-title"><span class="brand-mark">B</span><div><h1>Biblioteca</h1><p>Gestión integral y segura</p></div></div>
        <form (ngSubmit)="submit()" #form="ngForm">
          <label>Usuario<input name="username" [(ngModel)]="username" required minlength="4" autocomplete="username"></label>
          <label>Contraseña<input name="password" [(ngModel)]="password" required type="password" autocomplete="current-password"></label>
          <div class="alert error" *ngIf="error">{{ error }}</div>
          <button class="btn btn-primary full" [disabled]="form.invalid || loading">{{ loading ? 'Ingresando...' : 'Iniciar sesión' }}</button>
        </form>
        <p class="auth-link">¿No tienes cuenta? <a routerLink="/register">Regístrate como lector</a></p>
        <div class="demo-box"><strong>Credenciales de demostración</strong><span>admin / Admin123*</span><span>lector / Lector123*</span></div>
      </section>
    </div>
  `
})
export class LoginComponent {
  username = 'admin';
  password = 'Admin123*';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => { this.loading = false; void this.router.navigate(['/']); },
      error: (err: HttpErrorResponse) => { this.loading = false; this.error = (err.error as ApiError)?.message || 'No fue posible iniciar sesión'; }
    });
  }
}
