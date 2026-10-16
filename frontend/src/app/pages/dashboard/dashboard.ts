import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  nombre: string = '';
  rol: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

    // Recuperamos los datos guardados después del login
    this.nombre =
      this.authService.getNombre() || 'Usuario';

    this.rol =
      this.authService.getRol() || '';
  }

  /**
   * Indica si el usuario autenticado es ADMIN.
   */
  esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  /**
   * Cierra la sesión y elimina el JWT.
   */
  cerrarSesion(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }
}