import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Carrera } from './carrera';

/**
 * Modelo que devuelve el backend.
 */
export interface Asignatura {
  id?: number;
  codigo: string;
  nombre: string;
  creditos: number;
  nivel: number;
  activa: boolean;
  carrera: Carrera;
}

/**
 * Datos enviados al backend para crear o editar.
 */
export interface AsignaturaRequest {
  codigo: string;
  nombre: string;
  creditos: number;
  nivel: number;
  activa: boolean;
  carreraId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {

  private http = inject(HttpClient);

  private readonly API =
    'http://localhost:8080/api/asignaturas';

  listar(): Observable<Asignatura[]> {
    return this.http.get<Asignatura[]>(this.API);
  }

  guardar(
    datos: AsignaturaRequest
  ): Observable<Asignatura> {

    return this.http.post<Asignatura>(
      this.API,
      datos
    );
  }

  actualizar(
    id: number,
    datos: AsignaturaRequest
  ): Observable<Asignatura> {

    return this.http.put<Asignatura>(
      `${this.API}/${id}`,
      datos
    );
  }

  eliminar(id: number): Observable<any> {

    return this.http.delete(
      `${this.API}/${id}`
    );
  }
}