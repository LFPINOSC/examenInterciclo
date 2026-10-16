import { createContext, useContext, useState } from 'react'
import { api } from '../api/api'

// Guarda quién inició sesión y lo comparte con toda la aplicación.
const AuthContext = createContext(null)

function leerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem('usuario'))
  } catch {
    return null
  }
}

// 📌 Context = "variable global" de React: comparte quién inició sesión con toda la app
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado)

  // Llama al login del backend y guarda token + usuario en localStorage
  async function iniciarSesion(username, password) {
    const datos = await api.post('/auth/login', { username, password })
    const sesion = { username: datos.username, nombre: datos.nombre, rol: datos.rol }
    localStorage.setItem('token', datos.token)
    localStorage.setItem('usuario', JSON.stringify(sesion))
    setUsuario(sesion)
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const esAdmin = usuario?.rol === 'ADMIN'

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
