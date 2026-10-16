import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "./api.config";
import { Asignacion } from "../../Modelos/modelos";
@Injectable({ providedIn: "root" })
export class AsignacionServicio {
  private u = `${API_URL}/asignaciones`;
  constructor(private h: HttpClient) {}
  listar() {
    return this.h.get<Asignacion[]>(this.u);
  }
  buscar(id: number) {
    return this.h.get<Asignacion>(`${this.u}/${id}`);
  }
  crear(x: any) {
    return this.h.post<Asignacion>(this.u, x);
  }
  actualizar(id: number, x: any) {
    return this.h.put<Asignacion>(`${this.u}/${id}`, x);
  }
  eliminar(id: number) {
    return this.h.delete(`${this.u}/${id}`);
  }
}
