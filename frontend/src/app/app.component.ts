import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell" *ngIf="auth.isAuthenticated(); else publicPage">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">B</span>
          <div><strong>Biblioteca</strong><small>Examen interciclo</small></div>
        </div>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Resumen</a>
          <a routerLink="/libros" routerLinkActive="active">Libros</a>
          <a routerLink="/autores" routerLinkActive="active">Autores</a>
          <a routerLink="/categorias" routerLinkActive="active">Categorías</a>
          <a routerLink="/prestamos" routerLinkActive="active">Préstamos</a>
          <a *ngIf="auth.isAdmin()" routerLink="/usuarios" routerLinkActive="active">Usuarios</a>
        </nav>
        <div class="sidebar-user">
          <strong>{{ auth.user()?.fullName }}</strong>
          <span class="badge">{{ auth.user()?.role }}</span>
          <button class="btn btn-secondary full" (click)="logout()">Cerrar sesión</button>
        </div>
      </aside>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
    <ng-template #publicPage><router-outlet></router-outlet></ng-template>
  `
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
