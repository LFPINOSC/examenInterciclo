export interface Equipo {
  id: number;
  clienteId: number;
  cliente: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  serie: string | null;
}

export interface EquipoRequest {
  clienteId: number;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  serie: string | null;
}
