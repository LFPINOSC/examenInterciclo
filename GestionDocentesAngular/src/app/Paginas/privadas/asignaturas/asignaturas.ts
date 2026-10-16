import { Component, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AsignaturaServicio } from "../../../Servicios/asignatura-servicio";
import { Asignatura } from "../../../../Modelos/modelos";
import { mensajeError } from "../../../Servicios/error-util";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./asignaturas.html",
})
export class Asignaturas {
  lista = signal<Asignatura[]>([]);
  error = signal("");
  exito = signal("");
  edit: number | null = null;

  form = this.fb.nonNullable.group({
    codigo: [
      "",
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
        Validators.pattern(/^[A-Za-z0-9-]+$/),
      ],
    ],
    nombre: [
      "",
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    creditos: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    horasSemanales: [
      1,
      [Validators.required, Validators.min(1), Validators.max(40)],
    ],
    activa: [true],
  });

  constructor(
    private fb: FormBuilder,
    private s: AsignaturaServicio,
  ) {
    this.cargar();
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
      this.error.set("Revise los campos marcados antes de guardar.");
      return;
    }
    const datos = this.form.getRawValue();
    datos.codigo = datos.codigo.trim().toUpperCase();
    const q = this.edit
      ? this.s.actualizar(this.edit, datos)
      : this.s.crear(datos);
    q.subscribe({
      next: () => {
        this.exito.set(
          this.edit
            ? "Asignatura actualizada correctamente."
            : "Asignatura creada correctamente.",
        );
        this.cancelar(false);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  editar(x: Asignatura) {
    this.edit = x.id;
    this.form.patchValue(x as any);
    this.error.set("");
    this.exito.set("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  eliminar(x: Asignatura) {
    if (confirm(`¿Eliminar la asignatura ${x.nombre}?`)) {
      this.s.eliminar(x.id).subscribe({
        next: () => {
          this.exito.set("Asignatura eliminada correctamente.");
          this.cargar();
        },
        error: (e) => this.error.set(mensajeError(e)),
      });
    }
  }

  cancelar(limpiarMensajes = true) {
    this.edit = null;
    this.form.reset({
      codigo: "",
      nombre: "",
      creditos: 1,
      horasSemanales: 1,
      activa: true,
    });
    if (limpiarMensajes) {
      this.error.set("");
      this.exito.set("");
    }
  }
}
