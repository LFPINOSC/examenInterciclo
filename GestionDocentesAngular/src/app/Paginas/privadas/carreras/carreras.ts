import { Component, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CarreraServicio } from "../../../Servicios/carrera-servicio";
import { Carrera } from "../../../../Modelos/modelos";
import { mensajeError } from "../../../Servicios/error-util";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./carreras.html",
})
export class Carreras {
  lista = signal<Carrera[]>([]);
  error = signal("");
  exito = signal("");
  edit: number | null = null;

  form = this.fb.nonNullable.group({
    codigo: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(15),
        Validators.pattern(/^[A-Za-z0-9-]+$/),
      ],
    ],
    nombre: [
      "",
      [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    ],
    descripcion: [
      "",
      [Validators.required, Validators.minLength(5), Validators.maxLength(250)],
    ],
    activa: [true],
  });

  constructor(
    private fb: FormBuilder,
    private s: CarreraServicio,
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
            ? "Carrera actualizada correctamente."
            : "Carrera creada correctamente.",
        );
        this.cancelar(false);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  editar(x: Carrera) {
    this.edit = x.id;
    this.form.patchValue(x as any);
    this.error.set("");
    this.exito.set("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  eliminar(x: Carrera) {
    if (confirm(`¿Eliminar la carrera ${x.nombre}?`))
      this.s.eliminar(x.id).subscribe({
        next: () => {
          this.exito.set("Carrera eliminada correctamente.");
          this.cargar();
        },
        error: (e) => this.error.set(mensajeError(e)),
      });
  }
  cancelar(limpiarMensajes = true) {
    this.edit = null;
    this.form.reset({ codigo: "", nombre: "", descripcion: "", activa: true });
    if (limpiarMensajes) {
      this.error.set("");
      this.exito.set("");
    }
  }
}
