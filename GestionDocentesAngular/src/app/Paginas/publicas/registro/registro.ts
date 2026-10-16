import { Component, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthServicio } from "../../../Servicios/auth-servicio";
import { mensajeError } from "../../../Servicios/error-util";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./registro.html",
})
export class Registro {
  error = signal("");

  form = this.fb.nonNullable.group({
    nombre: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]+$/),
      ],
    ],
    cedula: ["", [Validators.required, Validators.pattern(/^\d{10}$/)]],
    telefono: ["", [Validators.required, Validators.pattern(/^09\d{8}$/)]],
    correo: ["", [Validators.required, Validators.email]],
    password: [
      "",
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        ),
      ],
    ],
  });

  constructor(
    private fb: FormBuilder,
    private a: AuthServicio,
    private r: Router,
  ) {}

  digitos(ev: Event, c: "cedula" | "telefono") {
    const i = ev.target as HTMLInputElement;
    const v = i.value.replace(/\D/g, "").slice(0, 10);
    i.value = v;
    this.form.controls[c].setValue(v);
  }

  registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set("Revise los datos del formulario");
      return;
    }

    this.a.registro(this.form.getRawValue()).subscribe({
      next: () =>
        this.r.navigate(["/verificar"], {
          queryParams: { correo: this.form.controls.correo.value },
        }),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
