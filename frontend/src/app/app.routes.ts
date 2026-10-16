import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, rolGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './pages/login.component';
import { DashboardComponent } from './pages/dashboard.component';
import { PacientesComponent } from './pages/pacientes.component';
import { HabitacionesComponent } from './pages/habitaciones.component';
import { HospitalizacionesComponent } from './pages/hospitalizaciones.component';

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
      { path: 'habitaciones', component: HabitacionesComponent, canActivate: [rolGuard(['ADMIN', 'RECEPCION'])] },
      { path: 'hospitalizaciones', component: HospitalizacionesComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
