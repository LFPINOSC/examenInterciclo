import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "./api.config";
import { Periodo } from "../../Modelos/modelos";
@Injectable({ providedIn: "root" })
export class PeriodoServicio {
  private u = `${API_URL}/periodos`;
  constructor(private h: HttpClient) {}
  listar() {
    return this.h.get<Periodo[]>(this.u);
  }
  buscar(id: number) {
    return this.h.get<Periodo>(`${this.u}/${id}`);
  }
  crear(x: any) {
    return this.h.post<Periodo>(this.u, x);
  }
  actualizar(id: number, x: any) {
    return this.h.put<Periodo>(`${this.u}/${id}`, x);
  }
  eliminar(id: number) {
    return this.h.delete(`${this.u}/${id}`);
  }
}
