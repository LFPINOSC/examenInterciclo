import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "./api.config";
import { Carrera } from "../../Modelos/modelos";
@Injectable({ providedIn: "root" })
export class CarreraServicio {
  private u = `${API_URL}/carreras`;
  constructor(private h: HttpClient) {}
  listar() {
    return this.h.get<Carrera[]>(this.u);
  }
  buscar(id: number) {
    return this.h.get<Carrera>(`${this.u}/${id}`);
  }
  crear(x: any) {
    return this.h.post<Carrera>(this.u, x);
  }
  actualizar(id: number, x: any) {
    return this.h.put<Carrera>(`${this.u}/${id}`, x);
  }
  eliminar(id: number) {
    return this.h.delete(`${this.u}/${id}`);
  }
}
