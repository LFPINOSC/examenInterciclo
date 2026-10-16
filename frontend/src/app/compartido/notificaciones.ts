import { Component, inject } from '@angular/core';
import { NotificacionService } from '../core/notificacion.service';

/** Contenedor de los toasts; se coloca una sola vez en App. */
@Component({
  selector: 'app-notificaciones',
  template: `
    <div class="notificaciones" role="status" aria-live="polite">
      @for (n of servicio.lista(); track n.id) {
        <div class="notificacion notificacion-{{ n.tipo }}">
          <span>{{ n.texto }}</span>
          <button type="button" class="notificacion-cerrar" aria-label="Cerrar aviso" (click)="servicio.cerrar(n.id)">✕</button>
        </div>
      }
    </div>
  `,
})
export class Notificaciones {
  protected readonly servicio = inject(NotificacionService);
}
