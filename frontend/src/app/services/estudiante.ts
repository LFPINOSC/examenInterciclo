import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Datos que devuelve el backend.
 */
export interface Estudiante {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  carreraId: number;
  carrera: string;
  usuarioId: number;
  correo: string;
}

/**
 * Datos enviados para crear o actualizar.
 */
export interface EstudianteRequest {
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  carreraId: number | null;
  usuarioId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {

  private http = inject(HttpClient);

  private readonly API =
    'http://localhost:8080/api/estudiantes';

  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.API);
  }

  guardar(
    datos: EstudianteRequest
  ): Observable<Estudiante> {

    return this.http.post<Estudiante>(
      this.API,
      datos
    );
  }

  actualizar(
    id: number,
    datos: EstudianteRequest
  ): Observable<Estudiante> {

    return this.http.put<Estudiante>(
      `${this.API}/${id}`,
      datos
    );
  }

  eliminar(id: number): Observable<any> {

    return this.http.delete(
      `${this.API}/${id}`
    );
  }

  miPerfil(): Observable<Estudiante> {

    return this.http.get<Estudiante>(
      `${this.API}/mi-perfil`
    );
  }
}