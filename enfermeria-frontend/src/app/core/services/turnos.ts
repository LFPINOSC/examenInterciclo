
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Turno {
  id: number;
  enfermeroId: number;
  nombreEnfermero: string;
  fechaInicio: string;
  fechaFin: string;
  observaciones: string;
  activo: boolean;
}

export interface TurnoRequest {
  enfermeroId: number;
  fechaInicio: string;
  fechaFin: string;
  observaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class Turnos {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/turnos';

  listar(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.url);
  }

  crear(datos: TurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(this.url, datos);
  }

  actualizar(id: number, datos: TurnoRequest): Observable<Turno> {
    return this.http.put<Turno>(`${this.url}/${id}`, datos);
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.url}/${id}/desactivar`,
      {}
    );
  }

  misTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.url}/mis-turnos`);
  }
}
