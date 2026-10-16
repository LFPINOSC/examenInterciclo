import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Category } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">Catálogo</p><h1>Categorías</h1><p>Clasificación temática de los libros.</p></div><button *ngIf="auth.isAdmin()" class="btn btn-primary" (click)="newItem()">Nueva categoría</button></header>
    <div class="alert error" *ngIf="error">{{ error }}</div>
    <div class="alert success" *ngIf="success">{{ success }}</div>

    <section class="panel" *ngIf="editing && auth.isAdmin()">
      <div class="panel-head"><h2>{{ form.id ? 'Editar categoría' : 'Registrar categoría' }}</h2></div>
      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label>Nombre<input name="name" [(ngModel)]="form.name" required maxlength="80"></label>
        <label>Descripción<input name="description" [(ngModel)]="form.description" maxlength="300"></label>
        <div class="actions span-2"><button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button><button class="btn btn-primary" [disabled]="f.invalid || saving">{{ saving ? 'Guardando...' : 'Guardar' }}</button></div>
      </form>
    </section>

    <section class="panel"><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Descripción</th><th *ngIf="auth.isAdmin()">Acciones</th></tr></thead>
    <tbody><tr *ngFor="let item of items"><td><strong>{{ item.name }}</strong></td><td>{{ item.description || '—' }}</td><td *ngIf="auth.isAdmin()" class="row-actions"><button class="link-btn" (click)="edit(item)">Editar</button><button class="link-btn danger" (click)="remove(item)">Eliminar</button></td></tr></tbody></table></div><p class="empty" *ngIf="items.length===0">No hay categorías registradas.</p></section>
  `
})
export class CategoriesComponent implements OnInit {
  items: Category[] = [];
  editing = false;
  saving = false;
  error = '';
  success = '';
  form: Category = { name: '', description: '' };

  constructor(private api: ApiService, public auth: AuthService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.api.getCategories().subscribe({ next: value => this.items = value, error: err => this.handle(err) }); }
  newItem(): void { this.error=''; this.success=''; this.form={name:'',description:''}; this.editing=true; }
  edit(item: Category): void { this.error=''; this.success=''; this.form={...item}; this.editing=true; }
  cancel(): void { this.editing=false; this.form={name:'',description:''}; }

  save(): void {
    this.error=''; this.success=''; this.saving=true;
    const isEditing = !!this.form.id;
    const request = isEditing ? this.api.updateCategory(this.form.id!, this.form) : this.api.createCategory(this.form);
    request.subscribe({
      next: saved => {
        this.items = isEditing ? this.items.map(i => i.id === saved.id ? saved : i) : [...this.items, saved];
        this.items = [...this.items].sort((a,b)=>a.name.localeCompare(b.name,'es',{sensitivity:'base'}));
        this.saving=false;
        this.success = isEditing ? 'Categoría actualizada correctamente.' : 'Categoría registrada correctamente.';
        this.cancel();
      },
      error: err => { this.saving=false; this.handle(err); }
    });
  }

  remove(item: Category): void {
    if (!item.id || !confirm(`¿Eliminar la categoría "${item.name}"?`)) return;
    this.error=''; this.success='';
    this.api.deleteCategory(item.id).subscribe({ next:()=>{this.items=this.items.filter(i=>i.id!==item.id);this.success='Categoría eliminada correctamente.';}, error:err=>this.handle(err) });
  }

  private handle(error: HttpErrorResponse): void { this.error=(error.error as ApiError)?.message||'No fue posible completar la operación.'; }
}
