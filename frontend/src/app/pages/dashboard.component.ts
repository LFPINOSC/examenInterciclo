import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { ESTADO_HABITACION, ESTADO_HOSPITALIZACION, TIPO_HABITACION, formatoFecha, mensajeError } from '../core/etiquetas';
import { CamaPanel, Panel } from '../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (error()) { <p class="banner error">{{ error() }}</p> }
    @if (cargando()) { <p class="muted">Cargando…</p> }

    @if (panel(); as datos) {
      @if (datos.tipo === 'admin') {
        <header class="page-head">
          <div>
            <p class="eyebrow">Hoy</p>
            <h1>Panel de hospitalización</h1>
          </div>
          <a class="btn primary" routerLink="/hospitalizaciones">Registrar ingreso</a>
        </header>
        <section class="stats">
          <article>
            <span>Activas</span>
            <strong>{{ datos.resumen.activas }}</strong>
            <small>hospitalizaciones abiertas</small>
          </article>
          <article>
            <span>Disponibles</span>
            <strong>{{ datos.resumen.disponibles }}</strong>
            <small>de {{ datos.resumen.habitaciones }} camas</small>
          </article>
          <article>
            <span>Ocupadas</span>
            <strong>{{ datos.resumen.ocupadas }}</strong>
            <small>camas en uso</small>
          </article>
          <article>
            <span>Pacientes</span>
            <strong>{{ datos.resumen.pacientes }}</strong>
            <small>en el archivo</small>
          </article>
        </section>
        <section class="split">
          <div class="card">
            <div class="card-head"><h2>Habitaciones</h2></div>
            @for (piso of pisos(datos.habitaciones); track piso.numero) {
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
              @for (item of datos.recientes; track item.id) {
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

      @if (datos.tipo === 'recepcion') {
        <header class="page-head">
          <div>
            <p class="eyebrow">Recepción</p>
            <h1>Camas libres</h1>
          </div>
          <a class="btn primary" routerLink="/hospitalizaciones">Registrar ingreso</a>
        </header>
        <div class="rooms">
          @for (cama of datos.libres; track cama.id) {
            <article class="room disponible">
              <header>
                <strong>{{ cama.numero }}</strong>
                <span>{{ tipo(cama.tipo) }}</span>
              </header>
              <p>Piso {{ cama.piso }}</p>
            </article>
          } @empty {
            <p>No hay camas libres.</p>
          }
        </div>
        <div class="card separado">
          <div class="card-head"><h2>Hospitalizados</h2></div>
          <ul class="feed">
            @for (item of datos.activas; track item.id) {
              <li>
                <div>
                  <strong>{{ item.pacienteNombre }}</strong>
                  <p>{{ item.diagnosticoIngreso }}</p>
                  <small>Hab. {{ item.habitacionNumero }} · {{ item.medicoNombre }}</small>
                </div>
              </li>
            } @empty {
              <li>No hay pacientes hospitalizados.</li>
            }
          </ul>
        </div>
      }

      @if (datos.tipo === 'medico') {
        <header class="page-head">
          <div>
            <p class="eyebrow">Médico</p>
            <h1>Mis pacientes</h1>
          </div>
          <a class="btn primary" routerLink="/hospitalizaciones">Ver hospitalizaciones</a>
        </header>
        <div class="patient-grid">
          @for (item of datos.activas; track item.id) {
            <article class="patient-card">
              <strong>{{ item.pacienteNombre }}</strong>
              <p>{{ item.diagnosticoIngreso }}</p>
              <small>Hab. {{ item.habitacionNumero }} · {{ fecha(item.fechaIngreso) }}</small>
            </article>
          } @empty {
            <p class="muted">No tiene pacientes hospitalizados.</p>
          }
        </div>
      }
    }
  `,
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly panel = signal<Panel | null>(null);
  readonly fecha = formatoFecha;
  readonly tipo = (valor: string) => TIPO_HABITACION[valor] ?? valor;
  readonly estadoHab = (valor: string) => ESTADO_HABITACION[valor] ?? valor;
  readonly estadoHosp = (valor: string) => ESTADO_HOSPITALIZACION[valor] ?? valor;

  constructor() {
    this.api.dashboard().subscribe({
      next: (datos) => {
        this.panel.set(datos);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeError(error, 'No se pudo cargar el panel'));
        this.cargando.set(false);
      },
    });
  }

  pisos(habitaciones: CamaPanel[]) {
    const grupos = new Map<number, CamaPanel[]>();
    for (const cama of habitaciones) {
      const lista = grupos.get(cama.piso) ?? [];
      lista.push(cama);
      grupos.set(cama.piso, lista);
    }
    return [...grupos.entries()].map(([numero, camas]) => ({ numero, camas }));
  }
}
