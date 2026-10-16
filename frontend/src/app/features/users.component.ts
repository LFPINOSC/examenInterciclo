import { Component, inject } from "@angular/core";
import { ApiService, mensaje } from "../core/api.service";
import { Usuario } from "../core/models";
@Component({ standalone: true, templateUrl: "./users.component.html" })
export class UsersComponent {
  api = inject(ApiService);
  rows: Usuario[] = [];
  error = "";
  success = "";
  constructor() {
    this.load();
  }
  load() {
    this.api
      .get<Usuario[]>("/usuarios")
      .subscribe({
        next: (r) => (this.rows = r),
        error: (e) => (this.error = mensaje(e)),
      });
  }
  change(u: Usuario) {
    if (
      !confirm((u.activo ? "Desactivar" : "Activar") + " a " + u.nombre + "?")
    )
      return;
    this.api
      .patch("/usuarios/" + u.id + "/activo", { activo: !u.activo })
      .subscribe({
        next: () => {
          this.error = "";
          this.success =
            "Estado actualizado. Los tokens anteriores de esa cuenta quedan revocados.";
          this.load();
        },
        error: (e) => (this.error = mensaje(e)),
      });
  }
}
