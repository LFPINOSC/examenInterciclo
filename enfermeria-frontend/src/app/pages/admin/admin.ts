
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  auth = inject(Auth);
  private router = inject(Router);

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
