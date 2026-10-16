import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// ESTADOS DE UNA CITA ODONTOLOGICA
// ==========================================

export type EstadoCita =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'ATENDIDA'
  | 'CANCELADA';

// ==========================================
// RESPUESTA DE LA API
// ==========================================

export interface Cita {
  id: number;
  pacienteId: number;
  odontologoId: number;
  servicioId: number;
  fechaHora: string;
  estado: EstadoCita;
  observaciones: string | null;
}

// ==========================================
// DATOS ENVIADOS PARA CREAR O EDITAR
// ==========================================

export interface CitaSolicitud {
  pacienteId: number;
  odontologoId: number;
  servicioId: number;
  fechaHora: string;
  observaciones: string;
}

// ==========================================
// SERVICIO HTTP DE CITAS
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class CitasApi {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/citas';

  // GET: obtener todas las citas
  listar(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  // GET: consultar una cita por ID
  buscar(id: number): Observable<Cita> {
    return this.http.get<Cita>(
      `${this.apiUrl}/${id}`
    );
  }

  // GET: consultar citas de un paciente
  listarPorPaciente(pacienteId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/paciente/${pacienteId}`
    );
  }

  // POST: registrar nueva cita
  guardar(datos: CitaSolicitud): Observable<Cita> {
    return this.http.post<Cita>(
      this.apiUrl,
      datos
    );
  }

  // PUT: editar una cita
  actualizar(
    id: number,
    datos: CitaSolicitud
  ): Observable<Cita> {

    return this.http.put<Cita>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  // PATCH: modificar el estado de una cita
  cambiarEstado(
    id: number,
    estado: EstadoCita
  ): Observable<Cita> {

    return this.http.patch<Cita>(
      `${this.apiUrl}/${id}/estado`,
      { estado }
    );
  }

  // DELETE: eliminar una cita
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}