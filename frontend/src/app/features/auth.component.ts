import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ApiService, mensaje } from "../core/api.service";
import { SessionService } from "../core/session.service";
import { LoginResponse } from "../core/models";
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./auth.component.html",
})
export class AuthComponent {
  api = inject(ApiService);
  s = inject(SessionService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  registro = this.route.snapshot.data["registro"] === true;
  nombre = "";
  email = "";
  password = "";
  busy = false;
  error = "";
  success = this.route.snapshot.queryParamMap.has("creada")
    ? "Cuenta creada. Inicia sesión para reservar."
    : "";
  constructor() {
    if (this.route.snapshot.queryParamMap.has("expirada"))
      this.error = "Tu sesión terminó. Inicia sesión de nuevo.";
  }
  submit() {
    this.error = "";
    this.busy = true;
    if (this.registro) {
      this.api
        .post("/auth/registro", {
          nombre: this.nombre,
          email: this.email,
          password: this.password,
        })
        .subscribe({
          next: () =>
            this.router.navigate(["/login"], { queryParams: { creada: 1 } }),
          error: (e) => {
            this.error = mensaje(e);
            this.busy = false;
          },
        });
    } else {
      this.api
        .post<LoginResponse>("/auth/login", {
          email: this.email,
          password: this.password,
        })
        .subscribe({
          next: (r) => {
            this.s.save(r);
            this.router.navigate(["/habitaciones"]);
          },
          error: (e) => {
            this.error = mensaje(e);
            this.busy = false;
          },
        });
    }
  }
}
