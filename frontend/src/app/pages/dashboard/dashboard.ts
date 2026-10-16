import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// Servicio de autenticacion y sesion
import { Auth } from '../../services/auth';

// ==========================================
// ESTRUCTURA DE MODULOS
// ==========================================

interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  soloAdmin: boolean;
}

// ==========================================
// COMPONENTE DASHBOARD
// ==========================================

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  // Servicios
  private auth = inject(Auth);
  private router = inject(Router);

  // Usuario conectado
  username: string =
    this.auth.obtenerUsuario() || 'Usuario';

  rol: string =
    this.auth.obtenerRol() || 'USER';

  esAdmin: boolean =
    this.auth.esAdmin();

  mensaje: string = '';

  // ==========================================
  // MODULOS DISPONIBLES
  // ==========================================

  modulos: Modulo[] = [

    {
      id: 'pacientes',
      titulo: 'Pacientes',
      descripcion:
        'Registrar, consultar, actualizar y eliminar pacientes.',
      icono: '👥',
      soloAdmin: true
    },

    {
      id: 'odontologos',
      titulo: 'Odontólogos',
      descripcion:
        'Administrar los profesionales odontológicos.',
      icono: '👨‍⚕️',
      soloAdmin: false
    },

    {
      id: 'servicios',
      titulo: 'Tratamientos',
      descripcion:
        'Administrar tratamientos odontológicos y sus precios.',
      icono: '🦷',
      soloAdmin: false
    },

    {
      id: 'citas',
      titulo: 'Citas',
      descripcion:
        'Registrar citas, asignar odontólogos y controlar estados.',
      icono: '📅',
      soloAdmin: true
    },

    {
      id: 'pagos',
      titulo: 'Pagos',
      descripcion:
        'Registrar pagos, confirmar cobros y controlar estados.',
      icono: '💳',
      soloAdmin: true
    },

    {
      id: 'usuarios',
      titulo: 'Usuarios',
      descripcion:
        'Consultar usuarios, cambiar roles y activar o desactivar cuentas.',
      icono: '🔐',
      soloAdmin: true
    }

  ];

  // ==========================================
  // FILTRAR MODULOS POR ROL
  // ==========================================

  get modulosVisibles(): Modulo[] {

    return this.modulos.filter(
      modulo => !modulo.soloAdmin || this.esAdmin
    );
  }

  // ==========================================
  // NAVEGACION A MODULOS
  // ==========================================

  abrirModulo(modulo: Modulo): void {

    this.mensaje = '';

    // Comprobar que exista una sesion valida
    if (!this.auth.estaAutenticado()) {

      this.auth.cerrarSesion();
      this.router.navigateByUrl('/login');

      return;
    }

    // Proteger modulos administrativos
    if (modulo.soloAdmin && !this.auth.esAdmin()) {

      this.mensaje =
        'No tienes permisos para acceder a esta sección.';

      return;
    }

    // Abrir modulo solicitado
    switch (modulo.id) {

      case 'pacientes':
        this.router.navigateByUrl('/pacientes');
        break;

      case 'odontologos':
        this.router.navigateByUrl('/odontologos');
        break;

      case 'servicios':
        this.router.navigateByUrl('/tratamientos');
        break;

      case 'citas':
        this.router.navigateByUrl('/citas');
        break;

      case 'pagos':
        this.router.navigateByUrl('/pagos');
        break;

      case 'usuarios':
        this.router.navigateByUrl('/usuarios');
        break;

      default:
        this.mensaje =
          'El módulo solicitado no está disponible.';
        break;
    }
  }

  // ==========================================
  // CERRAR MENSAJE
  // ==========================================

  cerrarMensaje(): void {
    this.mensaje = '';
  }

  // ==========================================
  // CERRAR SESION
  // ==========================================

  cerrarSesion(): void {

    // Eliminar informacion de autenticacion
    this.auth.cerrarSesion();

    // Redirigir al login
    this.router.navigateByUrl('/login');
  }
}