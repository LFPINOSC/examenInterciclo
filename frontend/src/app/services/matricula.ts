import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Asignatura incluida dentro de una matrícula.
 */
export interface AsignaturaMatricula {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
}

/**
 * Respuesta que devuelve Spring Boot.
 */
export interface Matricula {
  id: number;
  fecha: string;
  periodo: string;
  estado: string;

  estudianteId: number;
  estudiante: string;

  asignaturas: AsignaturaMatricula[];
}

/**
 * Datos enviados al backend para crear
 * una matrícula.
 */
export interface MatriculaRequest {
  estudianteId: number | null;
  periodo: string;
  asignaturaIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {

  private http = inject(HttpClient);

  private readonly API =
    'http://localhost:8080/api/matriculas';

  /**
   * ADMIN: obtiene todas las matrículas.
   */
  listar(): Observable<Matricula[]> {

    return this.http.get<Matricula[]>(
      this.API
    );
  }

  /**
   * ESTUDIANTE: obtiene solamente
   * sus propias matrículas.
   */
  listarPropias(): Observable<Matricula[]> {

    return this.http.get<Matricula[]>(
      `${this.API}/mis-matriculas`
    );
  }

  /**
   * ADMIN: crea matrícula para
   * cualquier estudiante.
   */
  guardar(
    datos: MatriculaRequest
  ): Observable<Matricula> {

    return this.http.post<Matricula>(
      this.API,
      datos
    );
  }

  /**
   * ESTUDIANTE: crea matrícula
   * únicamente para sí mismo.
   */
  guardarPropia(
    datos: MatriculaRequest
  ): Observable<Matricula> {

    return this.http.post<Matricula>(
      `${this.API}/mi-matricula`,
      datos
    );
  }

  /**
   * ESTUDIANTE: cancela una matrícula propia.
   */
  cancelarPropia(
    id: number
  ): Observable<Matricula> {

    return this.http.put<Matricula>(
      `${this.API}/mis-matriculas/${id}/cancelar`,
      {}
    );
  }

  /**
   * ADMIN: elimina una matrícula.
   */
  eliminar(id: number): Observable<any> {

    return this.http.delete(
      `${this.API}/${id}`
    );
  }
}