import { Component } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { AuthServicio } from "../../../Servicios/auth-servicio";
@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./layout.html",
})
export class Layout {
  constructor(
    public auth: AuthServicio,
    private r: Router,
  ) {}
  salir() {
    this.auth.salir();
    this.r.navigate(["/login"]);
  }
}
