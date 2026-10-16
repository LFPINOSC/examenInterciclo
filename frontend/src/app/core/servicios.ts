import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Cliente,
  ClienteRequest,
  Equipo,
  EquipoRequest,
  EstadoOrden,
  Orden,
  OrdenRequest,
  Resumen,
  Tarea,
  TareaRequest,
  Tecnico,
  Usuario,
  UsuarioRequest,
} from './modelos';
import { API_URL } from './utilidades';

// Un servicio por recurso de la API. Cada metodo corresponde a un endpoint.

/** /api/clientes - solo ADMIN. */
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/clientes`;

  listar(q = ''): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url, { params: new HttpParams().set('q', q) });
  }

  crear(datos: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, datos);
  }

  actualizar(id: number, datos: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

/** /api/equipos - solo ADMIN. */
@Injectable({ providedIn: 'root' })
export class EquipoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/equipos`;

  listar(clienteId?: number | null): Observable<Equipo[]> {
    const params = clienteId ? new HttpParams().set('clienteId', clienteId) : undefined;
    return this.http.get<Equipo[]>(this.url, { params });
  }

  crear(datos: EquipoRequest): Observable<Equipo> {
    return this.http.post<Equipo>(this.url, datos);
  }

  actualizar(id: number, datos: EquipoRequest): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.url}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

/** /api/ordenes y /api/tareas - ADMIN todo; TECNICO solo sus ordenes. */
@Injectable({ providedIn: 'root' })
export class OrdenService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/ordenes`;

  listar(estado: EstadoOrden | '' = '', q = ''): Observable<Orden[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (q) params = params.set('q', q);
    return this.http.get<Orden[]>(this.url, { params });
  }

  buscar(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${this.url}/${id}`);
  }

  crear(datos: OrdenRequest): Observable<Orden> {
    return this.http.post<Orden>(this.url, datos);
  }

  actualizar(id: number, datos: OrdenRequest): Observable<Orden> {
    return this.http.put<Orden>(`${this.url}/${id}`, datos);
  }

  cambiarEstado(id: number, estado: EstadoOrden): Observable<Orden> {
    return this.http.patch<Orden>(`${this.url}/${id}/estado`, { estado });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  agregarTarea(ordenId: number, datos: TareaRequest): Observable<Tarea> {
    return this.http.post<Tarea>(`${this.url}/${ordenId}/tareas`, datos);
  }

  actualizarTarea(id: number, datos: TareaRequest): Observable<Tarea> {
    return this.http.put<Tarea>(`${API_URL}/tareas/${id}`, datos);
  }

  eliminarTarea(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/tareas/${id}`);
  }

  resumen(): Observable<Resumen> {
    return this.http.get<Resumen>(`${API_URL}/resumen`);
  }
}

/** /api/admin/usuarios (solo ADMIN) y /api/tecnicos (ADMIN o TECNICO). */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  tecnicos(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${API_URL}/tecnicos`);
  }

  crear(datos: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  actualizar(id: number, datos: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, datos);
  }

  cambiarActivo(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/activo`, { activo });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
