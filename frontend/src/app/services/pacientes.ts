import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// INTERFAZ DE PACIENTES
// ==========================================

// Representa los datos que enviamos y recibimos
// desde nuestra API REST de Spring Boot.
export interface Paciente {
  id?: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
}

// ==========================================
// SERVICIO DE PACIENTES
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class Pacientes {

  // Cliente HTTP para conectar con Spring Boot
  private http = inject(HttpClient);

  // URL del controlador de pacientes
  private apiUrl = 'http://localhost:8080/api/pacientes';

  // ==========================================
  // GET - LISTAR PACIENTES
  // ==========================================

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  // ==========================================
  // GET - BUSCAR PACIENTE POR ID
  // ==========================================

  buscar(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(
      `${this.apiUrl}/${id}`
    );
  }

  // ==========================================
  // POST - REGISTRAR PACIENTE
  // ==========================================

  guardar(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(
      this.apiUrl,
      paciente
    );
  }

  // ==========================================
  // PUT - ACTUALIZAR PACIENTE
  // ==========================================

  actualizar(
    id: number,
    paciente: Paciente
  ): Observable<Paciente> {

    return this.http.put<Paciente>(
      `${this.apiUrl}/${id}`,
      paciente
    );
  }

  // ==========================================
  // DELETE - ELIMINAR PACIENTE
  // ==========================================

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}