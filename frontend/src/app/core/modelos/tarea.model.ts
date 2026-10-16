export interface Tarea {
  id: number;
  ordenId: number;
  descripcion: string;
  horas: number;
  costo: number;
  completada: boolean;
}

export interface TareaRequest {
  descripcion: string;
  horas: number;
  costo: number;
  completada: boolean;
}
