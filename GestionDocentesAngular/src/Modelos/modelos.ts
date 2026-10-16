export type Rol = "USER" | "ADMIN";
export type EstadoUsuario =
  "PENDIENTE" | "APROBADO" | "RECHAZADO" | "BLOQUEADO";
export type EstadoDocente = "ACTIVO" | "INACTIVO";
export type EstadoPeriodo = "PLANIFICADO" | "ACTIVO" | "CERRADO";
export interface AuthResponse {
  token: string;
  rol: Rol;
  id: number;
  nombre: string;
  correo: string;
}
export interface Usuario {
  id: number;
  nombre: string;
  cedula?: string;
  telefono?: string;
  correo: string;
  rol: Rol;
  estado: EstadoUsuario;
  verificado: boolean;
  fechaRegistro: string;
}
export interface Docente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  correoInstitucional: string;
  telefono: string;
  titulo: string;
  fechaIngreso: string;
  estado: EstadoDocente;
}
export interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  horasSemanales: number;
  activa: boolean;
}
export interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
}
export interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPeriodo;
}
export interface Asignacion {
  id: number;
  docenteId: number;
  docente: string;
  asignaturaId: number;
  asignatura: string;
  carreraId: number;
  carrera: string;
  periodoId: number;
  periodo: string;
  paralelo: string;
  horasAsignadas: number;
}
