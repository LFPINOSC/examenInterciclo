import { Component, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { SessionService } from "./core/session.service";
import { ApiService, mensaje } from "./core/api.service";
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  s = inject(SessionService);
  api = inject(ApiService);
  router = inject(Router);
  error = "";
  logout() {
    this.api.post("/auth/logout", {}).subscribe({
      next: () => {
        this.s.clear();
        this.error = "";
        this.router.navigate(["/login"]);
      },
      error: (e) => (this.error = mensaje(e)),
    });
  }
}
