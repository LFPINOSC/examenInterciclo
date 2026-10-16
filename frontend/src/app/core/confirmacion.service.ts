import { Injectable, signal } from '@angular/core';

export interface PeticionDialogo {
  titulo: string;
  mensaje: string;
  textoAceptar: string;
  responder: (acepta: boolean) => void;
}

/** Reemplaza confirm() del navegador por un dialogo propio. Devuelve true si la persona acepta. */
@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  readonly actual = signal<PeticionDialogo | null>(null);

  confirmar(opciones: { titulo: string; mensaje: string; textoAceptar?: string }): Promise<boolean> {
    return new Promise((resolver) =>
      this.actual.set({ textoAceptar: 'Eliminar', ...opciones, responder: resolver }),
    );
  }

  responder(acepta: boolean): void {
    this.actual()?.responder(acepta);
    this.actual.set(null);
  }
}
