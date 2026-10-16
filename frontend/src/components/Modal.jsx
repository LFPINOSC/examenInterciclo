export default function Modal({ titulo, abierto, onCerrar, children }) {
  if (!abierto) return null
  return (
    <div className="modal-fondo" onMouseDown={onCerrar}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-cabecera">
          <h2>{titulo}</h2>
          <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
