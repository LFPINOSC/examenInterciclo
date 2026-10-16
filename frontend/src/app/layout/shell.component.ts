import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ROL } from '../core/etiquetas';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside>
        <div class="brand">
          <span class="mark">SL</span>
          <div>
            <strong>Santa Lucía</strong>
            <small>Hospitalización</small>
          </div>
        </div>
        <nav>
          @for (item of visibles(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
          }
        </nav>
        <div class="aside-foot">
          <p>{{ auth.user()?.nombres }} {{ auth.user()?.apellidos }}</p>
          <span class="role">{{ etiqueta(auth.user()?.rol) }}</span>
          <button type="button" class="btn ghost block" (click)="salir()">Cerrar sesión</button>
        </div>
      </aside>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly menu = [
    { path: '/dashboard', label: 'Panel', roles: ['ADMIN', 'MEDICO', 'RECEPCION'] },
    { path: '/pacientes', label: 'Pacientes', roles: ['ADMIN', 'RECEPCION'] },
    { path: '/habitaciones', label: 'Habitaciones', roles: ['ADMIN', 'RECEPCION'] },
    { path: '/hospitalizaciones', label: 'Hospitalizaciones', roles: ['ADMIN', 'MEDICO', 'RECEPCION'] },
  ];

  readonly visibles = computed(() => this.menu.filter((item) => this.auth.tieneRol(...item.roles)));

  etiqueta(rol?: string): string {
    return rol ? ROL[rol] ?? rol : '';
  }

  salir(): void {
    this.auth.salir();
    void this.router.navigate(['/login']);
  }
}
