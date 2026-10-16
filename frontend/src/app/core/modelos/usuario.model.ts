export type Rol = 'ADMIN' | 'TECNICO';

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  ultimoAcceso: string | null;
  fechaRegistro: string;
}

export interface UsuarioRequest {
  username: string;
  nombre: string;
  correo: string;
  password: string;
  rol: Rol;
}

/** Version corta de un usuario TECNICO, para el desplegable "tecnico asignado". */
export interface Tecnico {
  id: number;
  nombre: string;
}
