import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ROL, mensajeError } from '../core/etiquetas';
import { Rol as RolCatalogo, Usuario } from '../models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <header class="page-head">
      <div>
        <p class="eyebrow">Seguridad</p>
        <h1>Usuarios y roles</h1>
      </div>
      <button type="button" class="btn primary" (click)="abrir()">Nuevo usuario</button>
    </header>
    @if (error()) { <p class="banner error">{{ error() }}</p> }
    @if (aviso()) { <p class="banner ok">{{ aviso() }}</p> }
    <div class="role-notes">
      @for (rol of roles(); track rol.id) {
        <article>
          <strong>{{ etiqueta(rol.nombre) }}</strong>
          <p>{{ rol.descripcion }}</p>
        </article>
      }
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          @for (usuario of lista(); track usuario.id) {
            <tr>
              <td><strong>{{ usuario.apellidos }}, {{ usuario.nombres }}</strong></td>
              <td>{{ usuario.correo }}</td>
              <td><span class="badge info">{{ etiqueta(usuario.rol) }}</span></td>
              <td>{{ usuario.activo ? 'Activo' : 'Inactivo' }}</td>
              <td class="actions">
                <button type="button" class="btn tiny" (click)="abrir(usuario)">Editar</button>
                @if (usuario.id !== auth.user()?.id) {
                  <button type="button" class="btn tiny danger" (click)="porBorrar.set(usuario)">Eliminar</button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (modal()) {
      <div class="backdrop" (click)="modal.set(false)">
        <form class="modal" [formGroup]="form" (click)="$event.stopPropagation()" (ngSubmit)="guardar()">
          <h2>{{ editando() ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
          <div class="form-grid">
            <label class="field"><span>Nombres</span><input formControlName="nombres" /></label>
            <label class="field"><span>Apellidos</span><input formControlName="apellidos" /></label>
            <label class="field"><span>Correo</span><input type="email" formControlName="correo" /></label>
            <label class="field">
              <span>Rol</span>
              <select formControlName="rol">
                @for (rol of roles(); track rol.id) {
                  <option [value]="rol.nombre">{{ etiqueta(rol.nombre) }}</option>
                }
              </select>
            </label>
            <label class="field full">
              <span>{{ editando() ? 'Nueva contraseña (opcional)' : 'Contraseña' }}</span>
              <input type="password" formControlName="password" autocomplete="new-password" />
            </label>
            <label class="check full">
              <input type="checkbox" formControlName="activo" />
              <span>Cuenta activa</span>
            </label>
          </div>
          @if (errorModal()) { <p class="banner error">{{ errorModal() }}</p> }
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="modal.set(false)">Cancelar</button>
            <button class="btn primary" [disabled]="guardando()">Guardar</button>
          </div>
        </form>
      </div>
    }

    @if (porBorrar(); as usuario) {
      <div class="backdrop" (click)="porBorrar.set(null)">
        <div class="modal compact" (click)="$event.stopPropagation()">
          <h2>Eliminar usuario</h2>
          <p>{{ usuario.nombres }} {{ usuario.apellidos }} perderá el acceso. Si era médico, se desvincula su ficha.</p>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="porBorrar.set(null)">Cancelar</button>
            <button type="button" class="btn danger" (click)="borrar()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UsuariosComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);

  readonly lista = signal<Usuario[]>([]);
  readonly roles = signal<RolCatalogo[]>([]);
  readonly modal = signal(false);
  readonly editando = signal<Usuario | null>(null);
  readonly porBorrar = signal<Usuario | null>(null);
  readonly error = signal('');
  readonly errorModal = signal('');
  readonly aviso = signal('');
  readonly guardando = signal(false);
  readonly etiqueta = (rol: string) => ROL[rol] ?? rol;

  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    rol: ['RECEPCION', Validators.required],
    password: [''],
    activo: [true],
  });

  constructor() {
    this.cargar();
    this.api.roles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: (error) => this.error.set(mensajeError(error, 'No se pudieron cargar los roles')),
    });
  }

  cargar(): void {
    this.api.usuarios().subscribe({
      next: (lista) => this.lista.set(lista),
      error: (error) => this.error.set(mensajeError(error, 'No se pudieron cargar los usuarios')),
    });
  }

  abrir(usuario?: Usuario): void {
    this.errorModal.set('');
    this.editando.set(usuario ?? null);
    this.form.reset({
      nombres: usuario?.nombres ?? '',
      apellidos: usuario?.apellidos ?? '',
      correo: usuario?.correo ?? '',
      rol: usuario?.rol ?? 'RECEPCION',
      password: '',
      activo: usuario?.activo ?? true,
    });
    const clave = this.form.controls.password;
    if (usuario) clave.clearValidators();
    else clave.setValidators([Validators.required, Validators.minLength(6)]);
    clave.updateValueAndValidity();
    this.modal.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorModal.set('Complete nombre, correo, rol y contraseña.');
      return;
    }
    const valor = this.form.getRawValue();
    const cuerpo = {
      nombres: valor.nombres.trim(),
      apellidos: valor.apellidos.trim(),
      correo: valor.correo.trim().toLowerCase(),
      password: valor.password,
      rol: valor.rol,
      activo: valor.activo,
    };
    this.guardando.set(true);
    const id = this.editando()?.id;
    const peticion = id ? this.api.actualizarUsuario(id, cuerpo) : this.api.crearUsuario(cuerpo);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modal.set(false);
        this.aviso.set(id ? 'Usuario actualizado' : 'Usuario creado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        this.errorModal.set(mensajeError(error, 'No se pudo guardar el usuario'));
      },
    });
  }

  borrar(): void {
    const usuario = this.porBorrar();
    if (!usuario) return;
    this.api.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.porBorrar.set(null);
        this.aviso.set('Usuario eliminado');
        this.cargar();
      },
      error: (error) => {
        this.porBorrar.set(null);
        this.error.set(mensajeError(error, 'No se pudo eliminar el usuario'));
      },
    });
  }
}
