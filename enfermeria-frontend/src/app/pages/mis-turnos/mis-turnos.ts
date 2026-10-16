
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Turnos, Turno } from '../../core/services/turnos';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.css'
})
export class MisTurnosPage implements OnInit {

  private servicio = inject(Turnos);

  turnos = signal<Turno[]>([]);
  cargando = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.servicio.misTurnos().subscribe({
      next: (datos: Turno[]) => {
        console.log('TURNOS RECIBIDOS:', datos);

        this.turnos.set(datos);
        this.cargando.set(false);
      },

      error: err => {
        console.error('ERROR AL CARGAR TURNOS:', err);

        this.error.set(
          err.error?.message ||
          'No se pudieron consultar tus turnos.'
        );

        this.cargando.set(false);
      }
    });
  }

  fecha(valor: string): string {
    return valor
      ? valor.replace('T', ' ').slice(0, 16)
      : '—';
  }
}
