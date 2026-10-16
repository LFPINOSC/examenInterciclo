import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "./api.config";
import { Usuario } from "../../Modelos/modelos";
@Injectable({ providedIn: "root" })
export class UsuarioServicio {
  private u = `${API_URL}/admin/usuarios`;
  constructor(private h: HttpClient) {}
  listar() {
    return this.h.get<Usuario[]>(this.u);
  }
  pendientes() {
    return this.h.get<Usuario[]>(`${this.u}/pendientes`);
  }
  aprobar(id: number) {
    return this.h.put<Usuario>(`${this.u}/${id}/aprobar`, {});
  }
  bloquear(id: number) {
    return this.h.put<Usuario>(`${this.u}/${id}/bloquear`, {});
  }
  activar(id: number) {
    return this.h.put<Usuario>(`${this.u}/${id}/activar`, {});
  }
}
