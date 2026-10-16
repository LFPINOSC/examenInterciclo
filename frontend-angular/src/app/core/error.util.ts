import { HttpErrorResponse } from '@angular/common/http';
export interface ErrorApi { mensaje: string; campos: Record<string,string> }
export function interpretarError(error: unknown): ErrorApi {
  if (error instanceof HttpErrorResponse) {
    if(error.status === 0) return {mensaje:'No se pudo conectar con Spring Boot. Verifica que esté ejecutándose en el puerto 8080.',campos:{}};
    const body = error.error;
    const campos = body && typeof body === 'object' && body.campos && typeof body.campos === 'object' ? body.campos as Record<string,string> : {};
    const mensaje = body && typeof body.mensaje === 'string' ? body.mensaje : (error.status === 401 ? 'Sesión caducada o credenciales incorrectas.' : error.status === 403 ? 'No tienes permisos para realizar esta acción.' : `No se pudo completar la solicitud (${error.status}).`);
    return {mensaje,campos};
  }
  return {mensaje:'Ocurrió un error inesperado. Intenta nuevamente.',campos:{}};
}
