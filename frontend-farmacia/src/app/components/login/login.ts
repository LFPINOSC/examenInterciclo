import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    const credentials = { username: this.username, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        // Guardamos el token en el almacenamiento local
        this.authService.saveToken(res.token);
        
        // Redirección inteligente basada en el rol recibido del backend
        if (res.rol === 'ROLE_ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/client-dashboard']);
        }
      },
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        console.error(err);
      }
    });
  }
}