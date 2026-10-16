import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-examenes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './examenes.html',
  styleUrl: './examenes.css'
})
export class Examenes implements OnInit {
  examenes: any[] = [];
  nombreUsuario = 'Usuario';
  rolUsuario = '';

  // Campos del formulario
  nombre_examen = '';
  descripcion = '';
  precio: number | null = null;
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
      this.cargarExamanes();
    }
  }

  cargarExamanes() {
    this.apiService.getExamanes().subscribe({
      next: (data: any) => {
        this.examenes = data;
      },
      error: (err) => {
        console.error('Error al cargar exámenes:', err);
      }
    });
  }

  registrarExamen() {
    const nuevoExamen = {
      nombre_examen: this.nombre_examen,
      descripcion: this.descripcion,
      precio: this.precio
    };

    this.apiService.crearExamen(nuevoExamen).subscribe({
      next: () => {
        this.esError = false;
        this.mensaje = '¡Examen registrado con éxito!';
        this.limpiarFormulario();
        this.cargarExamanes();
      },
      error: (err) => {
        this.esError = true;
        this.mensaje = err.error?.error || 'No se pudo registrar el examen.';
      }
    });
  }

  limpiarFormulario() {
    this.nombre_examen = '';
    this.descripcion = '';
    this.precio = null;
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}