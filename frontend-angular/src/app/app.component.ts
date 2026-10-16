import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionesService } from './core/notificaciones.service';

@Component({selector:'app-root',standalone:true,imports:[RouterOutlet],template:`
<router-outlet />
@if (avisos.aviso(); as aviso) {
<div class="toast" [class.toast-error]="aviso.tipo === 'error'" role="status">
 <span class="toast-symbol">{{ aviso.tipo === 'bien' ? '✓' : '!' }}</span>
 <span>{{ aviso.mensaje }}</span>
 <button type="button" class="icon-button" aria-label="Cerrar aviso" (click)="avisos.cerrar()">×</button>
</div>
}`})
export class AppComponent {readonly avisos = inject(NotificacionesService);}
