import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Author, Book, BookPayload, Category } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">Inventario bibliográfico</p><h1>Libros</h1><p>Consulta de catálogo, existencias y disponibilidad.</p></div><button *ngIf="auth.isAdmin()" class="btn btn-primary" (click)="newBook()">Nuevo libro</button></header>
    <div class="toolbar"><input [(ngModel)]="search" (keyup.enter)="loadBooks()" placeholder="Buscar por título o ISBN"><button class="btn btn-secondary" (click)="loadBooks()">Buscar</button><button *ngIf="search" class="link-btn" (click)="search='';loadBooks()">Limpiar</button></div>
    <div class="alert error" *ngIf="error">{{ error }}</div>
    <section class="panel" *ngIf="editing && auth.isAdmin()">
      <div class="panel-head"><h2>{{ editId ? 'Editar libro' : 'Registrar libro' }}</h2></div>
      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label class="span-2">Título<input name="title" [(ngModel)]="form.title" required maxlength="180"></label>
        <label>ISBN<input name="isbn" [(ngModel)]="form.isbn" required maxlength="20"></label>
        <label>Año de publicación<input name="publicationYear" [(ngModel)]="form.publicationYear" type="number" min="1400" max="2100"></label>
        <label>Autor<select name="authorId" [(ngModel)]="form.authorId" required><option [ngValue]="0" disabled>Seleccione</option><option *ngFor="let a of authors" [ngValue]="a.id">{{a.name}}</option></select></label>
        <label>Categoría<select name="categoryId" [(ngModel)]="form.categoryId" required><option [ngValue]="0" disabled>Seleccione</option><option *ngFor="let c of categories" [ngValue]="c.id">{{c.name}}</option></select></label>
        <label>Ejemplares totales<input name="totalCopies" [(ngModel)]="form.totalCopies" type="number" min="1" required></label>
        <label class="checkbox"><input name="active" [(ngModel)]="form.active" type="checkbox"> Libro activo</label>
        <div class="actions span-2"><button type="button" class="btn btn-secondary" (click)="editing=false">Cancelar</button><button class="btn btn-primary" [disabled]="f.invalid || form.authorId===0 || form.categoryId===0">Guardar</button></div>
      </form>
    </section>
    <section class="panel"><div class="table-wrap"><table><thead><tr><th>Libro</th><th>Autor</th><th>Categoría</th><th>Disponibilidad</th><th>Estado</th><th *ngIf="auth.isAdmin()">Acciones</th></tr></thead>
    <tbody><tr *ngFor="let b of books"><td><strong>{{b.title}}</strong><small class="table-sub">ISBN {{b.isbn}} · {{b.publicationYear || 's/f'}}</small></td><td>{{b.author.name}}</td><td>{{b.category.name}}</td><td><span class="availability" [class.zero]="b.availableCopies===0">{{b.availableCopies}} / {{b.totalCopies}}</span></td><td><span class="badge" [class.muted]="!b.active">{{b.active?'ACTIVO':'INACTIVO'}}</span></td><td *ngIf="auth.isAdmin()" class="row-actions"><button class="link-btn" (click)="edit(b)">Editar</button><button class="link-btn danger" (click)="remove(b)">Eliminar</button></td></tr></tbody></table></div><p class="empty" *ngIf="books.length===0">No se encontraron libros.</p></section>
  `
})
export class BooksComponent implements OnInit {
  books:Book[]=[];authors:Author[]=[];categories:Category[]=[];editing=false;editId:number|null=null;search='';error='';
  form:BookPayload=this.empty();
  constructor(private api:ApiService,public auth:AuthService){}
  ngOnInit():void{forkJoin({authors:this.api.getAuthors(),categories:this.api.getCategories()}).subscribe({next:r=>{this.authors=r.authors;this.categories=r.categories;}});this.loadBooks();}
  empty():BookPayload{return{title:'',isbn:'',publicationYear:null,totalCopies:1,authorId:0,categoryId:0,active:true};}
  loadBooks():void{this.api.getBooks(this.search.trim()).subscribe({next:v=>this.books=v,error:e=>this.handle(e)});}
  newBook():void{this.form=this.empty();this.editId=null;this.editing=true;}
  edit(b:Book):void{this.form={title:b.title,isbn:b.isbn,publicationYear:b.publicationYear??null,totalCopies:b.totalCopies,authorId:b.author.id!,categoryId:b.category.id!,active:b.active};this.editId=b.id;this.editing=true;}
  save():void{this.error='';const req=this.editId?this.api.updateBook(this.editId,this.form):this.api.createBook(this.form);req.subscribe({next:()=>{this.editing=false;this.loadBooks();},error:e=>this.handle(e)});}
  remove(b:Book):void{if(!confirm(`¿Eliminar el libro ${b.title}?`))return;this.api.deleteBook(b.id).subscribe({next:()=>this.loadBooks(),error:e=>this.handle(e)});}
  handle(e:HttpErrorResponse):void{this.error=(e.error as ApiError)?.message||'No fue posible completar la operación';}
}
