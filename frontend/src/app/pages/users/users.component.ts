import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { ApiError, UserItem } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">Seguridad</p><h1>Usuarios</h1><p>Administración de lectores, roles y estado de acceso.</p></div></header>
    <div class="alert error" *ngIf="error">{{ error }}</div>
    <div class="alert success" *ngIf="success">{{ success }}</div>

    <section class="panel" *ngIf="editing && selected">
      <div class="panel-head"><h2>Editar usuario</h2></div>
      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label>Nombre completo<input name="fullName" [(ngModel)]="selected.fullName" required maxlength="120"></label>
        <label>Correo<input name="email" [(ngModel)]="selected.email" required email type="email" maxlength="120"></label>
        <label>Rol<select name="role" [(ngModel)]="selected.role"><option value="LECTOR">LECTOR</option><option value="ADMIN">ADMIN</option></select></label>
        <label class="checkbox"><input name="enabled" [(ngModel)]="selected.enabled" type="checkbox"> Cuenta habilitada</label>
        <div class="actions span-2"><button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button><button class="btn btn-primary" [disabled]="f.invalid || saving">{{ saving ? 'Guardando...' : 'Guardar' }}</button></div>
      </form>
    </section>

    <section class="panel"><div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody><tr *ngFor="let user of users"><td><strong>{{ user.fullName }}</strong><small class="table-sub">{{ user.username }}</small></td><td>{{ user.email }}</td><td><span class="badge">{{ user.role }}</span></td><td>{{ user.enabled ? 'Habilitado' : 'Bloqueado' }}</td><td class="row-actions"><button class="link-btn" (click)="edit(user)">Editar</button><button class="link-btn danger" (click)="remove(user)">Eliminar</button></td></tr></tbody></table></div><p class="empty" *ngIf="users.length===0">No hay usuarios registrados.</p></section>
  `
})
export class UsersComponent implements OnInit {
  users: UserItem[] = [];
  selected: UserItem | null = null;
  editing = false;
  saving = false;
  error = '';
  success = '';

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.api.getUsers().subscribe({ next:value=>this.users=value, error:err=>this.handle(err) }); }
  edit(user: UserItem): void { this.error='';this.success='';this.selected={...user};this.editing=true; }
  cancel(): void { this.selected=null; this.editing=false; }

  save(): void {
    if (!this.selected) return;
    this.error=''; this.success=''; this.saving=true;
    const current = this.selected;
    this.api.updateUser(current.id,{fullName:current.fullName,email:current.email,role:current.role,enabled:current.enabled}).subscribe({
      next:saved=>{this.users=this.users.map(u=>u.id===saved.id?saved:u);this.saving=false;this.success='Usuario actualizado correctamente.';this.cancel();},
      error:err=>{this.saving=false;this.handle(err);}
    });
  }

  remove(user: UserItem): void {
    if (!confirm(`¿Eliminar al usuario "${user.username}"?`)) return;
    this.error='';this.success='';
    this.api.deleteUser(user.id).subscribe({next:()=>{this.users=this.users.filter(u=>u.id!==user.id);this.success='Usuario eliminado correctamente.';},error:err=>this.handle(err)});
  }

  private handle(error:HttpErrorResponse):void{this.error=(error.error as ApiError)?.message||'No fue posible completar la operación.';}
}
