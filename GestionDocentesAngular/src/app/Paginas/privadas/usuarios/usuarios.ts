import { Component, OnInit, signal } from "@angular/core";
import { Usuario } from "../../../../Modelos/modelos";
import { UsuarioServicio } from "../../../Servicios/usuario-servicio";
import { mensajeError } from "../../../Servicios/error-util";
@Component({ standalone: true, templateUrl: "./usuarios.html" })
export class Usuarios implements OnInit {
  lista = signal<Usuario[]>([]);
  error = signal("");
  msg = signal("");
  constructor(private s: UsuarioServicio) {}
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.s.listar().subscribe({
      next: (x) => this.lista.set(x),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
  aprobar(x: Usuario) {
    if (!confirm(`¿Aprobar la cuenta de ${x.nombre}?`)) return;
    this.s.aprobar(x.id).subscribe({
      next: () => {
        this.msg.set("Cuenta aprobada. El usuario ya puede iniciar sesión.");
        this.error.set("");
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
  bloquear(x: Usuario) {
    if (x.rol === "ADMIN") return;
    if (!confirm(`¿Bloquear la cuenta de ${x.nombre}?`)) return;
    this.s.bloquear(x.id).subscribe({
      next: () => {
        this.msg.set("Cuenta bloqueada");
        this.error.set("");
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
  activar(x: Usuario) {
    this.s.activar(x.id).subscribe({
      next: () => {
        this.msg.set("Cuenta reactivada");
        this.error.set("");
        this.cargar();
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
