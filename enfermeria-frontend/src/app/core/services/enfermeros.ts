
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Enfermero {
  id: number;
  usuarioId: number;
  nombre: string;
  correo: string;
  cedula: string;
  numeroLicencia: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
}

export interface EnfermeroRequest {
  usuarioId: number;
  cedula: string;
  numeroLicencia: string;
  telefono: string;
  especialidad: string;
}

@Injectable({
  providedIn: 'root'
})
export class Enfermeros {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/enfermeros';

  listar(): Observable<Enfermero[]> {
    return this.http.get<Enfermero[]>(this.url);
  }

  obtener(id: number): Observable<Enfermero> {
    return this.http.get<Enfermero>(`${this.url}/${id}`);
  }

  crear(datos: EnfermeroRequest): Observable<Enfermero> {
    return this.http.post<Enfermero>(this.url, datos);
  }

  actualizar(
    id: number,
    datos: EnfermeroRequest
  ): Observable<Enfermero> {
    return this.http.put<Enfermero>(`${this.url}/${id}`, datos);
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.url}/${id}/desactivar`,
      {}
    );
  }
}
