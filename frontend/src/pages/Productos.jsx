import { useEffect, useState } from 'react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Campo from '../components/Campo'
import Mensaje from '../components/Mensaje'
import { dinero } from '../utils/formato'

const VACIO = {
  codigo: '', nombre: '', descripcion: '', precioCompra: '', precioVenta: '',
  stock: '0', stockMinimo: '0', categoriaId: '', proveedorId: '', activo: true,
}

export default function Productos() {
  const { esAdmin } = useAuth()
  const [lista, setLista] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [buscar, setBuscar] = useState('')
  const [form, setForm] = useState(VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [modal, setModal] = useState(false)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState({})

  const cargar = (texto = '') =>
    api.get(`/productos${texto ? `?buscar=${encodeURIComponent(texto)}` : ''}`)
      .then(setLista)
      .catch((e) => setMensaje({ tipo: 'error', texto: e.message }))

  useEffect(() => {
    api.get('/categorias').then(setCategorias).catch(() => {})
    api.get('/proveedores').then(setProveedores).catch(() => {})
  }, [])

  // Carga inicial y búsqueda con pequeño retraso para no consultar al servidor en cada tecla
  useEffect(() => {
    const t = setTimeout(() => cargar(buscar.trim()), 300)
    return () => clearTimeout(t)
  }, [buscar])

  const cambiar = (campo) => (e) =>
    setForm({ ...form, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  function abrirNuevo() {
    setForm(VACIO); setEditandoId(null); setErrores({}); setModal(true)
  }

  function abrirEditar(p) {
    setForm({
      codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion || '',
      precioCompra: String(p.precioCompra), precioVenta: String(p.precioVenta),
      stock: String(p.stock), stockMinimo: String(p.stockMinimo),
      categoriaId: String(p.categoria.id), proveedorId: String(p.proveedor.id), activo: p.activo,
    })
    setEditandoId(p.id); setErrores({}); setModal(true)
  }

  function validar() {
    const e = {}
    const compra = Number(form.precioCompra)
    const venta = Number(form.precioVenta)
    if (!form.codigo.trim()) e.codigo = 'El código es obligatorio'
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (form.precioCompra === '' || isNaN(compra) || compra < 0) e.precioCompra = 'Ingrese un precio válido (≥ 0)'
    if (form.precioVenta === '' || isNaN(venta) || venta <= 0) e.precioVenta = 'Ingrese un precio válido (> 0)'
    else if (!e.precioCompra && venta < compra) e.precioVenta = 'No puede ser menor al precio de compra'
    if (!/^\d+$/.test(form.stock)) e.stock = 'Número entero ≥ 0'
    if (!/^\d+$/.test(form.stockMinimo)) e.stockMinimo = 'Número entero ≥ 0'
    if (!form.categoriaId) e.categoriaId = 'Seleccione una categoría'
    if (!form.proveedorId) e.proveedorId = 'Seleccione un proveedor'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function guardar(ev) {
    ev.preventDefault()
    if (!validar()) return
    const datos = {
      ...form,
      precioCompra: Number(form.precioCompra),
      precioVenta: Number(form.precioVenta),
      stock: Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
      categoriaId: Number(form.categoriaId),
      proveedorId: Number(form.proveedorId),
    }
    try {
      if (editandoId) await api.put(`/productos/${editandoId}`, datos)
      else await api.post('/productos', datos)
      setModal(false)
      setMensaje({ tipo: 'exito', texto: editandoId ? 'Producto actualizado' : 'Producto creado' })
      cargar(buscar.trim())
    } catch (e) {
      setErrores({ ...e.errores, general: e.message })
    }
  }

  async function eliminar(p) {
    if (!window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) return
    try {
      await api.delete(`/productos/${p.id}`)
      setMensaje({ tipo: 'exito', texto: 'Producto eliminado' })
      cargar(buscar.trim())
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  return (
    <>
      <div className="encabezado">
        <h1>Productos</h1>
        {esAdmin && <button className="btn btn-primario" onClick={abrirNuevo}>+ Nuevo producto</button>}
      </div>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} onCerrar={() => setMensaje({})} />

      <section className="panel">
        <input
          className="buscador"
          placeholder="Buscar por nombre o código…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Nombre</th><th>Categoría</th><th>Proveedor</th>
                <th className="num">P. compra</th><th className="num">P. venta</th><th className="num">Stock</th><th>Estado</th>
                {esAdmin && <th className="acciones">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} className={p.activo ? '' : 'inactivo'}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria.nombre}</td>
                  <td>{p.proveedor.razonSocial}</td>
                  <td className="num">{dinero(p.precioCompra)}</td>
                  <td className="num">{dinero(p.precioVenta)}</td>
                  <td className="num">
                    <span className={`etiqueta ${p.stockBajo ? 'etiqueta-peligro' : 'etiqueta-ok'}`}>{p.stock}</span>
                  </td>
                  <td>{p.activo ? 'Activo' : 'Inactivo'}</td>
                  {esAdmin && (
                    <td className="acciones">
                      <button className="btn btn-secundario" onClick={() => abrirEditar(p)}>Editar</button>
                      <button className="btn btn-peligro" onClick={() => eliminar(p)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
              {lista.length === 0 && <tr><td colSpan={9} className="vacio">No se encontraron productos</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal titulo={editandoId ? 'Editar producto' : 'Nuevo producto'} abierto={modal} onCerrar={() => setModal(false)}>
        <form onSubmit={guardar} noValidate>
          <Mensaje texto={errores.general} />
          <div className="rejilla">
            <Campo etiqueta="Código *" error={errores.codigo}>
              <input value={form.codigo} onChange={cambiar('codigo')} />
            </Campo>
            <Campo etiqueta="Nombre *" error={errores.nombre}>
              <input value={form.nombre} onChange={cambiar('nombre')} />
            </Campo>
          </div>
          <Campo etiqueta="Descripción" error={errores.descripcion}>
            <input value={form.descripcion} onChange={cambiar('descripcion')} />
          </Campo>
          <div className="rejilla">
            <Campo etiqueta="Precio de compra *" error={errores.precioCompra}>
              <input type="number" step="0.01" min="0" value={form.precioCompra} onChange={cambiar('precioCompra')} />
            </Campo>
            <Campo etiqueta="Precio de venta *" error={errores.precioVenta}>
              <input type="number" step="0.01" min="0" value={form.precioVenta} onChange={cambiar('precioVenta')} />
            </Campo>
            <Campo etiqueta={editandoId ? 'Stock (use Movimientos)' : 'Stock inicial *'} error={errores.stock}>
              <input type="number" min="0" value={form.stock} onChange={cambiar('stock')} disabled={!!editandoId} />
            </Campo>
            <Campo etiqueta="Stock mínimo *" error={errores.stockMinimo}>
              <input type="number" min="0" value={form.stockMinimo} onChange={cambiar('stockMinimo')} />
            </Campo>
            <Campo etiqueta="Categoría *" error={errores.categoriaId}>
              <select value={form.categoriaId} onChange={cambiar('categoriaId')}>
                <option value="">Seleccione…</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Proveedor *" error={errores.proveedorId}>
              <select value={form.proveedorId} onChange={cambiar('proveedorId')}>
                <option value="">Seleccione…</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
              </select>
            </Campo>
          </div>
          <label className="check">
            <input type="checkbox" checked={form.activo} onChange={cambiar('activo')} /> Producto activo
          </label>
          <div className="modal-pie">
            <button type="button" className="btn btn-claro" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primario">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
