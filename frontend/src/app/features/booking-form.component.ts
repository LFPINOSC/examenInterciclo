import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CurrencyPipe } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ApiService, mensaje } from "../core/api.service";
import { Habitacion, Reserva } from "../core/models";
@Component({
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: "./booking-form.component.html",
})
export class BookingFormComponent {
  api = inject(ApiService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  id = Number(this.route.snapshot.paramMap.get("id")) || null;
  room: Habitacion | null = null;
  error = "";
  busy = false;
  model = { habitacionId: 0, entrada: "", salida: "", huespedes: 1 };
  constructor() {
    if (this.id) {
      this.api.get<Reserva>("/reservas/" + this.id).subscribe({
        next: (r) => {
          this.model = {
            habitacionId: r.habitacionId,
            entrada: r.entrada,
            salida: r.salida,
            huespedes: r.huespedes,
          };
          this.load();
        },
        error: (e) => (this.error = mensaje(e)),
      });
    } else {
      let q = this.route.snapshot.queryParamMap;
      this.model = {
        habitacionId: Number(q.get("habitacion")),
        entrada: q.get("entrada") || "",
        salida: q.get("salida") || "",
        huespedes: Number(q.get("huespedes")) || 1,
      };
      this.load();
    }
  }
  load() {
    this.api
      .get<Habitacion>("/habitaciones/" + this.model.habitacionId)
      .subscribe({
        next: (r) => (this.room = r),
        error: (e) => (this.error = mensaje(e)),
      });
  }
  get noches() {
    return (
      Math.max(
        0,
        Math.round(
          (Date.parse(this.model.salida) - Date.parse(this.model.entrada)) /
            86400000,
        ),
      ) || 0
    );
  }
  save() {
    if (!this.noches) {
      this.error = "La salida debe ser posterior a la entrada.";
      return;
    }
    this.busy = true;
    this.error = "";
    const op = this.id
      ? this.api.put("/reservas/" + this.id, this.model)
      : this.api.post("/reservas", this.model);
    op.subscribe({
      next: () =>
        this.router.navigate(["/reservas"], { queryParams: { guardada: 1 } }),
      error: (e) => {
        this.error = mensaje(e);
        this.busy = false;
      },
    });
  }
}
