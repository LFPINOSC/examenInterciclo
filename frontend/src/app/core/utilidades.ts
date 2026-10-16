import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ErrorApi, EstadoOrden, Prioridad } from './modelos';

/** URL base de la API REST (Spring Boot). */
export const API_URL = 'http://localhost:8080/api';

export const ESTADOS: Record<EstadoOrden, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};
export const LISTA_ESTADOS = Object.keys(ESTADOS) as EstadoOrden[];

export const PRIORIDADES: Record<Prioridad, string> = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' };
export const LISTA_PRIORIDADES = Object.keys(PRIORIDADES) as Prioridad[];

/** Convierte cualquier error HTTP en un mensaje para mostrar al usuario. */
export function mensajeError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con la API. Verifique que este encendida en http://localhost:8080.';
    }
    const cuerpo = err.error as Partial<ErrorApi> | null;
    if (cuerpo?.errores) {
      return Object.values(cuerpo.errores).join('. ');
    }
    if (cuerpo?.mensaje) {
      return cuerpo.mensaje;
    }
    return `Error ${err.status}: ${err.statusText}`;
  }
  return 'Ocurrio un error inesperado.';
}

/** Cedula ecuatoriana: 10 digitos, provincia 01-24 y digito verificador (modulo 10). Misma regla que la API. */
export function cedulaValida(control: AbstractControl): ValidationErrors | null {
  const c = String(control.value ?? '');
  if (!c) {
    return null; // "obligatorio" lo valida Validators.required
  }
  if (!/^\d{10}$/.test(c)) {
    return { cedula: 'La cedula debe tener 10 digitos' };
  }
  const provincia = Number(c.slice(0, 2));
  if (provincia < 1 || provincia > 24 || Number(c[2]) > 5) {
    return { cedula: 'La cedula no es valida' };
  }
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let n = Number(c[i]) * (i % 2 === 0 ? 2 : 1);
    if (n > 9) {
      n -= 9;
    }
    suma += n;
  }
  return (10 - (suma % 10)) % 10 === Number(c[9]) ? null : { cedula: 'La cedula no es valida' };
}

/** Contrasena: minimo 8 caracteres con letras y numeros (igual que la API). Vacia = valida (campo opcional). */
export function passwordFuerte(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '');
  if (!v) {
    return null;
  }
  return v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)
    ? null
    : { password: 'Minimo 8 caracteres, con letras y numeros' };
}

/** Mensaje de error de un control para mostrarlo bajo el campo (solo si fue tocado). */
export function errorCampo(control: AbstractControl, etiqueta: string): string {
  if (!control.touched || !control.errors) {
    return '';
  }
  const e = control.errors;
  if (e['required']) return `${etiqueta} es obligatorio.`;
  if (e['maxlength']) return `${etiqueta} supera el maximo de ${e['maxlength'].requiredLength} caracteres.`;
  if (e['email']) return 'El correo no es valido.';
  if (e['pattern']) return `${etiqueta} no tiene un formato valido.`;
  if (e['min']) return `${etiqueta} no puede ser negativo.`;
  if (e['cedula']) return e['cedula'];
  if (e['password']) return e['password'];
  return `${etiqueta} no es valido.`;
}
