import { Injectable, signal, computed } from "@angular/core";
import { Usuario, LoginResponse } from "./models";
@Injectable({ providedIn: "root" })
export class SessionService {
  token = signal(sessionStorage.getItem("hotel-token") || "");
  usuario = signal<Usuario | null>(this.load());
  isAdmin = computed(() => this.usuario()?.rol === "ADMIN");
  logged = computed(() => !!this.token() && !!this.usuario());
  private load(): Usuario | null {
    try {
      return JSON.parse(sessionStorage.getItem("hotel-user") || "null");
    } catch {
      return null;
    }
  }
  save(r: LoginResponse) {
    this.token.set(r.token);
    this.usuario.set(r.usuario);
    sessionStorage.setItem("hotel-token", r.token);
    sessionStorage.setItem("hotel-user", JSON.stringify(r.usuario));
  }
  clear() {
    this.token.set("");
    this.usuario.set(null);
    sessionStorage.removeItem("hotel-token");
    sessionStorage.removeItem("hotel-user");
  }
}
