import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 📌 Sin sesión -> login. Ruta soloAdmin y no eres admin -> inicio
export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, esAdmin } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />
  return children
}
