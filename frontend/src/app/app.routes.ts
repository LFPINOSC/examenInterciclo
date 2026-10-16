import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, rolGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './pages/login.component';
import { DashboardComponent } from './pages/dashboard.component';
import { PacientesComponent } from './pages/pacientes.component';
import { MedicosComponent } from './pages/medicos.component';
import { HabitacionesComponent } from './pages/habitaciones.component';
import { HospitalizacionesComponent } from './pages/hospitalizaciones.component';
import { UsuariosComponent } from './pages/usuarios.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [invitadoGuard] },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pacientes', component: PacientesComponent },
      { path: 'medicos', component: MedicosComponent },
      { path: 'habitaciones', component: HabitacionesComponent },
      { path: 'hospitalizaciones', component: HospitalizacionesComponent },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [rolGuard(['ADMIN'])] },
    ],
  },
  { path: '**', redirectTo: '' },
];
