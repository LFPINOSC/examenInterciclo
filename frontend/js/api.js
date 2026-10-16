// Cliente HTTP único para toda la app. Todas las pantallas llaman a la API
// a través de esta función: agrega el token, convierte JSON y unifica errores.
export const API_URL = 'http://localhost:3000/api';

export function guardarSesion(token, usuario) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('usuario', JSON.stringify(usuario));
}

export function obtenerSesion() {
  const token = sessionStorage.getItem('token');
  const usuario = sessionStorage.getItem('usuario');
  return token && usuario ? { token, usuario: JSON.parse(usuario) } : null;
}

export function cerrarSesion() {
  sessionStorage.clear();
  location.replace('index.html');
}

export async function api(ruta, { metodo = 'GET', datos } = {}) {
  const sesion = obtenerSesion();
  const headers = { 'Content-Type': 'application/json' };
  if (sesion) headers.Authorization = `Bearer ${sesion.token}`;

  let respuesta;
  try {
    respuesta = await fetch(API_URL + ruta, {
      method: metodo,
      headers,
      body: datos ? JSON.stringify(datos) : undefined,
    });
  } catch {
    throw crearError('No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }

  // Token vencido o inválido: volver al login
  if (respuesta.status === 401 && ruta !== '/auth/login') {
    cerrarSesion();
    throw crearError('Su sesión expiró');
  }
  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw crearError(cuerpo.error || `Error ${respuesta.status}`, cuerpo.detalles);
  return cuerpo;
}

function crearError(mensaje, detalles = []) {
  const err = new Error(mensaje);
  err.detalles = detalles || [];
  return err;
}
