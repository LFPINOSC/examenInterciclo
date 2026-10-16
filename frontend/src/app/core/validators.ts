import { AbstractControl, ValidationErrors } from '@angular/forms';
import { cedulaValida } from './etiquetas';

export function cedulaEcuatoriana(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '').trim();
  if (!valor) return null;
  return cedulaValida(valor) ? null : { cedula: true };
}

export function telefonoEcuador(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '').replace(/\D/g, '');
  if (!valor) return null;
  return valor.length >= 7 && valor.length <= 10 ? null : { telefono: true };
}
