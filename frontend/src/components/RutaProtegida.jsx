import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Si no hay sesión, redirige al login. Si la ruta es solo para ADMIN, la protege también.
export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, esAdmin } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />
  return children
}
