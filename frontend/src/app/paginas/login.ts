import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errorCampo, mensajeError } from '../core/utilidades';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <section class="login">
      <form class="tarjeta formulario" [formGroup]="form" (ngSubmit)="entrar()" novalidate>
        <h1>Órdenes de trabajo</h1>
        <p class="texto-suave">Ingrese con su usuario o correo.</p>
        @if (expirada) {
          <p class="alerta alerta-error" role="alert">Su sesión expiró. Inicie sesión nuevamente.</p>
        }
        <label for="usuario">Usuario o correo</label>
        <input id="usuario" formControlName="username" autocomplete="username" />
        <small class="error-campo">{{ err('username', 'El usuario') }}</small>

        <label for="clave">Contraseña</label>
        <input id="clave" type="password" formControlName="password" autocomplete="current-password" />
        <small class="error-campo">{{ err('password', 'La contraseña') }}</small>

        @if (error()) {
          <p class="alerta alerta-error" role="alert">{{ error() }}</p>
        }
        <button type="submit" class="boton" [disabled]="cargando()">{{ cargando() ? 'Ingresando...' : 'Ingresar' }}</button>
      </form>
    </section>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly expirada = inject(ActivatedRoute).snapshot.queryParamMap.has('expirada');

  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected err(campo: 'username' | 'password', etiqueta: string): string {
    return errorCampo(this.form.controls[campo], etiqueta);
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (e) => {
        this.cargando.set(false);
        this.error.set(mensajeError(e));
      },
    });
  }
}
