import { useEffect, useState } from 'react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Campo from '../components/Campo'
import Mensaje from '../components/Mensaje'
import { fecha } from '../utils/formato'

const VACIO = { tipo: 'ENTRADA', productoId: '', cantidad: '', motivo: '' }

export default function Movimientos() {
  const { esAdmin } = useAuth()
  const [lista, setLista] = useState([])
  const [productos, setProductos] = useState([])
  const [filtroProducto, setFiltroProducto] = useState('')
  const [form, setForm] = useState(VACIO)
  const [modal, setModal] = useState(false)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState({})

  const cargarMovimientos = (productoId = filtroProducto) =>
    api.get(`/movimientos${productoId ? `?productoId=${productoId}` : ''}`)
      .then(setLista)
      .catch((e) => setMensaje({ tipo: 'error', texto: e.message }))

  const cargarProductos = () => api.get('/productos').then(setProductos).catch(() => {})

  useEffect(() => {
    cargarProductos()
  }, [])

  useEffect(() => {
    cargarMovimientos(filtroProducto)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroProducto])

  const productoElegido = productos.find((p) => String(p.id) === form.productoId)
  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  function abrirNuevo() {
    setForm(VACIO); setErrores({}); setModal(true)
  }

  function validar() {
    const e = {}
    if (!form.productoId) e.productoId = 'Seleccione un producto'
    if (!/^\d+$/.test(form.cantidad) || Number(form.cantidad) < 1) e.cantidad = 'Ingrese una cantidad entera mayor a 0'
    else if (form.tipo === 'SALIDA' && productoElegido && Number(form.cantidad) > productoElegido.stock)
      e.cantidad = `Stock insuficiente (disponible: ${productoElegido.stock})`
    if (form.motivo.length > 200) e.motivo = 'Máximo 200 caracteres'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function guardar(ev) {
    ev.preventDefault()
    if (!validar()) return
    try {
      await api.post('/movimientos', {
        tipo: form.tipo,
        productoId: Number(form.productoId),
        cantidad: Number(form.cantidad),
        motivo: form.motivo,
      })
      setModal(false)
      setMensaje({ tipo: 'exito', texto: 'Movimiento registrado y stock actualizado' })
      cargarMovimientos()
      cargarProductos()
    } catch (e) {
      setErrores({ ...e.errores, general: e.message })
    }
  }

  async function anular(m) {
    if (!window.confirm(`¿Anular este movimiento? Se revertirá el stock de "${m.producto.nombre}".`)) return
    try {
      await api.delete(`/movimientos/${m.id}`)
      setMensaje({ tipo: 'exito', texto: 'Movimiento anulado y stock revertido' })
      cargarMovimientos()
      cargarProductos()
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  return (
    <>
      <div className="encabezado">
        <h1>Movimientos de inventario</h1>
        <button className="btn btn-primario" onClick={abrirNuevo}>+ Registrar movimiento</button>
      </div>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} onCerrar={() => setMensaje({})} />

      <section className="panel">
        <select className="buscador" value={filtroProducto} onChange={(e) => setFiltroProducto(e.target.value)}>
          <option value="">Todos los productos</option>
          {productos.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>)}
        </select>
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th><th>Tipo</th><th>Producto</th><th className="num">Cantidad</th>
                <th>Motivo</th><th>Registrado por</th>{esAdmin && <th className="acciones">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {lista.map((m) => (
                <tr key={m.id}>
                  <td>{fecha(m.fecha)}</td>
                  <td>
                    <span className={`etiqueta ${m.tipo === 'ENTRADA' ? 'etiqueta-ok' : 'etiqueta-aviso'}`}>
                      {m.tipo === 'ENTRADA' ? '↓ Entrada' : '↑ Salida'}
                    </span>
                  </td>
                  <td>{m.producto.codigo} — {m.producto.nombre}</td>
                  <td className="num">{m.cantidad}</td>
                  <td>{m.motivo}</td>
                  <td>{m.usuario.nombre}</td>
                  {esAdmin && (
                    <td className="acciones">
                      <button className="btn btn-peligro" onClick={() => anular(m)}>Anular</button>
                    </td>
                  )}
                </tr>
              ))}
              {lista.length === 0 && <tr><td colSpan={7} className="vacio">No hay movimientos registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal titulo="Registrar movimiento" abierto={modal} onCerrar={() => setModal(false)}>
        <form onSubmit={guardar} noValidate>
          <Mensaje texto={errores.general} />
          <div className="selector-tipo">
            {['ENTRADA', 'SALIDA'].map((t) => (
              <button
                type="button"
                key={t}
                className={form.tipo === t ? 'activo' : ''}
                onClick={() => setForm({ ...form, tipo: t })}
              >
                {t === 'ENTRADA' ? '↓ Entrada (compra)' : '↑ Salida (venta)'}
              </button>
            ))}
          </div>
          <Campo etiqueta="Producto *" error={errores.productoId}>
            <select value={form.productoId} onChange={cambiar('productoId')}>
              <option value="">Seleccione…</option>
              {productos.filter((p) => p.activo).map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} — {p.nombre} (stock: {p.stock})</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Cantidad *" error={errores.cantidad}>
            <input type="number" min="1" value={form.cantidad} onChange={cambiar('cantidad')} />
          </Campo>
          <Campo etiqueta="Motivo" error={errores.motivo}>
            <input
              placeholder={form.tipo === 'ENTRADA' ? 'Ej.: Compra factura 001-245' : 'Ej.: Venta al cliente'}
              value={form.motivo}
              onChange={cambiar('motivo')}
            />
          </Campo>
          {productoElegido && /^\d+$/.test(form.cantidad) &&
            (form.tipo === 'ENTRADA' || Number(form.cantidad) <= productoElegido.stock) && (
            <p className="texto-suave">
              Stock actual: <strong>{productoElegido.stock}</strong> → quedará en{' '}
              <strong>
                {form.tipo === 'ENTRADA'
                  ? productoElegido.stock + Number(form.cantidad)
                  : productoElegido.stock - Number(form.cantidad)}
              </strong>
            </p>
          )}
          <div className="modal-pie">
            <button type="button" className="btn btn-claro" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primario">Registrar</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
