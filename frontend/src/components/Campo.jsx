// Campo de formulario con etiqueta y mensaje de error debajo.
// 📌 Etiqueta + input + mensaje de error en rojo
export default function Campo({ etiqueta, error, children }) {
  return (
    <label className={`campo ${error ? 'campo-error' : ''}`}>
      <span>{etiqueta}</span>
      {children}
      {error && <small className="error-texto">{error}</small>}
    </label>
  )
}
