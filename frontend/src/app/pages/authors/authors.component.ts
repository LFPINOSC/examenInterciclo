import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Author } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">Catálogo</p><h1>Autores</h1><p>Autores disponibles para relacionar con los libros.</p></div><button *ngIf="auth.isAdmin()" class="btn btn-primary" (click)="newItem()">Nuevo autor</button></header>
    <div class="alert error" *ngIf="error">{{ error }}</div>
    <section class="panel" *ngIf="editing && auth.isAdmin()">
      <div class="panel-head"><h2>{{ form.id ? 'Editar autor' : 'Registrar autor' }}</h2></div>
      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label>Nombre<input name="name" [(ngModel)]="form.name" required maxlength="120"></label>
        <label>Nacionalidad<input name="nationality" [(ngModel)]="form.nationality" maxlength="80"></label>
        <label class="span-2">Biografía<textarea name="biography" [(ngModel)]="form.biography" maxlength="500" rows="3"></textarea></label>
        <div class="actions span-2"><button type="button" class="btn btn-secondary" (click)="editing=false">Cancelar</button><button class="btn btn-primary" [disabled]="f.invalid">Guardar</button></div>
      </form>
    </section>
    <section class="panel">
      <div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Nacionalidad</th><th>Biografía</th><th *ngIf="auth.isAdmin()">Acciones</th></tr></thead>
      <tbody><tr *ngFor="let item of items"><td><strong>{{ item.name }}</strong></td><td>{{ item.nationality || '—' }}</td><td>{{ item.biography || '—' }}</td><td *ngIf="auth.isAdmin()" class="row-actions"><button class="link-btn" (click)="edit(item)">Editar</button><button class="link-btn danger" (click)="remove(item)">Eliminar</button></td></tr></tbody></table></div>
      <p class="empty" *ngIf="items.length===0">No hay autores registrados.</p>
    </section>
  `
})
export class AuthorsComponent implements OnInit {
  items: Author[] = []; editing = false; error = '';
  form: Author = { name: '', nationality: '', biography: '' };
  constructor(private api: ApiService, public auth: AuthService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.api.getAuthors().subscribe({next:v=>this.items=v,error:e=>this.handle(e)}); }
  newItem(): void { this.form={name:'',nationality:'',biography:''}; this.editing=true; }
  edit(item: Author): void { this.form={...item}; this.editing=true; }
  save(): void {
    this.error=''; const req=this.form.id ? this.api.updateAuthor(this.form.id,this.form) : this.api.createAuthor(this.form);
    req.subscribe({next:()=>{this.editing=false;this.load();},error:e=>this.handle(e)});
  }
  remove(item: Author): void { if(!item.id || !confirm(`¿Eliminar al autor ${item.name}?`)) return; this.api.deleteAuthor(item.id).subscribe({next:()=>this.load(),error:e=>this.handle(e)}); }
  handle(err: HttpErrorResponse): void { this.error=(err.error as ApiError)?.message || 'No fue posible completar la operación'; }
}
