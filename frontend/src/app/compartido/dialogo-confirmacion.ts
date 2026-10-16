import { Component, inject } from '@angular/core';
import { ConfirmacionService } from '../core/confirmacion.service';

/** Dialogo unico de confirmacion; se coloca una sola vez en App. */
@Component({
  selector: 'app-dialogo-confirmacion',
  template: `
    @if (servicio.actual(); as d) {
      <div class="fondo-dialogo" (click)="servicio.responder(false)">
        <div class="dialogo" role="alertdialog" aria-modal="true" [attr.aria-label]="d.titulo" (click)="$event.stopPropagation()">
          <h2>{{ d.titulo }}</h2>
          <p>{{ d.mensaje }}</p>
          <div class="acciones">
            <button type="button" class="boton boton-secundario" (click)="servicio.responder(false)">Cancelar</button>
            <button type="button" class="boton boton-peligro" (click)="servicio.responder(true)">{{ d.textoAceptar }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DialogoConfirmacion {
  protected readonly servicio = inject(ConfirmacionService);
}
