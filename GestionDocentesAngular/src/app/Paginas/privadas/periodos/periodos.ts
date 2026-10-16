import { Component, signal } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { PeriodoServicio } from "../../../Servicios/periodo-servicio";
import { Periodo } from "../../../../Modelos/modelos";
import { mensajeError } from "../../../Servicios/error-util";

function fechasValidas(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get("fechaInicio")?.value;
  const fin = control.get("fechaFin")?.value;
  if (!inicio || !fin) return null;
  return fin < inicio ? { rangoFechas: true } : null;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./periodos.html",
})
export class Periodos {
  lista = signal<Periodo[]>([]);
  error = signal("");
  exito = signal("");
  edit: number | null = null;

  form = this.fb.nonNullable.group(
    {
      nombre: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      fechaInicio: ["", [Validators.required]],
      fechaFin: ["", [Validators.required]],
      estado: ["PLANIFICADO", [Validators.required]],
    },
    { validators: fechasValidas },
  );

  constructor(
    private fb: FormBuilder,
    private s: PeriodoServicio,
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
      this.error.set(
        "Revise las fechas y los campos marcados antes de guardar.",
      );
      return;
    }
    const q = this.edit
      ? this.s.actualizar(this.edit, this.form.getRawValue())
      : this.s.crear(this.form.getRawValue());
    q.subscribe({
      next: () => {
        this.exito.set(
          this.edit
            ? "Período actualizado correctamente."
            : "Período creado correctamente.",
        );
        this.cancelar(false);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  editar(x: Periodo) {
    this.edit = x.id;
    this.form.patchValue(x as any);
    this.error.set("");
    this.exito.set("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  eliminar(x: Periodo) {
    if (confirm(`¿Eliminar el período ${x.nombre}?`))
      this.s.eliminar(x.id).subscribe({
        next: () => {
          this.exito.set("Período eliminado correctamente.");
          this.cargar();
        },
        error: (e) => this.error.set(mensajeError(e)),
      });
  }
  cancelar(limpiarMensajes = true) {
    this.edit = null;
    this.form.reset({
      nombre: "",
      fechaInicio: "",
      fechaFin: "",
      estado: "PLANIFICADO",
    });
    if (limpiarMensajes) {
      this.error.set("");
      this.exito.set("");
    }
  }
}
