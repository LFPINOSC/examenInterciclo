// 📌 Círculo con las iniciales del usuario (ej.: Kevin Marca -> KM)
export default function Avatar({ nombre = '' }) {
  const iniciales = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
  return <div className="avatar">{iniciales || '?'}</div>
}
