import { Component, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DocenteServicio } from "../../../Servicios/docente-servicio";
import { Docente } from "../../../../Modelos/modelos";
import { mensajeError } from "../../../Servicios/error-util";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./docentes.html",
})
export class Docentes {
  lista = signal<Docente[]>([]);
  error = signal("");
  exito = signal("");
  edit: number | null = null;

  form = this.fb.nonNullable.group({
    cedula: ["", [Validators.required, Validators.pattern(/^\d{10}$/)]],
    nombres: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]+$/),
      ],
    ],
    apellidos: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]+$/),
      ],
    ],
    correoInstitucional: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(120)],
    ],
    telefono: ["", [Validators.required, Validators.pattern(/^09\d{8}$/)]],
    titulo: [
      "",
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    fechaIngreso: ["", [Validators.required]],
    estado: ["ACTIVO", [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private s: DocenteServicio,
  ) {
    this.cargar();
  }

  get hoy(): string {
    return new Date().toISOString().split("T")[0];
  }

  soloDigitos(ev: Event, campo: "cedula" | "telefono") {
    const input = ev.target as HTMLInputElement;
    const valor = input.value.replace(/\D/g, "").slice(0, 10);
    input.value = valor;
    this.form.controls[campo].setValue(valor);
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

    if (this.form.controls.fechaIngreso.value > this.hoy) {
      this.form.controls.fechaIngreso.setErrors({ futura: true });
      this.form.controls.fechaIngreso.markAsTouched();
      this.error.set("La fecha de ingreso no puede estar en el futuro.");
      return;
    }

    const q = this.edit
      ? this.s.actualizar(this.edit, this.form.getRawValue())
      : this.s.crear(this.form.getRawValue());

    q.subscribe({
      next: () => {
        this.exito.set(
          this.edit
            ? "Docente actualizado correctamente."
            : "Docente registrado correctamente.",
        );
        this.cancelar(false);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  editar(x: Docente) {
    this.edit = x.id;
    this.form.patchValue(x as any);
    this.error.set("");
    this.exito.set("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  eliminar(x: Docente) {
    if (confirm(`¿Eliminar al docente ${x.nombres} ${x.apellidos}?`)) {
      this.s.eliminar(x.id).subscribe({
        next: () => {
          this.exito.set("Docente eliminado correctamente.");
          this.cargar();
        },
        error: (e) => this.error.set(mensajeError(e)),
      });
    }
  }

  cancelar(limpiarMensajes = true) {
    this.edit = null;
    this.form.reset({
      cedula: "",
      nombres: "",
      apellidos: "",
      correoInstitucional: "",
      telefono: "",
      titulo: "",
      fechaIngreso: "",
      estado: "ACTIVO",
    });
    if (limpiarMensajes) {
      this.error.set("");
      this.exito.set("");
    }
  }
}
