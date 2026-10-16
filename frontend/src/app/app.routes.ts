import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BooksComponent } from './pages/books/books.component';
import { AuthorsComponent } from './pages/authors/authors.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { LoansComponent } from './pages/loans/loans.component';
import { UsersComponent } from './pages/users/users.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'libros', component: BooksComponent, canActivate: [authGuard] },
  { path: 'autores', component: AuthorsComponent, canActivate: [authGuard] },
  { path: 'categorias', component: CategoriesComponent, canActivate: [authGuard] },
  { path: 'prestamos', component: LoansComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: UsersComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
