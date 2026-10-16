import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DocenteServicio } from "../../../Servicios/docente-servicio";
import { AsignaturaServicio } from "../../../Servicios/asignatura-servicio";
import { CarreraServicio } from "../../../Servicios/carrera-servicio";
import { AsignacionServicio } from "../../../Servicios/asignacion-servicio";
@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./dashboard.html",
})
export class Dashboard {
  docentes = signal(0);
  asignaturas = signal(0);
  carreras = signal(0);
  asignaciones = signal(0);
  constructor(
    d: DocenteServicio,
    a: AsignaturaServicio,
    c: CarreraServicio,
    x: AsignacionServicio,
  ) {
    d.listar().subscribe((v) => this.docentes.set(v.length));
    a.listar().subscribe((v) => this.asignaturas.set(v.length));
    c.listar().subscribe((v) => this.carreras.set(v.length));
    x.listar().subscribe((v) => this.asignaciones.set(v.length));
  }
}
