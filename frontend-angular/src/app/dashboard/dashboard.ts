import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  nombreUsuario = 'Usuario';
  rolUsuario = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!token) {
      alert('Acceso no autorizado. Inicie sesión.');
      this.router.navigate(['/login']);
    } else if (usuarioData) {
      this.nombreUsuario = usuarioData.nombre || 'Usuario';
      this.rolUsuario = usuarioData.rol || '';
    }
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}