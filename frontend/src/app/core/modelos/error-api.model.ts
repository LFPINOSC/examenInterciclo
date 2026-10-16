/** Formato de error unico de la API (ErrorResponse). */
export interface ErrorApi {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  path: string;
  errores?: Record<string, string>;
}
