import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/etiquetas';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="login">
      <div class="login-copy">
        <h1>Control de hospitalización</h1>
      </div>
      <form class="login-card" [formGroup]="form" (ngSubmit)="entrar()">
        <h2>Ingresar</h2>
        @if (error()) { <p class="banner error">{{ error() }}</p> }
        <label class="field">
          <span>Correo</span>
          <input type="email" formControlName="correo" autocomplete="username" />
        </label>
        <label class="field">
          <span>Contraseña</span>
          <input type="password" formControlName="password" autocomplete="current-password" />
        </label>
        <button class="btn primary block" type="submit" [disabled]="enviando()">
          {{ enviando() ? 'Comprobando…' : 'Entrar' }}
        </button>
      </form>
    </section>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal('');
  readonly enviando = signal(false);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revise correo y contraseña.');
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    const { correo, password } = this.form.getRawValue();
    this.auth.login(correo, password).subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (error) => {
        this.enviando.set(false);
        this.error.set(mensajeError(error, 'No se pudo iniciar sesión'));
      },
    });
  }
}
