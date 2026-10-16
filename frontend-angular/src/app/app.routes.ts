import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Pacientes } from './pacientes/pacientes';
import { Examenes } from './examenes/examenes';
import { Ordenes } from './ordenes/ordenes';
import { MedicoPanel } from './medico-panel/medico-panel';
import { PacientePortal } from './paciente-portal/paciente-portal';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'pacientes', component: Pacientes },
  { path: 'examenes', component: Examenes },
  { path: 'ordenes', component: Ordenes },
  { path: 'medico-panel', component: MedicoPanel },
  { path: 'paciente-portal', component: PacientePortal },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' } // El comodín SIEMPRE va al final
];