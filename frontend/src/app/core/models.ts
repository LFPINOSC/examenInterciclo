export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "USUARIO";
  activo?: boolean;
}
export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
export interface Hotel {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  descripcion: string;
}
export interface Tipo {
  id: number;
  nombre: string;
  descripcion: string;
}
export interface Habitacion {
  id: number;
  hotelId: number;
  tipoId: number;
  numero: string;
  precioNoche: number;
  capacidad: number;
  activa: boolean;
  hotel: string;
  ciudad: string;
  tipo: string;
}
export interface Reserva {
  id: number;
  usuarioId: number;
  habitacionId: number;
  entrada: string;
  salida: string;
  huespedes: number;
  precioNoche: number;
  total: number;
  estado: string;
  usuario: string;
  email: string;
  numero: string;
  hotel: string;
}
