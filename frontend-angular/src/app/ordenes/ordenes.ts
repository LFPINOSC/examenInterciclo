import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ordenes.html',
  styleUrl: './ordenes.css'
})
export class Ordenes implements OnInit {
  ordenes: any[] = [];
  pacientes: any[] = [];
  medicos: any[] = [];
  examenes: any[] = [];
  
  nombreUsuario = 'Usuario';
  rolUsuario = '';

  // Campos del formulario
  id_paciente = '';
  id_medico = '';
  examenesSeleccionados: number[] = [];

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
      this.nombreUsuario = usuarioData.nombre_usuario || 'Usuario';
      this.rolUsuario = usuarioData.rol || '';
      this.cargarDatos();
    }
  }

  cargarDatos() {
    this.apiService.getOrdenes().subscribe({
      next: (data: any) => {
        this.ordenes = Array.isArray(data) ? data : (data.ordenes || data.data || []);
      },
      error: (err) => console.error('Error al cargar órdenes:', err)
    });

    this.apiService.getPacientes().subscribe({
      next: (data: any) => {
        this.pacientes = Array.isArray(data) ? data : (data.pacientes || data.data || []);
      },
      error: (err) => console.error('Error al cargar pacientes:', err)
    });

    this.apiService.getMedicos().subscribe({
      next: (data: any) => {
        this.medicos = Array.isArray(data) ? data : (data.medicos || data.data || []);
      },
      error: (err) => console.error('Error al cargar médicos:', err)
    });

    this.apiService.getExamanes().subscribe({
      next: (data: any) => {
        this.examenes = Array.isArray(data) ? data : (data.examenes || data.data || []);
      },
      error: (err) => console.error('Error al cargar exámenes:', err)
    });
  }

  // Función para obtener y cruzar el nombre del médico usando su ID o su objeto
  getNombreMedico(medicoRef: any): string {
    if (!medicoRef) return 'N/A';
    
    // Si viene como un objeto completo desde el backend
    if (typeof medicoRef === 'object') {
      const nombres = medicoRef.nombres || medicoRef.nombre || '';
      const apellidos = medicoRef.apellidos || '';
      return `${nombres} ${apellidos}`.trim() || 'N/A';
    }

    // Si viene como un ID numérico o de texto, lo buscamos en el arreglo de médicos
    const medicoEncontrado = this.medicos.find(m => (m.id_medico || m.id) == medicoRef);
    if (medicoEncontrado) {
      return `Dr(a). ${medicoEncontrado.nombres || ''} ${medicoEncontrado.apellidos || ''}`.trim();
    }

    return 'N/A';
  }

  onCheckboxChange(event: any, id: number) {
    if (event.target.checked) {
      this.examenesSeleccionados.push(id);
    } else {
      this.examenesSeleccionados = this.examenesSeleccionados.filter(item => item !== id);
    }
  }

  registrarOrden() {
    const nuevaOrden = {
      id_paciente: this.id_paciente,
      id_medico: this.id_medico,
      examenes: this.examenesSeleccionados
    };

    this.apiService.crearOrden(nuevaOrden).subscribe({
      next: () => {
        this.esError = false;
        this.mensaje = '¡Orden médica generada con éxito!';
        this.limpiarFormulario();
        this.cargarDatos();
      },
      error: (err) => {
        this.esError = true;
        this.mensaje = err.error?.error || 'No se pudo generar la orden.';
      }
    });
  }

  limpiarFormulario() {
    this.id_paciente = '';
    this.id_medico = '';
    this.examenesSeleccionados = [];
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}