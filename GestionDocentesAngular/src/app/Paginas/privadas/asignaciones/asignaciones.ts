import { Component, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AsignacionServicio } from "../../../Servicios/asignacion-servicio";
import { DocenteServicio } from "../../../Servicios/docente-servicio";
import { AsignaturaServicio } from "../../../Servicios/asignatura-servicio";
import { CarreraServicio } from "../../../Servicios/carrera-servicio";
import { PeriodoServicio } from "../../../Servicios/periodo-servicio";
import {
  Asignacion,
  Docente,
  Asignatura,
  Carrera,
  Periodo,
} from "../../../../Modelos/modelos";
import { mensajeError } from "../../../Servicios/error-util";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./asignaciones.html",
})
export class Asignaciones {
  lista = signal<Asignacion[]>([]);
  docentes = signal<Docente[]>([]);
  asignaturas = signal<Asignatura[]>([]);
  carreras = signal<Carrera[]>([]);
  periodos = signal<Periodo[]>([]);
  error = signal("");
  exito = signal("");
  edit: number | null = null;

  form = this.fb.nonNullable.group({
    docenteId: [0, [Validators.required, Validators.min(1)]],
    asignaturaId: [0, [Validators.required, Validators.min(1)]],
    carreraId: [0, [Validators.required, Validators.min(1)]],
    periodoId: [0, [Validators.required, Validators.min(1)]],
    paralelo: [
      "A",
      [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z0-9-]+$/),
      ],
    ],
    horasAsignadas: [
      1,
      [Validators.required, Validators.min(1), Validators.max(40)],
    ],
  });

  constructor(
    private fb: FormBuilder,
    private s: AsignacionServicio,
    d: DocenteServicio,
    a: AsignaturaServicio,
    c: CarreraServicio,
    p: PeriodoServicio,
  ) {
    this.cargar();
    d.listar().subscribe((x) =>
      this.docentes.set(x.filter((v) => v.estado === "ACTIVO")),
    );
    a.listar().subscribe((x) =>
      this.asignaturas.set(x.filter((v) => v.activa)),
    );
    c.listar().subscribe((x) => this.carreras.set(x.filter((v) => v.activa)));
    p.listar().subscribe((x) => this.periodos.set(x));
  }

  cargar() {
    this.s.listar().subscribe({
      next: (x) => this.lista.set(x),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  guardar() {
    this.error.set("");
    this.exito.set("");
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(
        "Seleccione todos los datos y revise los campos marcados.",
      );
      return;
    }
    const datos = this.form.getRawValue();
    datos.paralelo = datos.paralelo.trim().toUpperCase();
    const q = this.edit
      ? this.s.actualizar(this.edit, datos)
      : this.s.crear(datos);
    q.subscribe({
      next: () => {
        this.exito.set(
          this.edit
            ? "Asignación actualizada correctamente."
            : "Asignación creada correctamente.",
        );
        this.cancelar(false);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  editar(x: Asignacion) {
    this.edit = x.id;
    this.form.patchValue(x);
    this.error.set("");
    this.exito.set("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  eliminar(x: Asignacion) {
    if (confirm("¿Eliminar esta asignación docente?"))
      this.s.eliminar(x.id).subscribe({
        next: () => {
          this.exito.set("Asignación eliminada correctamente.");
          this.cargar();
        },
        error: (e) => this.error.set(mensajeError(e)),
      });
  }
  cancelar(limpiarMensajes = true) {
    this.edit = null;
    this.form.reset({
      docenteId: 0,
      asignaturaId: 0,
      carreraId: 0,
      periodoId: 0,
      paralelo: "A",
      horasAsignadas: 1,
    });
    if (limpiarMensajes) {
      this.error.set("");
      this.exito.set("");
    }
  }
}
