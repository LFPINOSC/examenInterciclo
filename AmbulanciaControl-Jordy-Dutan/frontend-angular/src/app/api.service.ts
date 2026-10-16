import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timeout } from 'rxjs';

export interface Sesion {
  token: string;
  correo: string;
  nombre: string;
  rol: 'ADMIN' | 'OPERADOR';
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/api/';

  // Genera los headers con el token si existe
  private opts() {
    const token = sessionStorage.getItem('ambulanciasToken');
    return {
      headers: new HttpHeaders(
        token ? { Authorization: 'Bearer ' + token } : {}
      )
    };
  }

  registro(datos: any) {
    return this.http.post<any>(`${this.base}auth/registro`, datos)
      .pipe(timeout(15000));
  }

  login(datos: any) {
    return this.http.post<Sesion>(`${this.base}auth/login`, datos)
      .pipe(timeout(15000));
  }

  perfil() {
    return this.http.get<Omit<Sesion, 'token'>>(`${this.base}auth/perfil`, this.opts())
      .pipe(timeout(15000));
  }

  listar(modulo: string) {
    return this.http.get<any[]>(`${this.base}${modulo}`, this.opts())
      .pipe(timeout(15000));
  }

  crear(modulo: string, datos: any) {
    return this.http.post<any>(`${this.base}${modulo}`, datos, this.opts())
      .pipe(timeout(15000));
  }

  actualizar(modulo: string, id: number, datos: any) {
    return this.http.put<any>(`${this.base}${modulo}/${id}`, datos, this.opts())
      .pipe(timeout(15000));
  }

  eliminar(modulo: string, id: number) {
    return this.http.delete<any>(`${this.base}${modulo}/${id}`, this.opts())
      .pipe(timeout(15000));
  }

  finalizar(id: number) {
    return this.http.patch<any>(`${this.base}asignaciones/${id}/finalizar`, {}, this.opts())
      .pipe(timeout(15000));
  }
}