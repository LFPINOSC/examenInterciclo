import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// MODELO DE SERVICIO ODONTOLOGICO
// ==========================================

// Representa los tratamientos almacenados
// en la base de datos PostgreSQL.
export interface Servicio {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

// ==========================================
// SERVICIO HTTP DE TRATAMIENTOS
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class ServiciosApi {

  // Cliente HTTP de Angular
  private http = inject(HttpClient);

  // Endpoint del backend Spring Boot
  private apiUrl = 'http://localhost:8080/api/servicios';

  // ==========================================
  // GET - LISTAR TRATAMIENTOS
  // ==========================================

  listar(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl);
  }

  // ==========================================
  // GET - BUSCAR TRATAMIENTO POR ID
  // ==========================================

  buscar(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(
      `${this.apiUrl}/${id}`
    );
  }

  // ==========================================
  // POST - REGISTRAR TRATAMIENTO
  // ==========================================

  guardar(datos: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(
      this.apiUrl,
      datos
    );
  }

  // ==========================================
  // PUT - ACTUALIZAR TRATAMIENTO
  // ==========================================

  actualizar(
    id: number,
    datos: Servicio
  ): Observable<Servicio> {

    return this.http.put<Servicio>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  // ==========================================
  // DELETE - ELIMINAR TRATAMIENTO
  // ==========================================

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}