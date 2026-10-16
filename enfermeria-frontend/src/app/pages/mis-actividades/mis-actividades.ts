
import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

import {
  Actividades,
  Actividad
} from '../../core/services/actividades';

import {
  Registros,
  RegistroActividadRequest
} from '../../core/services/registros';

@Component({
  selector: 'app-mis-actividades',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './mis-actividades.html',
  styleUrl: './mis-actividades.css'
})
export class MisActividadesPage implements OnInit {

  private actividadesServicio = inject(Actividades);
  private registrosServicio = inject(Registros);
  private route = inject(ActivatedRoute);

  actividades = signal<Actividad[]>([]);
  actividadSeleccionada = signal<Actividad | null>(null);

  cargando = signal(false);
  guardando = signal(false);

  error = signal('');
  mensaje = signal('');

  formulario: RegistroActividadRequest = {
    resultado: '',
    observaciones: ''
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.actividadesServicio.misActividades().subscribe({

      next: (datos: Actividad[]) => {

        console.log('ACTIVIDADES RECIBIDAS:', datos);
        console.log('CANTIDAD DE ACTIVIDADES:', datos.length);

        this.actividades.set(datos);
        this.cargando.set(false);

        const seleccionada = this.actividadSeleccionada();

        if (seleccionada) {
          const actual = datos.find(
            a => a.id === seleccionada.id
          );

          if (!actual || actual.estado !== 'PENDIENTE') {
            this.cerrarFormulario();
          } else {
            this.actividadSeleccionada.set(actual);
          }
        }

        // Abre el registro de la primera actividad pendiente
        // cuando se llega desde "Registrar Atención".
        if (this.route.snapshot.fragment === 'registrar') {

          const primera = datos.find(
            a => a.estado === 'PENDIENTE'
          );

          if (primera && !this.actividadSeleccionada()) {
            this.seleccionar(primera);
          }
        }
      },

      error: err => {

        console.error('ERROR AL CARGAR ACTIVIDADES:', err);

        this.error.set(
          err.error?.message ||
          'No se pudieron cargar tus actividades.'
        );

        this.cargando.set(false);
      }
    });
  }

  seleccionar(actividad: Actividad): void {

    if (actividad.estado !== 'PENDIENTE') {
      this.error.set('Esta actividad no está pendiente.');
      return;
    }

    this.actividadSeleccionada.set(actividad);

    this.formulario = {
      resultado: '',
      observaciones: ''
    };

    this.error.set('');
    this.mensaje.set('');
  }

  registrar(): void {

    const actividad = this.actividadSeleccionada();

    if (!actividad || this.guardando()) {
      return;
    }

    if (!this.formulario.resultado.trim()) {
      this.error.set('Escribe el resultado de la atención.');
      return;
    }

    if (!confirm('¿Confirmas que realizaste esta atención?')) {
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');

    const datos: RegistroActividadRequest = {
      resultado: this.formulario.resultado.trim(),
      observaciones: this.formulario.observaciones.trim()
    };

    this.registrosServicio.registrar(
      actividad.id,
      datos
    ).subscribe({

      next: () => {

        console.log('ATENCIÓN REGISTRADA CORRECTAMENTE');

        this.cerrarFormulario();

        this.mensaje.set(
          'Atención registrada correctamente.'
        );

        this.guardando.set(false);
        this.cargar();
      },

      error: err => {

        console.error('ERROR AL REGISTRAR ATENCIÓN:', err);

        this.error.set(
          err.error?.message ||
          'No se pudo registrar la atención.'
        );

        this.guardando.set(false);
      }
    });
  }

  cerrarFormulario(): void {

    this.actividadSeleccionada.set(null);

    this.formulario = {
      resultado: '',
      observaciones: ''
    };
  }

  fecha(valor: string): string {

    if (!valor) {
      return '—';
    }

    return valor.replace('T', ' ').slice(0, 16);
  }

  nombreTipo(tipo: string): string {

    if (!tipo) {
      return '—';
    }

    return tipo.replaceAll('_', ' ');
  }
}
