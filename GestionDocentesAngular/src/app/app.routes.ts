import { Routes } from "@angular/router";
import { authGuard } from "./Auth/auth.guard";
import { inicioGuard } from "./Auth/inicio.guard";
import { adminGuard } from "./Auth/rol.guard";

export const routes: Routes = [
  {
    path: "login",
    canActivate: [inicioGuard],
    loadComponent: () =>
      import("./Paginas/publicas/login/login").then((m) => m.Login),
  },
  {
    path: "registro",
    canActivate: [inicioGuard],
    loadComponent: () =>
      import("./Paginas/publicas/registro/registro").then((m) => m.Registro),
  },
  {
    path: "verificar",
    canActivate: [inicioGuard],
    loadComponent: () =>
      import("./Paginas/publicas/verificar/verificar").then((m) => m.Verificar),
  },
  {
    path: "app",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./Paginas/privadas/layout/layout").then((m) => m.Layout),
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./Paginas/privadas/dashboard/dashboard").then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: "docentes",
        loadComponent: () =>
          import("./Paginas/privadas/docentes/docentes").then(
            (m) => m.Docentes,
          ),
      },
      {
        path: "asignaturas",
        loadComponent: () =>
          import("./Paginas/privadas/asignaturas/asignaturas").then(
            (m) => m.Asignaturas,
          ),
      },
      {
        path: "carreras",
        loadComponent: () =>
          import("./Paginas/privadas/carreras/carreras").then(
            (m) => m.Carreras,
          ),
      },
      {
        path: "periodos",
        loadComponent: () =>
          import("./Paginas/privadas/periodos/periodos").then(
            (m) => m.Periodos,
          ),
      },
      {
        path: "asignaciones",
        loadComponent: () =>
          import("./Paginas/privadas/asignaciones/asignaciones").then(
            (m) => m.Asignaciones,
          ),
      },
      {
        path: "usuarios",
        canActivate: [adminGuard],
        loadComponent: () =>
          import("./Paginas/privadas/usuarios/usuarios").then(
            (m) => m.Usuarios,
          ),
      },
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
    ],
  },
  { path: "", pathMatch: "full", redirectTo: "login" },
  { path: "**", redirectTo: "login" },
];
