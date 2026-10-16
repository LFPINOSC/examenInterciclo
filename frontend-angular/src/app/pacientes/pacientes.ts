import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes implements OnInit {
  pacientes: any[] = [];
  nombreUsuario = 'Usuario';
  rolUsuario = '';

  // Campos del formulario
  cedula = '';
  nombres = '';
  apellidos = '';
  telefono = '';
  email = '';
  direccion = '';
  mensaje = '';
  esError = false;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!token) {
      alert('Acceso no autorizado. Inicie sesión.');
      this.router.navigate(['/login']);
    } else {
      this.nombreUsuario = usuarioData.nombre || 'Usuario';
      this.rolUsuario = usuarioData.rol || '';
      this.cargarPacientes();
    }
  }

  cargarPacientes() {
    this.apiService.getPacientes().subscribe({
      next: (data: any) => {
        this.pacientes = data;
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
      }
    });
  }

  registrarPaciente() {
    const nuevoPaciente = {
      cedula: this.cedula,
      nombres: this.nombres,
      apellidos: this.apellidos,
      telefono: this.telefono,
      email: this.email,
      direccion: this.direccion
    };

    this.apiService.crearPaciente(nuevoPaciente).subscribe({
      next: () => {
        this.esError = false;
        this.mensaje = '¡Paciente registrado con éxito!';
        this.limpiarFormulario();
        this.cargarPacientes();
      },
      error: (err) => {
        this.esError = true;
        this.mensaje = err.error?.error || 'No se pudo registrar el paciente.';
      }
    });
  }

  limpiarFormulario() {
    this.cedula = '';
    this.nombres = '';
    this.apellidos = '';
    this.telefono = '';
    this.email = '';
    this.direccion = '';
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}