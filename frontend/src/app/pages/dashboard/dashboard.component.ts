import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Book, Loan } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="page-header"><div><p class="eyebrow">Sistema de gestión</p><h1>Panel principal</h1><p>Bienvenido, {{ auth.user()?.fullName }}.</p></div></header>
    <div class="stats-grid">
      <article class="stat"><span>Libros registrados</span><strong>{{ books.length }}</strong><small>títulos en el catálogo</small></article>
      <article class="stat"><span>Ejemplares disponibles</span><strong>{{ available }}</strong><small>listos para préstamo</small></article>
      <article class="stat"><span>Préstamos activos</span><strong>{{ activeLoans }}</strong><small>incluye los vencidos</small></article>
      <article class="stat"><span>Mi rol</span><strong class="role-value">{{ auth.user()?.role }}</strong><small>control de acceso JWT</small></article>
    </div>
    <section class="panel">
      <div class="panel-head"><div><h2>Accesos rápidos</h2><p>Operaciones principales del sistema.</p></div></div>
      <div class="quick-grid">
        <a routerLink="/libros" class="quick"><strong>Catálogo de libros</strong><span>Consultar disponibilidad y administrar títulos.</span></a>
        <a routerLink="/prestamos" class="quick"><strong>Préstamos</strong><span>Registrar salidas y devoluciones.</span></a>
        <a routerLink="/autores" class="quick"><strong>Autores</strong><span>Mantener los autores vinculados al catálogo.</span></a>
        <a routerLink="/categorias" class="quick"><strong>Categorías</strong><span>Clasificar correctamente los libros.</span></a>
      </div>
    </section>
  `
})
export class DashboardComponent implements OnInit {
  books: Book[] = [];
  loans: Loan[] = [];
  constructor(private api: ApiService, public auth: AuthService) {}
  get available(): number { return this.books.reduce((n, b) => n + b.availableCopies, 0); }
  get activeLoans(): number { return this.loans.filter(l => l.status !== 'DEVUELTO').length; }
  ngOnInit(): void {
    forkJoin({ books: this.api.getBooks(), loans: this.api.getLoans() }).subscribe({
      next: result => { this.books = result.books; this.loans = result.loans; }
    });
  }
}
