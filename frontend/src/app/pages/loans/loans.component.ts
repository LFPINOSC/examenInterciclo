import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Book, Loan, UserItem } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">Circulación</p><h1>Préstamos</h1><p>Control de préstamos, vencimientos y devoluciones.</p></div><button class="btn btn-primary" (click)="editing=!editing">Nuevo préstamo</button></header>
    <div class="alert error" *ngIf="error">{{error}}</div>
    <section class="panel" *ngIf="editing"><div class="panel-head"><h2>Registrar préstamo</h2></div>
      <form (ngSubmit)="save()" #f="ngForm" class="form-grid">
        <label>Libro<select name="bookId" [(ngModel)]="form.bookId" required><option [ngValue]="0" disabled>Seleccione</option><option *ngFor="let b of availableBooks" [ngValue]="b.id">{{b.title}} ({{b.availableCopies}} disp.)</option></select></label>
        <label *ngIf="auth.isAdmin()">Lector<select name="userId" [(ngModel)]="form.userId"><option [ngValue]="null">Usar mi usuario</option><option *ngFor="let u of users" [ngValue]="u.id">{{u.fullName}} ({{u.username}})</option></select></label>
        <label>Fecha límite<input name="dueDate" [(ngModel)]="form.dueDate" type="date" required></label>
        <div class="actions span-2"><button type="button" class="btn btn-secondary" (click)="editing=false">Cancelar</button><button class="btn btn-primary" [disabled]="f.invalid || form.bookId===0">Prestar</button></div>
      </form>
    </section>
    <section class="panel"><div class="table-wrap"><table><thead><tr><th>Libro</th><th>Lector</th><th>Préstamo</th><th>Fecha límite</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody><tr *ngFor="let l of loans"><td><strong>{{l.book.title}}</strong></td><td>{{l.user.fullName}}</td><td>{{l.loanDate}}</td><td>{{l.dueDate}}</td><td><span class="badge" [class.warning]="l.status==='VENCIDO'" [class.success]="l.status==='DEVUELTO'">{{l.status}}</span><small *ngIf="l.returnDate" class="table-sub">Devuelto: {{l.returnDate}}</small></td><td class="row-actions"><button *ngIf="l.status!=='DEVUELTO'" class="link-btn" (click)="returnBook(l)">Devolver</button><button *ngIf="auth.isAdmin() && l.status==='DEVUELTO'" class="link-btn danger" (click)="remove(l)">Eliminar</button></td></tr></tbody>
    </table></div><p class="empty" *ngIf="loans.length===0">No hay préstamos registrados.</p></section>
  `
})
export class LoansComponent implements OnInit {
  loans:Loan[]=[];books:Book[]=[];users:UserItem[]=[];editing=false;error='';
  form:{bookId:number;userId:number|null;dueDate:string}={bookId:0,userId:null,dueDate:this.defaultDueDate()};
  constructor(private api:ApiService,public auth:AuthService){}
  get availableBooks():Book[]{return this.books.filter(b=>b.active&&b.availableCopies>0);}
  ngOnInit():void{this.load();}
  defaultDueDate():string{const d=new Date();d.setDate(d.getDate()+14);return d.toISOString().slice(0,10);}
  load():void{
    const base={loans:this.api.getLoans(),books:this.api.getBooks()};
    if(this.auth.isAdmin()) forkJoin({...base,users:this.api.getUsers()}).subscribe({next:r=>{this.loans=r.loans;this.books=r.books;this.users=r.users.filter(u=>u.enabled);},error:e=>this.handle(e)});
    else forkJoin(base).subscribe({next:r=>{this.loans=r.loans;this.books=r.books;},error:e=>this.handle(e)});
  }
  save():void{this.error='';this.api.createLoan(this.form).subscribe({next:()=>{this.editing=false;this.form={bookId:0,userId:null,dueDate:this.defaultDueDate()};this.load();},error:e=>this.handle(e)});}
  returnBook(l:Loan):void{if(!confirm(`¿Registrar devolución de ${l.book.title}?`))return;this.api.returnLoan(l.id).subscribe({next:()=>this.load(),error:e=>this.handle(e)});}
  remove(l:Loan):void{if(!confirm('¿Eliminar este historial de préstamo?'))return;this.api.deleteLoan(l.id).subscribe({next:()=>this.load(),error:e=>this.handle(e)});}
  handle(e:HttpErrorResponse):void{this.error=(e.error as ApiError)?.message||'No fue posible completar la operación';}
}
