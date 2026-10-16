// ==========================================
// SERVICIO DE PACIENTES
// CONTROL DE CITAS MEDICAS
// ==========================================

// Permite crear un servicio Angular.
import { Injectable, inject } from '@angular/core';

// Permite comunicarse con Spring Boot.
import { HttpClient } from '@angular/common/http';

// Representa una respuesta asincrona.
import { Observable } from 'rxjs';

// ==========================================
// MODELOS DE DATOS
// ==========================================

// Datos que devuelve la API para un paciente.
export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correo: string;
}

// Datos necesarios para registrar o editar.
export interface PacienteDatos {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correo: string;
}

// ==========================================
// SERVICIO HTTP
// ==========================================

/**
 * Consume los endpoints de PacienteController.
 *
 * GET    /api/pacientes
 * GET    /api/pacientes/{id}
 * POST   /api/pacientes
 * PUT    /api/pacientes/{id}
 * DELETE /api/pacientes/{id}
 *
 * El interceptor agrega automaticamente
 * el token JWT en las solicitudes.
 */
@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private readonly http = inject(HttpClient);

  // Direccion de la API Spring Boot.
  private readonly apiUrl =
    'http://localhost:8080/api/pacientes';

  // Obtener todos los pacientes.
  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  // Obtener un paciente por ID.
  buscarPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(
      `${this.apiUrl}/${id}`
    );
  }

  // Registrar un nuevo paciente.
  crear(datos: PacienteDatos): Observable<Paciente> {
    return this.http.post<Paciente>(
      this.apiUrl,
      datos
    );
  }

  // Actualizar un paciente existente.
  actualizar(
    id: number,
    datos: PacienteDatos
  ): Observable<Paciente> {
    return this.http.put<Paciente>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  // Eliminar un paciente por ID.
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}