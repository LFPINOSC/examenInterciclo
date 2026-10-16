import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Dashboard, Habitacion, Hospitalizacion, Medico, Paciente, Rol, Usuario,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private params(filtros: Record<string, string | undefined>): HttpParams | undefined {
    let params = new HttpParams();
    let tiene = false;
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) {
        params = params.set(clave, valor);
        tiene = true;
      }
    }
    return tiene ? params : undefined;
  }

  dashboard() {
    return this.http.get<Dashboard>('/api/dashboard');
  }

  pacientes(q = '') {
    return this.http.get<Paciente[]>('/api/pacientes', { params: this.params({ q }) });
  }

  crearPaciente(body: Omit<Paciente, 'id'>) {
    return this.http.post<Paciente>('/api/pacientes', body);
  }

  actualizarPaciente(id: number, body: Omit<Paciente, 'id'>) {
    return this.http.put<Paciente>(`/api/pacientes/${id}`, body);
  }

  eliminarPaciente(id: number) {
    return this.http.delete(`/api/pacientes/${id}`);
  }

  medicos(q = '') {
    return this.http.get<Medico[]>('/api/medicos', { params: this.params({ q }) });
  }

  crearMedico(body: Omit<Medico, 'id' | 'usuarioNombre'>) {
    return this.http.post<Medico>('/api/medicos', body);
  }

  actualizarMedico(id: number, body: Omit<Medico, 'id' | 'usuarioNombre'>) {
    return this.http.put<Medico>(`/api/medicos/${id}`, body);
  }

  eliminarMedico(id: number) {
    return this.http.delete(`/api/medicos/${id}`);
  }

  habitaciones(filtros: { q?: string; estado?: string } = {}) {
    return this.http.get<Habitacion[]>('/api/habitaciones', { params: this.params(filtros) });
  }

  crearHabitacion(body: Omit<Habitacion, 'id' | 'pacienteNombre' | 'hospitalizacionCodigo'>) {
    return this.http.post<Habitacion>('/api/habitaciones', body);
  }

  actualizarHabitacion(id: number, body: Omit<Habitacion, 'id' | 'pacienteNombre' | 'hospitalizacionCodigo'>) {
    return this.http.put<Habitacion>(`/api/habitaciones/${id}`, body);
  }

  eliminarHabitacion(id: number) {
    return this.http.delete(`/api/habitaciones/${id}`);
  }

  hospitalizaciones(filtros: { q?: string; estado?: string } = {}) {
    return this.http.get<Hospitalizacion[]>('/api/hospitalizaciones', { params: this.params(filtros) });
  }

  crearHospitalizacion(body: {
    pacienteId: number;
    habitacionId: number;
    medicoId: number;
    fechaIngreso: string;
    diagnosticoIngreso: string;
    observaciones: string;
  }) {
    return this.http.post<Hospitalizacion>('/api/hospitalizaciones', body);
  }

  actualizarHospitalizacion(id: number, body: {
    habitacionId: number;
    medicoId: number;
    diagnosticoIngreso: string;
    observaciones: string;
  }) {
    return this.http.put<Hospitalizacion>(`/api/hospitalizaciones/${id}`, body);
  }

  darAlta(id: number, body: { fechaAlta: string; diagnosticoAlta: string; motivoAlta: string }) {
    return this.http.post<Hospitalizacion>(`/api/hospitalizaciones/${id}/alta`, body);
  }

  eliminarHospitalizacion(id: number) {
    return this.http.delete(`/api/hospitalizaciones/${id}`);
  }

  usuarios() {
    return this.http.get<Usuario[]>('/api/usuarios');
  }

  roles() {
    return this.http.get<Rol[]>('/api/usuarios/roles');
  }

  crearUsuario(body: { nombres: string; apellidos: string; correo: string; password: string; rol: string; activo: boolean }) {
    return this.http.post<Usuario>('/api/usuarios', body);
  }

  actualizarUsuario(id: number, body: { nombres: string; apellidos: string; correo: string; password: string; rol: string; activo: boolean }) {
    return this.http.put<Usuario>(`/api/usuarios/${id}`, body);
  }

  eliminarUsuario(id: number) {
    return this.http.delete(`/api/usuarios/${id}`);
  }
}
