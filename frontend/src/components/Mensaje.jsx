import { X } from 'lucide-react'

export default function Mensaje({ tipo = 'error', texto, onCerrar }) {
  if (!texto) return null
  return (
    <div className={`mensaje mensaje-${tipo}`}>
      <span>{texto}</span>
      {onCerrar && <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar"><X size={16} /></button>}
    </div>
  )
}
