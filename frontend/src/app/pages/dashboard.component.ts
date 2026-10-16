import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { ESTADO_HABITACION, ESTADO_HOSPITALIZACION, TIPO_HABITACION, formatoFecha, mensajeError } from '../core/etiquetas';
import { Dashboard } from '../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="page-head">
      <div>
        <p class="eyebrow">Censo del día</p>
        <h1>Panel de hospitalización</h1>
      </div>
      <a class="btn primary" routerLink="/hospitalizaciones">Registrar ingreso</a>
    </header>

    @if (error()) { <p class="banner error">{{ error() }}</p> }
    @if (cargando()) { <p class="muted">Cargando censo…</p> }

    @if (datos(); as panel) {
      <section class="stats">
        <article>
          <span>Activas</span>
          <strong>{{ panel.resumen.activas }}</strong>
          <small>estancias abiertas</small>
        </article>
        <article>
          <span>Disponibles</span>
          <strong>{{ panel.resumen.disponibles }}</strong>
          <small>de {{ panel.resumen.habitaciones }} camas</small>
        </article>
        <article>
          <span>Ocupadas</span>
          <strong>{{ panel.resumen.ocupadas }}</strong>
          <small>{{ ocupacion() }}% del censo</small>
        </article>
        <article>
          <span>Pacientes</span>
          <strong>{{ panel.resumen.pacientes }}</strong>
          <small>{{ panel.resumen.altas }} altas históricas</small>
        </article>
      </section>

      <section class="split">
        <div class="card">
          <div class="card-head">
            <h2>Mapa de camas</h2>
          </div>
          @for (piso of pisos(); track piso.numero) {
            <h3 class="floor">Piso {{ piso.numero }}</h3>
            <div class="rooms">
              @for (cama of piso.camas; track cama.id) {
                <article class="room {{ cama.estado.toLowerCase() }}">
                  <header>
                    <strong>{{ cama.numero }}</strong>
                    <span>{{ tipo(cama.tipo) }}</span>
                  </header>
                  <p>{{ estadoHab(cama.estado) }}</p>
                  <small>{{ cama.pacienteNombre || 'Sin paciente' }}</small>
                </article>
              }
            </div>
          }
        </div>

        <div class="card">
          <div class="card-head">
            <h2>Últimos movimientos</h2>
            <a routerLink="/hospitalizaciones">Ver todas</a>
          </div>
          <ul class="feed">
            @for (item of panel.recientes; track item.id) {
              <li>
                <div>
                  <strong>{{ item.codigo }} · {{ item.pacienteNombre }}</strong>
                  <p>{{ item.diagnosticoIngreso }}</p>
                  <small>Hab. {{ item.habitacionNumero }} · {{ item.medicoNombre }} · {{ fecha(item.fechaIngreso) }}</small>
                </div>
                <span class="badge {{ item.estado.toLowerCase() }}">{{ estadoHosp(item.estado) }}</span>
              </li>
            }
          </ul>
        </div>
      </section>
    }
  `,
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly datos = signal<Dashboard | null>(null);
  readonly fecha = formatoFecha;
  readonly tipo = (valor: string) => TIPO_HABITACION[valor] ?? valor;
  readonly estadoHab = (valor: string) => ESTADO_HABITACION[valor] ?? valor;
  readonly estadoHosp = (valor: string) => ESTADO_HOSPITALIZACION[valor] ?? valor;

  readonly ocupacion = computed(() => {
    const total = this.datos()?.resumen.habitaciones ?? 0;
    if (!total) return 0;
    return Math.round(((this.datos()?.resumen.ocupadas ?? 0) / total) * 100);
  });

  readonly pisos = computed(() => {
    const grupos = new Map<number, Dashboard['habitaciones']>();
    for (const cama of this.datos()?.habitaciones ?? []) {
      const lista = grupos.get(cama.piso) ?? [];
      lista.push(cama);
      grupos.set(cama.piso, lista);
    }
    return [...grupos.entries()].map(([numero, camas]) => ({ numero, camas }));
  });

  constructor() {
    this.api.dashboard().subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeError(error, 'No se pudo cargar el panel'));
        this.cargando.set(false);
      },
    });
  }
}
