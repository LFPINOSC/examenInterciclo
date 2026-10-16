import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { ApiError, UserItem } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">Seguridad</p><h1>Usuarios</h1><p>Administración de lectores, roles y estado de acceso.</p></div></header>
    <div class="alert error" *ngIf="error">{{error}}</div>
    <section class="panel" *ngIf="editing && selected">
      <div class="panel-head"><h2>Editar usuario</h2></div>
      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label>Nombre completo<input name="fullName" [(ngModel)]="selected.fullName" required></label>
        <label>Correo<input name="email" [(ngModel)]="selected.email" required email type="email"></label>
        <label>Rol<select name="role" [(ngModel)]="selected.role"><option value="LECTOR">LECTOR</option><option value="ADMIN">ADMIN</option></select></label>
        <label class="checkbox"><input name="enabled" [(ngModel)]="selected.enabled" type="checkbox"> Cuenta habilitada</label>
        <div class="actions span-2"><button type="button" class="btn btn-secondary" (click)="editing=false">Cancelar</button><button class="btn btn-primary" [disabled]="f.invalid">Guardar</button></div>
      </form>
    </section>
    <section class="panel"><div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody><tr *ngFor="let u of users"><td><strong>{{u.fullName}}</strong><small class="table-sub">{{u.username}}</small></td><td>{{u.email}}</td><td><span class="badge">{{u.role}}</span></td><td>{{u.enabled?'Habilitado':'Bloqueado'}}</td><td class="row-actions"><button class="link-btn" (click)="edit(u)">Editar</button><button class="link-btn danger" (click)="remove(u)">Eliminar</button></td></tr></tbody></table></div></section>
  `
})
export class UsersComponent implements OnInit {
  users:UserItem[]=[];selected:UserItem|null=null;editing=false;error='';
  constructor(private api:ApiService){}
  ngOnInit():void{this.load();}
  load():void{this.api.getUsers().subscribe({next:v=>this.users=v,error:e=>this.handle(e)});}
  edit(u:UserItem):void{this.selected={...u};this.editing=true;}
  save():void{if(!this.selected)return;this.api.updateUser(this.selected.id,{fullName:this.selected.fullName,email:this.selected.email,role:this.selected.role,enabled:this.selected.enabled}).subscribe({next:()=>{this.editing=false;this.load();},error:e=>this.handle(e)});}
  remove(u:UserItem):void{if(!confirm(`¿Eliminar al usuario ${u.username}?`))return;this.api.deleteUser(u.id).subscribe({next:()=>this.load(),error:e=>this.handle(e)});}
  handle(e:HttpErrorResponse):void{this.error=(e.error as ApiError)?.message||'No fue posible completar la operación';}
}
