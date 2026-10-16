import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "./api.config";
import { Docente } from "../../Modelos/modelos";
@Injectable({ providedIn: "root" })
export class DocenteServicio {
  private u = `${API_URL}/docentes`;
  constructor(private h: HttpClient) {}
  listar() {
    return this.h.get<Docente[]>(this.u);
  }
  buscar(id: number) {
    return this.h.get<Docente>(`${this.u}/${id}`);
  }
  crear(x: any) {
    return this.h.post<Docente>(this.u, x);
  }
  actualizar(id: number, x: any) {
    return this.h.put<Docente>(`${this.u}/${id}`, x);
  }
  eliminar(id: number) {
    return this.h.delete(`${this.u}/${id}`);
  }
}
