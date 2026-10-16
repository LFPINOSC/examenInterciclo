import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogoConfirmacion } from './compartido/dialogo-confirmacion';
import { Encabezado } from './compartido/encabezado';
import { Notificaciones } from './compartido/notificaciones';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Encabezado, Notificaciones, DialogoConfirmacion],
  template: `
    <app-encabezado />
    <main class="contenido">
      <router-outlet />
    </main>
    <app-notificaciones />
    <app-dialogo-confirmacion />
  `,
})
export class App {}
