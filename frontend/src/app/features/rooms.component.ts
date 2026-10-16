import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CurrencyPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { forkJoin } from "rxjs";
import { ApiService, mensaje } from "../core/api.service";
import { SessionService } from "../core/session.service";
import { Habitacion, Hotel, Tipo } from "../core/models";
@Component({
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: "./rooms.component.html",
})
export class RoomsComponent {
  api = inject(ApiService);
  s = inject(SessionService);
  rows: Habitacion[] = [];
  hoteles: Hotel[] = [];
  tipos: Tipo[] = [];
  error = "";
  success = "";
  busy = false;
  show = false;
  id: number | null = null;
  entrada = "";
  salida = "";
  huespedes = 1;
  hoy =
    new Date().getFullYear() +
    "-" +
    String(new Date().getMonth() + 1).padStart(2, "0") +
    "-" +
    String(new Date().getDate()).padStart(2, "0");
  model = {
    hotelId: 0,
    tipoId: 0,
    numero: "",
    precioNoche: 50,
    capacidad: 2,
    activa: true,
  };
  constructor() {
    this.load();
    forkJoin({
      hoteles: this.api.get<Hotel[]>("/hoteles"),
      tipos: this.api.get<Tipo[]>("/tipos"),
    }).subscribe({
      next: (r) => {
        this.hoteles = r.hoteles;
        this.tipos = r.tipos;
      },
      error: (e) => (this.error = mensaje(e)),
    });
  }
  load() {
    this.error = "";
    let p = "/habitaciones";
    if (this.entrada || this.salida) {
      if (!this.entrada || !this.salida || this.salida <= this.entrada) {
        this.error =
          "Completa las fechas. La salida debe ser posterior a la entrada.";
        return;
      }
      p +=
        "?entrada=" +
        this.entrada +
        "&salida=" +
        this.salida +
        "&huespedes=" +
        this.huespedes;
    }
    this.api
      .get<Habitacion[]>(p)
      .subscribe({
        next: (r) => (this.rows = r),
        error: (e) => (this.error = mensaje(e)),
      });
  }
  clearFilters() {
    this.entrada = "";
    this.salida = "";
    this.huespedes = 1;
    this.load();
  }
  edit(r: Habitacion) {
    this.id = r.id;
    this.model = {
      hotelId: r.hotelId,
      tipoId: r.tipoId,
      numero: r.numero,
      precioNoche: r.precioNoche,
      capacidad: r.capacidad,
      activa: !!r.activa,
    };
    this.show = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  fresh() {
    this.id = null;
    this.model = {
      hotelId: 0,
      tipoId: 0,
      numero: "",
      precioNoche: 50,
      capacidad: 2,
      activa: true,
    };
    this.show = true;
  }
  save() {
    this.busy = true;
    this.error = "";
    let op = this.id
      ? this.api.put("/habitaciones/" + this.id, this.model)
      : this.api.post("/habitaciones", this.model);
    op.subscribe({
      next: () => {
        this.busy = false;
        this.show = false;
        this.success = "Habitación guardada.";
        this.load();
      },
      error: (e) => {
        this.error = mensaje(e);
        this.busy = false;
      },
    });
  }
  remove(r: Habitacion) {
    if (
      !confirm(
        "¿Eliminar habitación " +
          r.numero +
          "? Si tiene reservas no será posible.",
      )
    )
      return;
    this.api.delete("/habitaciones/" + r.id).subscribe({
      next: () => {
        this.success = "Habitación eliminada.";
        this.load();
      },
      error: (e) => (this.error = mensaje(e)),
    });
  }
}
