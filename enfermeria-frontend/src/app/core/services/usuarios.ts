
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Rol = 'ADMIN' | 'ENFERMERO';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface UsuarioRequest {
  nombre: string;
  correo: string;
  password: string;
  rol: Rol;
}

@Injectable({
  providedIn: 'root'
})
export class Usuarios {
  private http = inject(HttpClient);

  private url = 'http://localhost:8080/api/usuarios';

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  crear(datos: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  actualizar(id: number, datos: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.url}/${id}`,
      datos
    );
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.url}/${id}/desactivar`,
      {}
    );
  }
}
