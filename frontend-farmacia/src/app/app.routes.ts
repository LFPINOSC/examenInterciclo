import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { PharmacistDashboardComponent } from './components/pharmacist-dashboard/pharmacist-dashboard';
import { CashierDashboardComponent } from './components/cashier-dashboard/cashier-dashboard';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'pharmacist-dashboard', component: PharmacistDashboardComponent },
  { path: 'cashier-dashboard', component: CashierDashboardComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];