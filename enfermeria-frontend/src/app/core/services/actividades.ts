
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TipoActividad =
  | 'SIGNOS_VITALES'
  | 'ADMINISTRACION_MEDICAMENTOS'
  | 'CURACION'
  | 'HIGIENE_PACIENTE'
  | 'CONTROL_GLUCOSA'
  | 'MOVILIZACION'
  | 'OTRA';

export interface Actividad {
  id: number;
  pacienteId: number;
  enfermeroId: number;
  turnoId: number;
  tipo: TipoActividad;
  descripcion: string;
  fechaProgramada: string;
  estado: string;
  nombrePaciente?: string;
  nombreEnfermero?: string;
}

export interface ActividadRequest {
  pacienteId: number;
  enfermeroId: number;
  turnoId: number;
  tipo: TipoActividad;
  descripcion: string;
  fechaProgramada: string;
}

@Injectable({ providedIn: 'root' })
export class Actividades {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/actividades';

  listar(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.url);
  }

  crear(datos: ActividadRequest): Observable<Actividad> {
    return this.http.post<Actividad>(this.url, datos);
  }

  actualizar(
    id: number,
    datos: ActividadRequest
  ): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.url}/${id}`, datos);
  }

  cambiarEstado(id: number, estado: string): Observable<Actividad> {
    return this.http.patch<Actividad>(
      `${this.url}/${id}/estado`,
      { estado }
    );
  }

  cancelar(id: number): Observable<Actividad> {
    return this.http.patch<Actividad>(
      `${this.url}/${id}/cancelar`,
      {}
    );
  }

  misActividades(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(
      `${this.url}/mis-actividades`
    );
  }
}
