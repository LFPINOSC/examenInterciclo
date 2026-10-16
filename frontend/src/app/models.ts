export interface UsuarioSesion {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: 'ADMIN' | 'MEDICO' | 'RECEPCION';
  medicoId: number | null;
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
  fechaNacimiento: string;
  sexo: 'M' | 'F' | 'O';
  telefono: string;
  direccion: string;
  tipoSangre: string;
  alergias: string;
  contactoEmergencia: string;
  telefonoEmergencia: string;
}

export interface Medico {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  telefono: string;
  correo: string;
  usuarioId: number | null;
  usuarioNombre: string | null;
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
  pacienteId: number;
  pacienteCedula: string;
  pacienteNombre: string;
  habitacionId: number;
  habitacionNumero: string;
  habitacionPiso: number;
  habitacionTipo: string;
  medicoId: number;
  medicoNombre: string;
  medicoEspecialidad: string;
  medicoUsuarioId: number | null;
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: 'ADMIN' | 'MEDICO' | 'RECEPCION';
  rolId: number;
  activo: boolean;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface ResumenDashboard {
  pacientes: number;
  medicos: number;
  activas: number;
  altas: number;
  disponibles: number;
  ocupadas: number;
  mantenimiento: number;
  habitaciones: number;
}

export interface Dashboard {
  resumen: ResumenDashboard;
  recientes: Array<{
    id: number;
    codigo: string;
    fechaIngreso: string;
    fechaAlta: string | null;
    diagnosticoIngreso: string;
    estado: string;
    pacienteNombre: string;
    habitacionNumero: string;
    habitacionTipo: string;
    medicoNombre: string;
  }>;
  habitaciones: Array<{
    id: number;
    numero: string;
    piso: number;
    tipo: string;
    estado: string;
    pacienteNombre: string | null;
  }>;
}
