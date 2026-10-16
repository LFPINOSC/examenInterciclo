export interface UsuarioSesion {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: 'ADMIN' | 'MEDICO' | 'RECEPCION';
  nombre: string;
}

export interface Sesion {
  token: string;
  user: UsuarioSesion;
}

export interface Paciente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
}

export interface Habitacion {
  id: number;
  numero: string;
  piso: number;
  tipo: 'GENERAL' | 'UCI' | 'PEDIATRIA' | 'AISLAMIENTO';
  estado: 'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO';
  descripcion: string;
  pacienteNombre: string | null;
  hospitalizacionCodigo: string | null;
}

export interface Hospitalizacion {
  id: number;
  codigo: string;
  fechaIngreso: string;
  fechaAlta: string | null;
  diagnosticoIngreso: string;
  diagnosticoAlta: string;
  motivoAlta: string;
  estado: 'ACTIVA' | 'ALTA';
  observaciones: string;
  medicoResponsable: string;
  pacienteId: number;
  pacienteCedula: string;
  pacienteNombre: string;
  habitacionId: number;
  habitacionNumero: string;
  habitacionPiso: number;
  habitacionTipo: string;
}

export interface Resumen {
  pacientes: number;
  activas: number;
  disponibles: number;
  ocupadas: number;
  habitaciones: number;
}

export interface Movimiento {
  id: number;
  codigo: string;
  fechaIngreso: string;
  diagnosticoIngreso: string;
  estado: string;
  pacienteNombre: string;
  habitacionNumero: string;
  medicoNombre: string;
}

export interface CamaPanel {
  id: number;
  numero: string;
  piso: number;
  tipo: string;
  estado: string;
  pacienteNombre: string | null;
}

export type Panel =
  | { tipo: 'admin'; resumen: Resumen; recientes: Movimiento[]; habitaciones: CamaPanel[] }
  | { tipo: 'recepcion'; libres: CamaPanel[]; activas: Movimiento[] }
  | { tipo: 'medico'; activas: Movimiento[] };
