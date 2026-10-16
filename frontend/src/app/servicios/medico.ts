// ==========================================
// SERVICIO DE MEDICOS
// CONTROL DE CITAS MEDICAS
// ==========================================

// Permite crear servicios e inyectar dependencias.
import { Injectable, inject } from '@angular/core';

// Permite consumir los endpoints de Spring Boot.
import { HttpClient, HttpParams } from '@angular/common/http';

// Representa las respuestas asincronas de la API.
import { Observable } from 'rxjs';

// ==========================================
// MODELO DE MEDICO
// ==========================================

/**
 * Representa un medico registrado
 * en nuestra base de datos PostgreSQL.
 */
export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
}

/**
 * Datos necesarios para registrar
 * o actualizar un medico.
 */
export interface MedicoDatos {
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
}

// ==========================================
// SERVICIO HTTP
// ==========================================

/**
 * Permite consumir MedicoController.java.
 *
 * ENDPOINTS:
 *
 * GET    /api/medicos
 * GET    /api/medicos/{id}
 * GET    /api/medicos/especialidad?nombre=...
 * POST   /api/medicos
 * PUT    /api/medicos/{id}
 * DELETE /api/medicos/{id}
 *
 * El interceptor agrega el token JWT
 * automaticamente a cada solicitud.
 */
@Injectable({
  providedIn: 'root'
})
export class MedicoService {

  // Inyectar HttpClient.
  private readonly http = inject(HttpClient);

  // Direccion de la API REST.
  private readonly apiUrl =
    'http://localhost:8080/api/medicos';

  // ==========================================
  // 1. LISTAR MEDICOS
  // ==========================================

  listar(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  // ==========================================
  // 2. BUSCAR POR ID
  // ==========================================

  buscarPorId(id: number): Observable<Medico> {
    return this.http.get<Medico>(
      `${this.apiUrl}/${id}`
    );
  }

  // ==========================================
  // 3. BUSCAR POR ESPECIALIDAD
  // ==========================================

  buscarPorEspecialidad(
    nombre: string
  ): Observable<Medico[]> {

    const params = new HttpParams()
      .set('nombre', nombre);

    return this.http.get<Medico[]>(
      `${this.apiUrl}/especialidad`,
      { params }
    );
  }

  // ==========================================
  // 4. REGISTRAR MEDICO
  // ==========================================

  crear(datos: MedicoDatos): Observable<Medico> {
    return this.http.post<Medico>(
      this.apiUrl,
      datos
    );
  }

  // ==========================================
  // 5. ACTUALIZAR MEDICO
  // ==========================================

  actualizar(
    id: number,
    datos: MedicoDatos
  ): Observable<Medico> {

    return this.http.put<Medico>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  // ==========================================
  // 6. ELIMINAR MEDICO
  // ==========================================

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}