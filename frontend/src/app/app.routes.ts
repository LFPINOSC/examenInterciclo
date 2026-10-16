import { Routes } from "@angular/router";
import { authGuard, adminGuard } from "./core/guards";
import { AuthComponent } from "./features/auth.component";
import { RoomsComponent } from "./features/rooms.component";
import { CatalogComponent } from "./features/catalog.component";
import { BookingsComponent } from "./features/bookings.component";
import { BookingFormComponent } from "./features/booking-form.component";
import { UsersComponent } from "./features/users.component";
export const routes: Routes = [
  { path: "", redirectTo: "habitaciones", pathMatch: "full" },
  { path: "login", component: AuthComponent },
  { path: "registro", component: AuthComponent, data: { registro: true } },
  { path: "habitaciones", component: RoomsComponent, canActivate: [authGuard] },
  { path: "reservas", component: BookingsComponent, canActivate: [authGuard] },
  {
    path: "reservas/nueva",
    component: BookingFormComponent,
    canActivate: [authGuard],
  },
  {
    path: "reservas/:id/editar",
    component: BookingFormComponent,
    canActivate: [authGuard],
  },
  {
    path: "hoteles",
    component: CatalogComponent,
    data: { hotel: true },
    canActivate: [adminGuard],
  },
  {
    path: "tipos",
    component: CatalogComponent,
    data: { hotel: false },
    canActivate: [adminGuard],
  },
  { path: "usuarios", component: UsersComponent, canActivate: [adminGuard] },
  { path: "**", redirectTo: "habitaciones" },
];
