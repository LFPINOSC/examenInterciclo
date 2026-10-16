import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Book, Loan, UserItem } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header">
      <div><p class="eyebrow">Circulación</p><h1>Préstamos</h1><p>Control de préstamos, vencimientos y devoluciones.</p></div>
      <button class="btn btn-primary" (click)="newLoan()">Nuevo préstamo</button>
    </header>

    <div class="alert error" *ngIf="error">{{ error }}</div>
    <div class="alert success" *ngIf="success">{{ success }}</div>

    <section class="panel" *ngIf="editing">
      <div class="panel-head"><h2>Registrar préstamo</h2></div>
      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label>Libro
          <select name="bookId" [(ngModel)]="form.bookId" required>
            <option [ngValue]="0" disabled>Seleccione</option>
            <option *ngFor="let b of availableBooks" [ngValue]="b.id">{{ b.title }} ({{ b.availableCopies }} disp.)</option>
          </select>
        </label>
        <label *ngIf="auth.isAdmin()">Lector
          <select name="userId" [(ngModel)]="form.userId">
            <option [ngValue]="null">Usar mi usuario</option>
            <option *ngFor="let u of users" [ngValue]="u.id">{{ u.fullName }} ({{ u.username }})</option>
          </select>
        </label>
        <label>Fecha límite<input name="dueDate" [(ngModel)]="form.dueDate" type="date" [min]="minDueDate" required></label>
        <div class="actions span-2"><button type="button" class="btn btn-secondary" (click)="editing=false">Cancelar</button><button class="btn btn-primary" [disabled]="f.invalid || form.bookId===0 || saving">{{ saving ? 'Guardando...' : 'Prestar' }}</button></div>
      </form>
      <p class="empty" *ngIf="availableBooks.length===0">No hay libros activos con ejemplares disponibles.</p>
    </section>

    <section class="panel"><div class="table-wrap"><table><thead><tr><th>Libro</th><th>Lector</th><th>Préstamo</th><th>Fecha límite</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody><tr *ngFor="let loan of loans"><td><strong>{{ loan.book.title }}</strong></td><td>{{ loan.user.fullName }}</td><td>{{ loan.loanDate }}</td><td>{{ loan.dueDate }}</td><td><span class="badge" [class.warning]="loan.status==='VENCIDO'" [class.success]="loan.status==='DEVUELTO'">{{ loan.status }}</span><small *ngIf="loan.returnDate" class="table-sub">Devuelto: {{ loan.returnDate }}</small></td><td class="row-actions"><button *ngIf="loan.status!=='DEVUELTO'" class="link-btn" (click)="returnBook(loan)">Devolver</button><button *ngIf="auth.isAdmin() && loan.status==='DEVUELTO'" class="link-btn danger" (click)="remove(loan)">Eliminar</button></td></tr></tbody>
    </table></div><p class="empty" *ngIf="loans.length===0">No hay préstamos registrados.</p></section>
  `
})
export class LoansComponent implements OnInit {
  loans: Loan[] = [];
  books: Book[] = [];
  users: UserItem[] = [];
  editing = false;
  saving = false;
  error = '';
  success = '';
  form: { bookId: number; userId: number | null; dueDate: string } = { bookId: 0, userId: null, dueDate: this.defaultDueDate() };

  constructor(private api: ApiService, public auth: AuthService) {}

  get availableBooks(): Book[] { return this.books.filter(book => book.active && book.availableCopies > 0); }
  get minDueDate(): string { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); }

  ngOnInit(): void { this.load(); }

  defaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 10);
  }

  newLoan(): void {
    this.error=''; this.success='';
    this.form={bookId:0,userId:null,dueDate:this.defaultDueDate()};
    this.editing=true;
  }

  load(): void {
    const base = { loans: this.api.getLoans(), books: this.api.getBooks() };
    if (this.auth.isAdmin()) {
      forkJoin({ ...base, users: this.api.getUsers() }).subscribe({
        next: result => {
          this.loans = result.loans;
          this.books = result.books;
          this.users = result.users.filter(user => user.enabled);
        },
        error: err => this.handle(err)
      });
    } else {
      forkJoin(base).subscribe({
        next: result => { this.loans=result.loans; this.books=result.books; },
        error: err => this.handle(err)
      });
    }
  }

  save(): void {
    this.error=''; this.success=''; this.saving=true;
    this.api.createLoan(this.form).subscribe({
      next: saved => {
        this.loans=[saved,...this.loans];
        this.books=this.books.map(book=>book.id===saved.book.id?saved.book:book);
        this.saving=false;
        this.editing=false;
        this.form={bookId:0,userId:null,dueDate:this.defaultDueDate()};
        this.success='Préstamo registrado. La disponibilidad del libro fue actualizada.';
      },
      error: err => { this.saving=false; this.handle(err); }
    });
  }

  returnBook(loan: Loan): void {
    if (!confirm(`¿Registrar devolución de "${loan.book.title}"?`)) return;
    this.error=''; this.success='';
    this.api.returnLoan(loan.id).subscribe({
      next: saved => {
        this.loans=this.loans.map(item=>item.id===saved.id?saved:item);
        this.books=this.books.map(book=>book.id===saved.book.id?saved.book:book);
        this.success='Devolución registrada. El ejemplar vuelve a estar disponible.';
      },
      error: err => this.handle(err)
    });
  }

  remove(loan: Loan): void {
    if (!confirm('¿Eliminar este historial de préstamo devuelto?')) return;
    this.error=''; this.success='';
    this.api.deleteLoan(loan.id).subscribe({next:()=>{this.loans=this.loans.filter(item=>item.id!==loan.id);this.success='Historial eliminado correctamente.';},error:err=>this.handle(err)});
  }

  private handle(error: HttpErrorResponse): void { this.error=(error.error as ApiError)?.message||'No fue posible completar la operación.'; }
}
