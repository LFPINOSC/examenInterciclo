import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import Mensaje from '../components/Mensaje'
import { dinero } from '../utils/formato'

export default function Dashboard() {
  const [resumen, setResumen] = useState(null)
  const [stockBajo, setStockBajo] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/resumen'), api.get('/productos/stock-bajo')])
      .then(([r, s]) => {
        setResumen(r)
        setStockBajo(s)
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <>
      <div className="encabezado">
        <h1>Resumen del inventario</h1>
      </div>
      <Mensaje texto={error} />

      {resumen && (
        <div className="tarjetas">
          <div className="tarjeta"><span>Productos</span><strong>{resumen.totalProductos}</strong></div>
          <div className="tarjeta"><span>Categorías</span><strong>{resumen.totalCategorias}</strong></div>
          <div className="tarjeta"><span>Proveedores</span><strong>{resumen.totalProveedores}</strong></div>
          <div className="tarjeta alerta"><span>Con stock bajo</span><strong>{resumen.productosStockBajo}</strong></div>
          <div className="tarjeta"><span>Valor del inventario</span><strong>{dinero(resumen.valorInventario)}</strong></div>
        </div>
      )}

      <section className="panel">
        <div className="panel-cabecera">
          <h2>Productos por reabastecer</h2>
          <Link to="/movimientos" className="btn btn-secundario">Registrar entrada</Link>
        </div>
        {stockBajo.length === 0 ? (
          <p className="texto-suave">Todos los productos tienen stock suficiente.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Código</th><th>Producto</th><th>Stock</th><th>Mínimo</th><th>Proveedor</th></tr>
            </thead>
            <tbody>
              {stockBajo.map((p) => (
                <tr key={p.id}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td><span className="etiqueta etiqueta-peligro">{p.stock}</span></td>
                  <td>{p.stockMinimo}</td>
                  <td>{p.proveedor.razonSocial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
