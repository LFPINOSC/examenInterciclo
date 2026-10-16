import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Modelo de una carrera universitaria.
 */
export interface Carrera {
  id?: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CarreraService {

  private http = inject(HttpClient);

  private readonly API =
    'http://localhost:8080/api/carreras';

  listar(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(this.API);
  }

  guardar(carrera: Carrera): Observable<Carrera> {
    return this.http.post<Carrera>(
      this.API,
      carrera
    );
  }

  actualizar(
    id: number,
    carrera: Carrera
  ): Observable<Carrera> {

    return this.http.put<Carrera>(
      `${this.API}/${id}`,
      carrera
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(
      `${this.API}/${id}`
    );
  }
}