import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmacionService } from '../core/confirmacion.service';
import { Rol, Usuario } from '../core/modelos';
import { NotificacionService } from '../core/notificacion.service';
import { UsuarioService } from '../core/servicios';
import { errorCampo, mensajeError, passwordFuerte } from '../core/utilidades';

/** Gestion de usuarios (solo ADMIN): aqui se registran los tecnicos. */
@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <h1 class="titulo">Usuarios</h1>
    <p class="texto-suave">Aquí se registran los técnicos y administradores del sistema.</p>
    @if (error()) {
      <p class="alerta alerta-error" role="alert">{{ error() }}</p>
    }
    <div class="dos-columnas">
      <div class="tabla-contenedor">
        <table class="tabla">
          <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Último acceso</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (u of usuarios(); track u.id) {
              <tr [class.seleccionada]="editandoId() === u.id">
                <td>{{ u.nombre }}<br /><small class="texto-suave">{{ u.correo }}</small></td>
                <td>{{ u.username }}</td>
                <td>{{ u.rol }}</td>
                <td><span class="insignia" [class.estado-COMPLETADA]="u.activo" [class.estado-CANCELADA]="!u.activo">{{ u.activo ? 'Activo' : 'Desactivado' }}</span></td>
                <td>{{ u.ultimoAcceso ? (u.ultimoAcceso | date: 'dd/MM/yyyy HH:mm') : '—' }}</td>
                <td class="acciones-tabla">
                  <button type="button" class="boton-mini" (click)="editar(u)">Editar</button>
                  <button type="button" class="boton-mini" (click)="alternarActivo(u)">{{ u.activo ? 'Desactivar' : 'Activar' }}</button>
                  <button type="button" class="boton-mini peligro" (click)="eliminar(u)">Eliminar</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <form class="tarjeta formulario" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
        <h2 class="subtitulo">{{ editandoId() ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
        <label for="u-nombre">Nombre completo *</label>
        <input id="u-nombre" formControlName="nombre" maxlength="100" />
        <small class="error-campo">{{ err('nombre', 'El nombre') }}</small>
        <label for="u-username">Usuario *</label>
        <input id="u-username" formControlName="username" maxlength="30" autocomplete="off" />
        <small class="error-campo">{{ err('username', 'El usuario') }}</small>
        <label for="u-correo">Correo *</label>
        <input id="u-correo" type="email" formControlName="correo" maxlength="120" />
        <small class="error-campo">{{ err('correo', 'El correo') }}</small>
        <label for="u-pass">{{ editandoId() ? 'Nueva contraseña (opcional)' : 'Contraseña *' }}</label>
        <input id="u-pass" type="password" formControlName="password" autocomplete="new-password" />
        <small class="error-campo">{{ err('password', 'La contraseña') }}</small>
        <label for="u-rol">Rol *</label>
        <select id="u-rol" formControlName="rol">
          <option value="TECNICO">Técnico</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <div class="acciones">
          <button type="submit" class="boton">Guardar</button>
          @if (editandoId()) {
            <button type="button" class="boton boton-secundario" (click)="limpiar()">Cancelar</button>
          }
        </div>
      </form>
    </div>
  `,
})
export class Usuarios {
  private readonly usuarioService = inject(UsuarioService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    username: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_.]{3,30}$/)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    password: ['', [Validators.required, passwordFuerte]],
    rol: ['TECNICO' as Rol],
  });

  constructor() {
    this.cargar();
  }

  protected err(campo: 'nombre' | 'username' | 'correo' | 'password', etiqueta: string): string {
    return errorCampo(this.form.controls[campo], etiqueta);
  }

  private cargar(): void {
    this.usuarioService.listar().subscribe({ next: (l) => this.usuarios.set(l), error: (e) => this.error.set(mensajeError(e)) });
  }

  protected editar(u: Usuario): void {
    this.editandoId.set(u.id);
    // En edicion la contrasena es opcional.
    this.form.controls.password.setValidators(passwordFuerte);
    this.form.setValue({ nombre: u.nombre, username: u.username, correo: u.correo, password: '', rol: u.rol });
  }

  protected limpiar(): void {
    this.editandoId.set(null);
    this.form.controls.password.setValidators([Validators.required, passwordFuerte]);
    this.form.reset({ rol: 'TECNICO' });
  }

  protected guardar(): void {
    this.form.controls.password.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    const id = this.editandoId();
    (id ? this.usuarioService.actualizar(id, datos) : this.usuarioService.crear(datos)).subscribe({
      next: (u) => {
        this.notificaciones.mostrar(`Usuario "${u.username}" guardado.`);
        this.error.set('');
        this.limpiar();
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected alternarActivo(u: Usuario): void {
    this.usuarioService.cambiarActivo(u.id, !u.activo).subscribe({
      next: () => {
        this.notificaciones.mostrar(`Cuenta de "${u.username}" ${u.activo ? 'desactivada' : 'activada'}.`);
        this.error.set('');
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected async eliminar(u: Usuario): Promise<void> {
    const ok = await this.confirmacion.confirmar({ titulo: 'Eliminar usuario', mensaje: `¿Eliminar al usuario "${u.username}"?` });
    if (!ok) {
      return;
    }
    this.usuarioService.eliminar(u.id).subscribe({
      next: () => {
        this.notificaciones.mostrar(`Usuario "${u.username}" eliminado.`);
        this.error.set('');
        this.cargar();
      },
      // 409 si tiene ordenes: se recomienda desactivar
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
