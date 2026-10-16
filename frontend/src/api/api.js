// Cliente HTTP central: todas las peticiones al backend pasan por aquí.
// Agrega el token JWT en la cabecera Authorization y unifica el manejo de errores.

const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(mensaje, estado, errores) {
    super(mensaje)
    this.estado = estado
    this.errores = errores || {}
  }
}

async function peticion(metodo, ruta, cuerpo) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(BASE_URL + ruta, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. ¿Está encendido el backend?', 0)
  }

  // Token vencido o inválido: se cierra la sesión
  if (respuesta.status === 401 && ruta !== '/auth/login') {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.location.href = '/login'
    throw new ApiError('Sesión expirada', 401)
  }

  if (respuesta.status === 204) return null

  const texto = await respuesta.text()
  const datos = texto ? JSON.parse(texto) : null

  if (!respuesta.ok) {
    throw new ApiError(datos?.mensaje || 'Ocurrió un error inesperado', respuesta.status, datos?.errores)
  }
  return datos
}

export const api = {
  get: (ruta) => peticion('GET', ruta),
  post: (ruta, cuerpo) => peticion('POST', ruta, cuerpo),
  put: (ruta, cuerpo) => peticion('PUT', ruta, cuerpo),
  delete: (ruta) => peticion('DELETE', ruta),
}
