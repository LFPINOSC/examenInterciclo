import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Importante para *ngFor, *ngIf y | date
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente-portal',
  standalone: true,
  imports: [CommonModule], // <-- Aquí agregamos CommonModule
  templateUrl: './paciente-portal.html',
  styleUrls: ['./paciente-portal.css']
})
export class PacientePortal implements OnInit {
  nombreUsuario = '';
  misOrdenes: any[] = []; // Asegúrate de tener esta propiedad para tu tabla

  constructor(private router: Router) {}

  ngOnInit() {
    // Recuperar los datos del usuario logueado desde el localStorage que guardamos en el Login
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      this.nombreUsuario = usuario.nombre || 'Paciente';
    }
    
    // Aquí puedes cargar las órdenes del paciente si ya tienes el servicio listo
  }

  // Método para cerrar sesión que llama tu botón HTML
  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}