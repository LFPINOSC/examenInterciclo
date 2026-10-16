
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Paciente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  activo: boolean;
}

export type PacienteRequest = Omit<Paciente, 'id' | 'activo'>;

@Injectable({
  providedIn: 'root'
})
export class Pacientes {

  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/pacientes';

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.url);
  }

  crear(datos: PacienteRequest): Observable<Paciente> {
    return this.http.post<Paciente>(this.url, datos);
  }

  actualizar(
    id: number,
    datos: PacienteRequest
  ): Observable<Paciente> {
    return this.http.put<Paciente>(
      `${this.url}/${id}`,
      datos
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
