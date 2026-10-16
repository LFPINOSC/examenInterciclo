import { Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * Botón para acciones exclusivas del ADMIN.
 * Si el usuario es EMPLEADO, el botón se muestra BLOQUEADO (con candado) en lugar de
 * esconderse, para que se vea claramente qué cosas no puede hacer.
 * Ojo: esto es solo visual; la protección real está en el backend (SecurityConfig).
 */
export default function BotonAdmin({ className = 'btn btn-primario', icono, children, onClick, ...resto }) {
  const { esAdmin } = useAuth()

  if (!esAdmin) {
    return (
      <button type="button" className={`${className} bloqueado`} disabled title="Solo el administrador puede hacer esto" {...resto}>
        <Lock size={15} /> {children}
      </button>
    )
  }
  return (
    <button type="button" className={className} onClick={onClick} {...resto}>
      {icono} {children}
    </button>
  )
}
