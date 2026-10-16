import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Author, Book, BookPayload, Category } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Inventario bibliográfico</p>
        <h1>Libros</h1>
        <p>Consulta, registra y administra el catálogo real de la biblioteca.</p>
      </div>
      <button *ngIf="auth.isAdmin()" class="btn btn-primary" (click)="newBook()">Nuevo libro</button>
    </header>

    <div class="toolbar">
      <input [(ngModel)]="search" (keyup.enter)="loadBooks()" placeholder="Buscar por título o ISBN">
      <button class="btn btn-secondary" (click)="loadBooks()" [disabled]="loading">Buscar</button>
      <button *ngIf="search" class="link-btn" (click)="search='';loadBooks()">Limpiar</button>
    </div>

    <div class="alert error" *ngIf="error">{{ error }}</div>
    <div class="alert success" *ngIf="success">{{ success }}</div>

    <section class="panel" *ngIf="editing && auth.isAdmin()">
      <div class="panel-head">
        <div>
          <h2>{{ editId ? 'Editar libro' : 'Registrar libro' }}</h2>
          <p>Los cambios se guardan inmediatamente en PostgreSQL.</p>
        </div>
      </div>

      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label class="span-2">Título
          <input name="title" [(ngModel)]="form.title" required maxlength="180">
        </label>
        <label>ISBN
          <input name="isbn" [(ngModel)]="form.isbn" required maxlength="20">
        </label>
        <label>Año de publicación
          <input name="publicationYear" [(ngModel)]="form.publicationYear" type="number" min="1400" max="2100">
        </label>
        <label>Autor
          <select name="authorId" [(ngModel)]="form.authorId" required>
            <option [ngValue]="0" disabled>Seleccione</option>
            <option *ngFor="let a of authors" [ngValue]="a.id">{{ a.name }}</option>
          </select>
        </label>
        <label>Categoría
          <select name="categoryId" [(ngModel)]="form.categoryId" required>
            <option [ngValue]="0" disabled>Seleccione</option>
            <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
          </select>
        </label>
        <label>Ejemplares totales
          <input name="totalCopies" [(ngModel)]="form.totalCopies" type="number" min="1" required>
        </label>
        <label class="checkbox">
          <input name="active" [(ngModel)]="form.active" type="checkbox"> Libro activo
        </label>
        <div class="actions span-2">
          <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancelar</button>
          <button class="btn btn-primary" [disabled]="f.invalid || form.authorId===0 || form.categoryId===0 || saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </section>

    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Libro</th><th>Autor</th><th>Categoría</th><th>Disponibilidad</th><th>Estado</th>
              <th *ngIf="auth.isAdmin()">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of books">
              <td><strong>{{ b.title }}</strong><small class="table-sub">ISBN {{ b.isbn }} · {{ b.publicationYear || 's/f' }}</small></td>
              <td>{{ b.author.name }}</td>
              <td>{{ b.category.name }}</td>
              <td><span class="availability" [class.zero]="b.availableCopies===0">{{ b.availableCopies }} / {{ b.totalCopies }}</span></td>
              <td><span class="badge" [class.muted]="!b.active">{{ b.active ? 'ACTIVO' : 'INACTIVO' }}</span></td>
              <td *ngIf="auth.isAdmin()" class="row-actions">
                <button class="link-btn" (click)="edit(b)">Editar</button>
                <button class="link-btn danger" (click)="remove(b)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="empty" *ngIf="loading">Cargando libros...</p>
      <p class="empty" *ngIf="!loading && books.length===0">No hay libros registrados.</p>
    </section>
  `
})
export class BooksComponent implements OnInit {
  books: Book[] = [];
  authors: Author[] = [];
  categories: Category[] = [];
  editing = false;
  editId: number | null = null;
  search = '';
  error = '';
  success = '';
  loading = false;
  saving = false;
  form: BookPayload = this.empty();

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadBooks();
  }

  empty(): BookPayload {
    return { title: '', isbn: '', publicationYear: null, totalCopies: 1, authorId: 0, categoryId: 0, active: true };
  }

  loadLookups(): void {
    forkJoin({ authors: this.api.getAuthors(), categories: this.api.getCategories() }).subscribe({
      next: result => {
        this.authors = result.authors;
        this.categories = result.categories;
      },
      error: err => this.handle(err)
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.error = '';
    this.api.getBooks(this.search.trim()).subscribe({
      next: value => {
        this.books = value;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.handle(err);
      }
    });
  }

  newBook(): void {
    this.error = '';
    this.success = '';
    if (this.authors.length === 0 || this.categories.length === 0) {
      this.error = 'Antes de registrar un libro debes crear al menos un autor y una categoría.';
      return;
    }
    this.form = this.empty();
    this.editId = null;
    this.editing = true;
  }

  edit(book: Book): void {
    this.error = '';
    this.success = '';
    this.form = {
      title: book.title,
      isbn: book.isbn,
      publicationYear: book.publicationYear ?? null,
      totalCopies: book.totalCopies,
      authorId: book.author.id!,
      categoryId: book.category.id!,
      active: book.active
    };
    this.editId = book.id;
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.editId = null;
    this.form = this.empty();
  }

  save(): void {
    this.error = '';
    this.success = '';
    this.saving = true;
    const isEditing = this.editId !== null;
    const request = isEditing
      ? this.api.updateBook(this.editId!, this.form)
      : this.api.createBook(this.form);

    request.subscribe({
      next: saved => {
        if (isEditing) {
          this.books = this.books.map(book => book.id === saved.id ? saved : book);
          this.success = 'Libro actualizado correctamente.';
        } else {
          this.books = [...this.books, saved];
          this.success = 'Libro registrado correctamente.';
        }
        this.books = this.sortBooks(this.books);
        this.saving = false;
        this.cancelEdit();
      },
      error: err => {
        this.saving = false;
        this.handle(err);
      }
    });
  }

  remove(book: Book): void {
    if (!confirm(`¿Eliminar el libro "${book.title}"?`)) return;
    this.error = '';
    this.success = '';
    this.api.deleteBook(book.id).subscribe({
      next: () => {
        this.books = this.books.filter(item => item.id !== book.id);
        this.success = 'Libro eliminado correctamente.';
      },
      error: err => this.handle(err)
    });
  }

  private sortBooks(items: Book[]): Book[] {
    return [...items].sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
  }

  private handle(error: HttpErrorResponse): void {
    this.error = (error.error as ApiError)?.message || 'No fue posible completar la operación.';
  }
}
