import { Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Franja que explica qué puede hacer el EMPLEADO en cada pantalla.
export default function AvisoPermiso({ texto }) {
  const { esAdmin } = useAuth()
  if (esAdmin) return null
  return (
    <div className="aviso-permiso">
      <Lock size={16} /> {texto}
    </div>
  )
}
