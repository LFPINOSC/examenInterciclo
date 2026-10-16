import { Injectable, signal } from '@angular/core';
export interface Aviso { tipo: 'bien' | 'error'; mensaje: string; id: number }
@Injectable({providedIn:'root'})
export class NotificacionesService {
  readonly aviso = signal<Aviso|null>(null);
  private secuencia = 0;
  exito(mensaje: string): void {this.aviso.set({tipo:'bien',mensaje,id:++this.secuencia});}
  error(mensaje: string): void {this.aviso.set({tipo:'error',mensaje,id:++this.secuencia});}
  cerrar(): void {this.aviso.set(null);}
}
