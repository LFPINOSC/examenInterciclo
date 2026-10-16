import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ApiService, mensaje } from "../core/api.service";
@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./catalog.component.html",
})
export class CatalogComponent {
  api = inject(ApiService);
  route = inject(ActivatedRoute);
  hotel = this.route.snapshot.data["hotel"] === true;
  path = this.hotel ? "/hoteles" : "/tipos";
  rows: any[] = [];
  id: number | null = null;
  model = { nombre: "", ciudad: "", direccion: "", descripcion: "" };
  error = "";
  success = "";
  busy = false;
  constructor() {
    this.load();
  }
  load() {
    this.api
      .get<any[]>(this.path)
      .subscribe({
        next: (r) => (this.rows = r),
        error: (e) => (this.error = mensaje(e)),
      });
  }
  reset() {
    this.id = null;
    this.model = { nombre: "", ciudad: "", direccion: "", descripcion: "" };
  }
  edit(r: any) {
    this.id = r.id;
    this.model = { ...r };
    this.error = "";
    this.success = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  save() {
    this.busy = true;
    this.error = "";
    const data = this.hotel
      ? this.model
      : { nombre: this.model.nombre, descripcion: this.model.descripcion };
    const op = this.id
      ? this.api.put(this.path + "/" + this.id, data)
      : this.api.post(this.path, data);
    op.subscribe({
      next: () => {
        this.success = "Registro guardado correctamente.";
        this.reset();
        this.load();
        this.busy = false;
      },
      error: (e) => {
        this.error = mensaje(e);
        this.busy = false;
      },
    });
  }
  remove(r: any) {
    if (!confirm("¿Eliminar " + r.nombre + "?")) return;
    this.api.delete(this.path + "/" + r.id).subscribe({
      next: () => {
        this.error = "";
        this.success = "Registro eliminado.";
        if (this.id === r.id) this.reset();
        this.load();
      },
      error: (e) => (this.error = mensaje(e)),
    });
  }
}
