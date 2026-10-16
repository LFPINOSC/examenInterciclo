import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "./api.config";
import { Asignatura } from "../../Modelos/modelos";
@Injectable({ providedIn: "root" })
export class AsignaturaServicio {
  private u = `${API_URL}/asignaturas`;
  constructor(private h: HttpClient) {}
  listar() {
    return this.h.get<Asignatura[]>(this.u);
  }
  buscar(id: number) {
    return this.h.get<Asignatura>(`${this.u}/${id}`);
  }
  crear(x: any) {
    return this.h.post<Asignatura>(this.u, x);
  }
  actualizar(id: number, x: any) {
    return this.h.put<Asignatura>(`${this.u}/${id}`, x);
  }
  eliminar(id: number) {
    return this.h.delete(`${this.u}/${id}`);
  }
}
