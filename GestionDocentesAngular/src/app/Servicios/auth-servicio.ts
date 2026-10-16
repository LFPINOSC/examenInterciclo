import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { API_URL } from "./api.config";
import { AuthResponse, Rol } from "../../Modelos/modelos";

@Injectable({ providedIn: "root" })
export class AuthServicio {
  private tokenKey = "docentes_token";
  private rolKey = "docentes_rol";
  private nombreKey = "docentes_nombre";
  private correoKey = "docentes_correo";

  rol = signal<Rol | null>(localStorage.getItem(this.rolKey) as Rol | null);
  nombre = signal(localStorage.getItem(this.nombreKey) || "");
  correo = signal(localStorage.getItem(this.correoKey) || "");

  constructor(private http: HttpClient) {}

  login(data: { correo: string; password: string }) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, data).pipe(
      tap((r) => {
        localStorage.setItem(this.tokenKey, r.token);
        localStorage.setItem(this.rolKey, r.rol);
        localStorage.setItem(this.nombreKey, r.nombre);
        localStorage.setItem(this.correoKey, r.correo);

        this.rol.set(r.rol);
        this.nombre.set(r.nombre);
        this.correo.set(r.correo);
      }),
    );
  }

  registro(data: any) {
    return this.http.post<any>(`${API_URL}/auth/registro`, data);
  }

  verificar(data: any) {
    return this.http.post(`${API_URL}/auth/verificar`, data, {
      responseType: "text",
    });
  }

  reenviar(correo: string) {
    return this.http.post(
      `${API_URL}/auth/reenviar-codigo`,
      { correo },
      { responseType: "text" },
    );
  }

  token() {
    return localStorage.getItem(this.tokenKey);
  }

  autenticado() {
    return !!this.token();
  }

  esAdmin() {
    return this.rol() === "ADMIN";
  }

  salir() {
    [this.tokenKey, this.rolKey, this.nombreKey, this.correoKey].forEach((k) =>
      localStorage.removeItem(k),
    );

    this.rol.set(null);
    this.nombre.set("");
    this.correo.set("");
  }
}
