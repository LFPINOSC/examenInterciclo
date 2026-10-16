import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'ok' | 'error';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  texto: string;
}

/** Avisos breves (toasts) que aparecen en una esquina sin mover el contenido. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  readonly lista = signal<Notificacion[]>([]);
  private siguienteId = 1;

  mostrar(texto: string, tipo: TipoNotificacion = 'ok', duracion = 4000): void {
    const id = this.siguienteId++;
    this.lista.update((lista) => [...lista.slice(-2), { id, tipo, texto }]);
    setTimeout(() => this.cerrar(id), duracion);
  }

  cerrar(id: number): void {
    this.lista.update((lista) => lista.filter((n) => n.id !== id));
  }
}
