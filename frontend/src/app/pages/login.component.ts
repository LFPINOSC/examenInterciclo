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
        <p class="eyebrow">Examen interciclo</p>
        <h1>Control de hospitalización</h1>
        <p>
          Registro de pacientes, camas y estancias. Cada ingreso ocupa una habitación
          y el alta la devuelve al censo.
        </p>
        <ul>
          <li>Ingreso, traslado de cama y alta médica</li>
          <li>Roles de administración, medicina y recepción</li>
          <li>Los datos viven en la API, no en el navegador</li>
        </ul>
      </div>
      <form class="login-card" [formGroup]="form" (ngSubmit)="entrar()">
        <h2>Ingresar</h2>
        <p class="muted">Use una cuenta de demostración o sus credenciales.</p>
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
          {{ enviando() ? 'Comprobando…' : 'Entrar al sistema' }}
        </button>
        <div class="demo-grid">
          @for (cuenta of cuentas; track cuenta.correo) {
            <button type="button" class="demo" (click)="usar(cuenta)">
              <strong>{{ cuenta.rol }}</strong>
              <span>{{ cuenta.correo }}</span>
            </button>
          }
        </div>
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
  readonly cuentas = [
    { rol: 'Administrador', correo: 'admin@hospital.local', password: 'Admin123' },
    { rol: 'Médico', correo: 'medico@hospital.local', password: 'Medico123' },
    { rol: 'Recepción', correo: 'recepcion@hospital.local', password: 'Recepcion123' },
  ];

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  usar(cuenta: { correo: string; password: string }): void {
    this.form.setValue({ correo: cuenta.correo, password: cuenta.password });
    this.error.set('');
  }

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Ingrese un correo y una contraseña de al menos 6 caracteres');
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
