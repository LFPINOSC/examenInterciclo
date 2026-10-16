import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// MODELO DE ODONTOLOGO
// ==========================================

// Representa los datos enviados y recibidos
// desde la API REST de Spring Boot.
export interface Odontologo {
  id?: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
  correo: string;
}

// ==========================================
// SERVICIO DE ODONTOLOGOS
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class OdontologosApi {

  // Cliente HTTP de Angular
  private http = inject(HttpClient);

  // URL de nuestra API Spring Boot
  private apiUrl = 'http://localhost:8080/api/odontologos';

  // ==========================================
  // GET - LISTAR ODONTOLOGOS
  // ==========================================

  listar(): Observable<Odontologo[]> {
    return this.http.get<Odontologo[]>(this.apiUrl);
  }

  // ==========================================
  // GET - BUSCAR POR ID
  // ==========================================

  buscar(id: number): Observable<Odontologo> {
    return this.http.get<Odontologo>(
      `${this.apiUrl}/${id}`
    );
  }

  // ==========================================
  // POST - REGISTRAR ODONTOLOGO
  // ==========================================

  guardar(datos: Odontologo): Observable<Odontologo> {
    return this.http.post<Odontologo>(
      this.apiUrl,
      datos
    );
  }

  // ==========================================
  // PUT - ACTUALIZAR ODONTOLOGO
  // ==========================================

  actualizar(
    id: number,
    datos: Odontologo
  ): Observable<Odontologo> {

    return this.http.put<Odontologo>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  // ==========================================
  // DELETE - ELIMINAR ODONTOLOGO
  // ==========================================

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}