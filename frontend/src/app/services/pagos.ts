import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// ESTADOS DEL PAGO
// ==========================================

export type EstadoPago =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'CANCELADO';

// ==========================================
// MODELO DE RESPUESTA DEL BACKEND
// ==========================================

export interface Pago {
  id: number;
  citaId: number;
  monto: number;
  metodoPago: string;
  fechaPago: string | null;
  estado: EstadoPago;
}

// ==========================================
// DTO PARA CREAR UN PAGO
// ==========================================

export interface PagoSolicitud {
  citaId: number;
  monto: number;
  metodoPago: string;
}

// ==========================================
// DTO PARA ACTUALIZAR UN PAGO
// ==========================================

export interface PagoActualizar {
  monto: number;
  metodoPago: string;
}

// ==========================================
// SERVICIO HTTP DE PAGOS
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class PagosApi {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/pagos';

  // GET: listar pagos
  listar(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl);
  }

  // GET: buscar por ID
  buscar(id: number): Observable<Pago> {
    return this.http.get<Pago>(
      `${this.apiUrl}/${id}`
    );
  }

  // GET: buscar pago de una cita
  buscarPorCita(citaId: number): Observable<Pago> {
    return this.http.get<Pago>(
      `${this.apiUrl}/cita/${citaId}`
    );
  }

  // POST: registrar un pago nuevo
  guardar(datos: PagoSolicitud): Observable<Pago> {
    return this.http.post<Pago>(
      this.apiUrl,
      datos
    );
  }

  // PUT: actualizar monto y metodo
  actualizar(
    id: number,
    datos: PagoActualizar
  ): Observable<Pago> {

    return this.http.put<Pago>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  // PATCH: marcar pago como PAGADO
  marcarPagado(id: number): Observable<Pago> {
    return this.http.patch<Pago>(
      `${this.apiUrl}/${id}/pagar`,
      {}
    );
  }

  // PATCH: cancelar pago
  cancelar(id: number): Observable<Pago> {
    return this.http.patch<Pago>(
      `${this.apiUrl}/${id}/cancelar`,
      {}
    );
  }

  // DELETE: eliminar registro
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}