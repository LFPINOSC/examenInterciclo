import { Component, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AuthServicio } from "../../../Servicios/auth-servicio";
import { mensajeError } from "../../../Servicios/error-util";
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./verificar.html",
})
export class Verificar {
  msg = signal("");
  error = signal("");
  form = this.fb.nonNullable.group({
    correo: ["", [Validators.required, Validators.email]],
    codigo: ["", [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });
  constructor(
    private fb: FormBuilder,
    private a: AuthServicio,
    private ar: ActivatedRoute,
  ) {
    this.form.controls.correo.setValue(
      this.ar.snapshot.queryParamMap.get("correo") || "",
    );
  }
  verificar() {
    this.error.set("");
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.a.verificar(this.form.getRawValue()).subscribe({
      next: (x) => this.msg.set(x),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
  reenviar() {
    const c = this.form.controls.correo.value;
    if (!c) return;
    this.a.reenviar(c).subscribe({
      next: (x) => this.msg.set(x),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
