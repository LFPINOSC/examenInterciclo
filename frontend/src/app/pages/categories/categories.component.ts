import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Category } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">Catálogo</p><h1>Categorías</h1><p>Clasificación temática de los libros.</p></div><button *ngIf="auth.isAdmin()" class="btn btn-primary" (click)="newItem()">Nueva categoría</button></header>
    <div class="alert error" *ngIf="error">{{ error }}</div>
    <section class="panel" *ngIf="editing && auth.isAdmin()">
      <div class="panel-head"><h2>{{ form.id ? 'Editar categoría' : 'Registrar categoría' }}</h2></div>
      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label>Nombre<input name="name" [(ngModel)]="form.name" required maxlength="80"></label>
        <label>Descripción<input name="description" [(ngModel)]="form.description" maxlength="300"></label>
        <div class="actions span-2"><button type="button" class="btn btn-secondary" (click)="editing=false">Cancelar</button><button class="btn btn-primary" [disabled]="f.invalid">Guardar</button></div>
      </form>
    </section>
    <section class="panel"><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Descripción</th><th *ngIf="auth.isAdmin()">Acciones</th></tr></thead>
    <tbody><tr *ngFor="let item of items"><td><strong>{{ item.name }}</strong></td><td>{{ item.description || '—' }}</td><td *ngIf="auth.isAdmin()" class="row-actions"><button class="link-btn" (click)="edit(item)">Editar</button><button class="link-btn danger" (click)="remove(item)">Eliminar</button></td></tr></tbody></table></div><p class="empty" *ngIf="items.length===0">No hay categorías.</p></section>
  `
})
export class CategoriesComponent implements OnInit {
  items: Category[]=[]; editing=false; error=''; form:Category={name:'',description:''};
  constructor(private api:ApiService, public auth:AuthService){}
  ngOnInit():void{this.load();}
  load():void{this.api.getCategories().subscribe({next:v=>this.items=v,error:e=>this.handle(e)});}
  newItem():void{this.form={name:'',description:''};this.editing=true;}
  edit(i:Category):void{this.form={...i};this.editing=true;}
  save():void{this.error='';const req=this.form.id?this.api.updateCategory(this.form.id,this.form):this.api.createCategory(this.form);req.subscribe({next:()=>{this.editing=false;this.load();},error:e=>this.handle(e)});}
  remove(i:Category):void{if(!i.id||!confirm(`¿Eliminar la categoría ${i.name}?`))return;this.api.deleteCategory(i.id).subscribe({next:()=>this.load(),error:e=>this.handle(e)});}
  handle(e:HttpErrorResponse):void{this.error=(e.error as ApiError)?.message||'No fue posible completar la operación';}
}
