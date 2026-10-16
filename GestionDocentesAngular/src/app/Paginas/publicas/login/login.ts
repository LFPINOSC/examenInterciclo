import { Component, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthServicio } from "../../../Servicios/auth-servicio";
import { mensajeError } from "../../../Servicios/error-util";
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./login.html",
})
export class Login {
  error = signal("");
  form = this.fb.nonNullable.group({
    correo: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });
  constructor(
    private fb: FormBuilder,
    private a: AuthServicio,
    private r: Router,
  ) {}
  entrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set("");
    this.a.login(this.form.getRawValue()).subscribe({
      next: () => this.r.navigate(["/app/dashboard"]),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
