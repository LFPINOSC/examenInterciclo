import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <section class="auth-card wide">
        <div class="auth-title"><span class="brand-mark">B</span><div><h1>Crear cuenta</h1><p>Registro de lector</p></div></div>
        <form (ngSubmit)="submit()" #form="ngForm" class="form-grid">
          <label class="span-2">Nombre completo<input name="fullName" [(ngModel)]="model.fullName" required maxlength="120"></label>
          <label>Usuario<input name="username" [(ngModel)]="model.username" required minlength="4" maxlength="60"></label>
          <label>Correo<input name="email" [(ngModel)]="model.email" required email type="email"></label>
          <label class="span-2">Contraseña<input name="password" [(ngModel)]="model.password" required minlength="6" type="password"></label>
          <div class="alert error span-2" *ngIf="error">{{ error }}</div>
          <div class="actions span-2"><a routerLink="/login" class="btn btn-secondary">Volver</a><button class="btn btn-primary" [disabled]="form.invalid || loading">Crear cuenta</button></div>
        </form>
      </section>
    </div>
  `
})
export class RegisterComponent {
  model = { fullName: '', username: '', email: '', password: '' };
  loading = false;
  error = '';
  constructor(private auth: AuthService, private router: Router) {}
  submit(): void {
    this.loading = true; this.error = '';
    this.auth.register(this.model).subscribe({
      next: () => { this.loading = false; void this.router.navigate(['/']); },
      error: (err: HttpErrorResponse) => { this.loading = false; this.error = (err.error as ApiError)?.message || 'No fue posible registrar el usuario'; }
    });
  }
}
