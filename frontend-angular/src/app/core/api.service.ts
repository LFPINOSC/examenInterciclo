import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({providedIn:'root'})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly raiz = '/api'; // Angular dev proxy -> http://localhost:8080
  listar<T>(ruta: string): Observable<T> { return this.http.get<T>(this.raiz + ruta); }
  crear<T>(ruta: string, body: unknown): Observable<T> { return this.http.post<T>(this.raiz + ruta, body); }
  editar<T>(ruta: string, body: unknown): Observable<T> { return this.http.put<T>(this.raiz + ruta, body); }
  eliminar(ruta: string): Observable<void> { return this.http.delete<void>(this.raiz + ruta); }
}
