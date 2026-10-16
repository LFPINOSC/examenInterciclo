
// 📌 Tarjeta con ícono, título, número grande y detalle
export default function Kpi({ color, icono: Icono, titulo, valor, detalle }) {
  return (
    <div className={`kpi ${color}`}>
      <div className="kpi-icono"><Icono size={26} /></div>
      <div>
        <span>{titulo}</span>
        <strong>{valor}</strong>
        <small>{detalle}</small>
      </div>
    </div>
  )
}
