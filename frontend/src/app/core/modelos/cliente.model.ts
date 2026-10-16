export interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
}

export type ClienteRequest = Omit<Cliente, 'id'>;
