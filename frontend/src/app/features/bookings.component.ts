import { Component, inject } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { ApiService, mensaje } from "../core/api.service";
import { SessionService } from "../core/session.service";
import { Reserva } from "../core/models";
@Component({
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: "./bookings.component.html",
})
export class BookingsComponent {
  api = inject(ApiService);
  s = inject(SessionService);
  route = inject(ActivatedRoute);
  rows: Reserva[] = [];
  error = "";
  success = this.route.snapshot.queryParamMap.has("guardada")
    ? "Reserva guardada correctamente."
    : "";
  constructor() {
    this.load();
  }
  load() {
    this.api
      .get<Reserva[]>("/reservas")
      .subscribe({
        next: (r) => (this.rows = r),
        error: (e) => (this.error = mensaje(e)),
      });
  }
  cancel(r: Reserva) {
    if (!confirm("¿Cancelar la reserva #" + r.id + "? Liberará esas fechas."))
      return;
    this.api.patch("/reservas/" + r.id + "/cancelar").subscribe({
      next: () => {
        this.error = "";
        this.success = "Reserva cancelada.";
        this.load();
      },
      error: (e) => (this.error = mensaje(e)),
    });
  }
  remove(r: Reserva) {
    if (
      !confirm("¿Eliminar definitivamente la reserva cancelada #" + r.id + "?")
    )
      return;
    this.api.delete("/reservas/" + r.id).subscribe({
      next: () => {
        this.error = "";
        this.success = "Reserva eliminada.";
        this.load();
      },
      error: (e) => (this.error = mensaje(e)),
    });
  }
}
