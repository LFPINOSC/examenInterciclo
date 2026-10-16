import { Tarea } from './tarea.model';

export type EstadoOrden = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA';

export interface Orden {
  id: number;
  codigo: string;
  clienteId: number;
  cliente: string;
  equipoId: number;
  equipo: string;
  tecnicoId: number | null;
  tecnico: string | null;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoOrden;
  fechaIngreso: string;
  fechaEntrega: string | null;
  costoTotal: number;
  tareas: Tarea[];
}

export interface OrdenRequest {
  clienteId: number;
  equipoId: number;
  tecnicoId: number | null;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoOrden;
  fechaIngreso: string | null;
  fechaEntrega: string | null;
}

/** Cantidad de ordenes por estado (tablero de inicio). */
export interface Resumen {
  porEstado: Record<EstadoOrden, number>;
}
