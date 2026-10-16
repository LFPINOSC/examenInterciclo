export type Rol = 'ADMIN' | 'CLIENTE';
export type TipoEquipo = 'LAPTOP' | 'PC_ESCRITORIO' | 'IMPRESORA' | 'OTRO';
export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type EstadoTicket = 'PENDIENTE' | 'ASIGNADO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';

export interface Usuario { id: number; nombre: string; apellido: string; correo: string; telefono: string | null; rol: Rol; activo: boolean; }
export interface Tecnico { id: number; nombre: string; apellido: string; especialidad: string; telefono: string | null; activo: boolean; }
export interface Equipo { id: number; tipo: TipoEquipo; marca: string; modelo: string; numeroSerie: string | null; descripcion: string | null; activo: boolean; cliente: Usuario; }
export interface Servicio { id: number; nombre: string; descripcion: string | null; precio: number; activo: boolean; }
export interface DetalleServicio { id: number; servicioId: number; servicio: string; precioAplicado: number; observacion: string | null; }
export interface Ticket {
 id: number; equipo: Equipo; tecnico: Tecnico | null; descripcionProblema: string; diagnostico: string | null;
 solucion: string | null; prioridad: Prioridad; estado: EstadoTicket; fechaCreacion: string;
 fechaActualizacion: string; fechaCierre: string | null; servicios: DetalleServicio[]; total: number;
}
export interface AuthRespuesta { token: string; tipo: string; usuario: Usuario; }
export const TIPOS: TipoEquipo[] = ['LAPTOP','PC_ESCRITORIO','IMPRESORA','OTRO'];
export const PRIORIDADES: Prioridad[] = ['BAJA','MEDIA','ALTA','URGENTE'];
export const ESTADOS: EstadoTicket[] = ['PENDIENTE','ASIGNADO','EN_PROCESO','RESUELTO','CERRADO'];
export function nombreCompleto(u: {nombre:string;apellido:string} | null | undefined): string {return u ? `${u.nombre} ${u.apellido}` : 'Sin asignar';}
export function tituloEquipo(e: Equipo): string {return `${e.marca} ${e.modelo}`;}
export function codigoTicket(id: number): string {return `TS-${String(id).padStart(4,'0')}`;}
export const TIPO_NOMBRE: Record<TipoEquipo,string> = {LAPTOP:'Laptop',PC_ESCRITORIO:'PC de escritorio',IMPRESORA:'Impresora',OTRO:'Otro dispositivo'};
export const ESTADO_NOMBRE: Record<EstadoTicket,string> = {PENDIENTE:'Pendiente',ASIGNADO:'Asignado',EN_PROCESO:'En proceso',RESUELTO:'Resuelto',CERRADO:'Cerrado'};
