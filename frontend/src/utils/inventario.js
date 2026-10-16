// Reglas para clasificar el estado de un producto (se usan en varias pantallas).
// 📌 Clasifica un producto: ok, bajo (stock <= mínimo), sin-stock o inactivo
export function estadoProducto(p) {
  if (!p.activo) return 'inactivo'
  if (p.stock === 0) return 'sin-stock'
  if (p.stock <= p.stockMinimo) return 'bajo'
  return 'ok'
}

export const ESTADOS = {
  ok: { texto: 'En stock', clase: 'etiqueta-ok', color: '#1b9a4b' },
  bajo: { texto: 'Stock bajo', clase: 'etiqueta-aviso', color: '#e3a008' },
  'sin-stock': { texto: 'Sin stock', clase: 'etiqueta-peligro', color: '#dc2626' },
  inactivo: { texto: 'No activo', clase: 'etiqueta-gris', color: '#c4cad4' },
}

/** Productos activos que necesitan reabastecerse, del más crítico al menos crítico. */
export function porReabastecer(productos) {
  return productos
    .filter((p) => p.activo && p.stock <= p.stockMinimo)
    .sort((a, b) => a.stock / (a.stockMinimo || 1) - b.stock / (b.stockMinimo || 1))
}
