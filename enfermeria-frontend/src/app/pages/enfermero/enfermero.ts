
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-enfermero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './enfermero.html',
  styleUrl: './enfermero.css'
})
export class Enfermero {

  auth = inject(Auth);
  private router = inject(Router);

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
