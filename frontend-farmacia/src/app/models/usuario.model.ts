export interface Usuario {
  id?: number;
  username: string; // Puede ser su correo o nombre de usuario
  password?: string;
  rol?: 'ROLE_ADMIN' | 'ROLE_FARMACEUTICO' | 'ROLE_CAJERO' | 'ROLE_CLIENTE';
}

export interface AuthResponse {
  token: string;
}