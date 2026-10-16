

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroActividadRequest {
  resultado: string;
  observaciones: string;
}

export interface RegistroActividad {
  id: number;
  actividadId: number;
  resultado: string;
  observaciones: string;
  fechaRegistro?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Registros {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/registros';

  registrar(
    actividadId: number,
    datos: RegistroActividadRequest
  ): Observable<RegistroActividad> {
    return this.http.post<RegistroActividad>(
      `${this.url}/actividad/${actividadId}`,
      datos
    );
  }

  consultar(actividadId: number): Observable<RegistroActividad> {
    return this.http.get<RegistroActividad>(
      `${this.url}/actividad/${actividadId}`
    );
  }
}
