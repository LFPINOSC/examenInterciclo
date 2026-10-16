// ==========================================
// DASHBOARD - CONTROL DE CITAS MEDICAS
// ==========================================

// Component permite crear nuestra pantalla principal.
import { Component, inject } from '@angular/core';

// Router permite navegar entre las pantallas.
// RouterLink permite crear enlaces internos.
import { Router, RouterLink } from '@angular/router';

// Servicio de autenticacion del sistema.
import { Auth } from '../../servicios/auth';

/**
 * DASHBOARD PRINCIPAL
 *
 * FUNCIONES:
 * 1. Mostrar el usuario autenticado.
 * 2. Mostrar su rol.
 * 3. Acceder a Pacientes, Medicos y Citas.
 * 4. Mostrar Usuarios solo al administrador.
 * 5. Cerrar sesion y regresar al login.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  // Inyectar los servicios necesarios.
  private auth = inject(Auth);
  private router = inject(Router);

  // Recuperar la informacion del usuario.
  usuario = this.auth.obtenerUsuario();
  rol = this.auth.obtenerRol();

  // Comprobar si tiene permisos de administrador.
  get esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  /**
   * Cerrar la sesion:
   * 1. Eliminar token JWT.
   * 2. Eliminar los datos del usuario.
   * 3. Regresar a la pantalla de login.
   */
  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigateByUrl('/login');
  }
}