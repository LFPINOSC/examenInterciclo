import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../api/api'
import Modal from '../components/Modal'
import Campo from '../components/Campo'
import Mensaje from '../components/Mensaje'
import BotonAdmin from '../components/BotonAdmin'
import AvisoPermiso from '../components/AvisoPermiso'
import { dinero } from '../utils/formato'
import { ESTADOS, estadoProducto } from '../utils/inventario'

const VACIO = {
  codigo: '', nombre: '', descripcion: '', precioCompra: '', precioVenta: '',
  stock: '0', stockMinimo: '0', categoriaId: '', proveedorId: '', activo: true,
}

export default function Productos() {
  const [params, setParams] = useSearchParams()
  const [lista, setLista] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [buscar, setBuscar] = useState(params.get('buscar') || '')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroEstado, setFiltroEstado] = useState(params.get('estado') || '')
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

  // Si se llega desde el buscador superior o desde "Nuevo producto" del dashboard
  useEffect(() => {
    setBuscar(params.get('buscar') || '')
    if (params.get('estado')) setFiltroEstado(params.get('estado'))
    if (params.get('nuevo')) {
      abrirNuevo()
      setParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  // Búsqueda en el servidor con un pequeño retraso para no consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(() => cargar(buscar.trim()), 300)
    return () => clearTimeout(t)
  }, [buscar])

  // Filtros por categoría y estado (en el navegador, sobre la lista ya cargada)
  const visibles = useMemo(
    () => lista.filter((p) =>
      (!filtroCategoria || String(p.categoria.id) === filtroCategoria) &&
      (!filtroEstado || (filtroEstado === 'bajo'
        ? ['bajo', 'sin-stock'].includes(estadoProducto(p))
        : estadoProducto(p) === filtroEstado)))
      .sort((a, b) => a.codigo.localeCompare(b.codigo)),
    [lista, filtroCategoria, filtroEstado],
  )

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
        <div>
          <h1>Productos</h1>
          <p>Catálogo completo de la tienda con su stock actual.</p>
        </div>
        <BotonAdmin icono={<Plus size={17} />} onClick={abrirNuevo}>Nuevo producto</BotonAdmin>
      </div>
      <AvisoPermiso texto="Como empleado puedes consultar los productos. Para cambiar el stock registra una entrada o salida en Movimientos." />
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} onCerrar={() => setMensaje({})} />

      <section className="panel">
        <div className="filtros">
          <input placeholder="Buscar por nombre o código…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="ok">En stock</option>
            <option value="bajo">Por reabastecer</option>
            <option value="sin-stock">Sin stock</option>
            <option value="inactivo">No activos</option>
          </select>
          <span className="conteo">{visibles.length} de {lista.length} productos</span>
        </div>
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Nombre</th><th>Categoría</th><th>Proveedor</th>
                <th className="num">P. compra</th><th className="num">P. venta</th>
                <th className="centro">Stock</th><th>Estado</th><th className="acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => {
                const est = ESTADOS[estadoProducto(p)]
                return (
                  <tr key={p.id} className={p.activo ? '' : 'inactivo'}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria.nombre}</td>
                    <td>{p.proveedor.razonSocial}</td>
                    <td className="num">{dinero(p.precioCompra)}</td>
                    <td className="num">{dinero(p.precioVenta)}</td>
                    <td className="centro">{p.stock} <small className="texto-suave">/ {p.stockMinimo}</small></td>
                    <td><span className={`etiqueta ${est.clase}`}>{est.texto}</span></td>
                    <td className="acciones">
                      <BotonAdmin className="btn btn-secundario" icono={<Pencil size={15} />} onClick={() => abrirEditar(p)}>Editar</BotonAdmin>
                      <BotonAdmin className="btn btn-peligro" icono={<Trash2 size={15} />} onClick={() => eliminar(p)}>Eliminar</BotonAdmin>
                    </td>
                  </tr>
                )
              })}
              {visibles.length === 0 && <tr><td colSpan={9} className="vacio">No se encontraron productos</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal titulo={editandoId ? 'Editar producto' : 'Nuevo producto'} abierto={modal} onCerrar={() => setModal(false)}>
        <form onSubmit={guardar} noValidate>
          <Mensaje texto={errores.general} />
          <div className="rejilla">
            <Campo etiqueta="Código *" error={errores.codigo}>
              <input value={form.codigo} onChange={cambiar('codigo')} placeholder="Ej.: BEB-010" />
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
            <Campo etiqueta={editandoId ? 'Stock (cambia con Movimientos)' : 'Stock inicial *'} error={errores.stock}>
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
